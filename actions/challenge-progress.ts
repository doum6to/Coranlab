"use server";

import { auth } from "@/lib/supabase/server";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import db from "@/db/drizzle";
import { getUserProgress } from "@/db/queries";
import { challengeProgress, challenges, userProgress, weeklyXp, streakActivity } from "@/db/schema";
import { getCurrentWeekStart } from "@/lib/league-utils";
import { maybeJoinLeague } from "@/actions/league";
import { MAX_STREAK_CHARGES, getToday, daysBetween } from "@/lib/streak-utils";

/** XP for an exercise done for the first time, and for one replayed as revision. */
const XP_NEW = 10;
const XP_REVISION = 2;

export type LessonResult = { xp: number; streak: number; streakExtended: boolean };

/**
 * The learner's calendar day ("YYYY-MM-DD" from their device), accepted only within a day of the
 * server's date: a streak follows the learner's own midnight, not UTC's, without letting a
 * tampered clock claim arbitrary days.
 */
function learnerToday(clientDate: string | undefined): string {
  const server = getToday();
  if (!clientDate || !/^\d{4}-\d{2}-\d{2}$/.test(clientDate)) return server;
  return Math.abs(daysBetween(server, clientDate)) <= 1 ? clientDate : server;
}

// Batch complete all challenges at end of lesson
export const completeLessonChallenges = async (challengeIds: number[], clientDate?: string): Promise<LessonResult | undefined> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!challengeIds.length) return;

  const [currentUserProgress, existingProgress] = await Promise.all([
    getUserProgress(),
    db.query.challengeProgress.findMany({
      where: and(
        eq(challengeProgress.userId, userId),
        inArray(challengeProgress.challengeId, challengeIds),
      ),
    }),
  ]);

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  // Filter out already completed challenges
  const existingIds = new Set(existingProgress.map((p) => p.challengeId));
  const newChallengeIds = challengeIds.filter((id) => !existingIds.has(id));

  // Insert new progress entries in batch
  if (newChallengeIds.length > 0) {
    await db.insert(challengeProgress).values(
      newChallengeIds.map((challengeId) => ({
        challengeId,
        userId,
        completed: true,
      }))
    );
  }

  // Calculate streak + charges
  const today = learnerToday(clientDate);
  const lastStreakDate = currentUserProgress.lastStreakDate;
  let newStreak = currentUserProgress.streak;
  let newCharges = currentUserProgress.streakCharges ?? 0;
  const alreadyActiveToday = lastStreakDate === today;

  if (!alreadyActiveToday) {
    if (!lastStreakDate) {
      // First ever lesson
      newStreak = 1;
    } else {
      const missed = daysBetween(lastStreakDate, today) - 1;
      if (missed <= 0) {
        // Consecutive day
        newStreak = newStreak + 1;
      } else {
        // Try to cover missed days with charges
        const cover = Math.min(missed, newCharges);
        newCharges -= cover;
        if (missed - cover > 0) {
          // Streak broken
          newStreak = 1;
        } else {
          // Charges covered the gap, extend streak by 1 for today
          newStreak = newStreak + 1;
        }
      }
    }
  }

  // Earn a charge for completing a lesson (capped at MAX)
  newCharges = Math.min(newCharges + 1, MAX_STREAK_CHARGES);

  // Record activity for today (idempotent)
  await db
    .insert(streakActivity)
    .values({ userId, date: today })
    .onConflictDoNothing();

  // Full XP for exercises done for the first time, a small reward for revising the others.
  const pointsEarned = newChallengeIds.length * XP_NEW + (challengeIds.length - newChallengeIds.length) * XP_REVISION;

  // Update points + streak + charges in one query
  await db.update(userProgress).set({
    points: currentUserProgress.points + pointsEarned,
    streak: newStreak,
    lastStreakDate: today,
    streakCharges: newCharges,
  }).where(eq(userProgress.userId, userId));

  // Track weekly XP (only for new challenges)
  if (pointsEarned > 0) {
    const weekStart = getCurrentWeekStart();
    const existing = await db.query.weeklyXp.findFirst({
      where: and(
        eq(weeklyXp.userId, userId),
        eq(weeklyXp.weekStart, weekStart),
      ),
    });

    if (existing) {
      await db.update(weeklyXp).set({
        xp: existing.xp + pointsEarned,
      }).where(eq(weeklyXp.id, existing.id));
    } else {
      await db.insert(weeklyXp).values({
        userId,
        weekStart,
        xp: pointsEarned,
      });
    }

    // Auto-join league if threshold met
    await maybeJoinLeague(userId, weekStart);
  }

  revalidatePath("/learn");
  revalidatePath("/leaderboard");
  revalidateTag("leaderboard");

  return { xp: pointsEarned, streak: newStreak, streakExtended: !alreadyActiveToday };
};

// Keep single challenge progress for backward compat (unused now)
export const upsertChallengeProgress = async (challengeId: number) => {
  // No-op on server - progress is saved in batch at end of lesson
  return;
};
