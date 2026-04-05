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

// Batch complete all challenges at end of lesson
export const completeLessonChallenges = async (challengeIds: number[]) => {
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
  const today = getToday();
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

  // Fix: only count NEW challenges for points (no XP for repeating)
  const pointsEarned = newChallengeIds.length * 10;

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
};

// Keep single challenge progress for backward compat (unused now)
export const upsertChallengeProgress = async (challengeId: number) => {
  // No-op on server - progress is saved in batch at end of lesson
  return;
};
