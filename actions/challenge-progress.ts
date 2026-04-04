"use server";

import { auth } from "@/lib/supabase/server";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getUserProgress } from "@/db/queries";
import { challengeProgress, challenges, userProgress, weeklyXp } from "@/db/schema";
import { getCurrentWeekStart } from "@/lib/league-utils";
import { maybeJoinLeague } from "@/actions/league";

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

  // Calculate streak
  const today = new Date().toISOString().split("T")[0];
  const lastStreakDate = currentUserProgress.lastStreakDate;
  let newStreak = currentUserProgress.streak;

  if (lastStreakDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    newStreak = lastStreakDate === yesterday ? newStreak + 1 : 1;
  }

  // Fix: only count NEW challenges for points (no XP for repeating)
  const pointsEarned = newChallengeIds.length * 10;

  // Update points + streak in one query
  await db.update(userProgress).set({
    points: currentUserProgress.points + pointsEarned,
    streak: newStreak,
    lastStreakDate: today,
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
};

// Keep single challenge progress for backward compat (unused now)
export const upsertChallengeProgress = async (challengeId: number) => {
  // No-op on server - progress is saved in batch at end of lesson
  return;
};
