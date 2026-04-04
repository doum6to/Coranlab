"use server";

import { auth } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getUserProgress } from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";

export const upsertChallengeProgress = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId)
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  });

  // Calculate streak update
  const today = new Date().toISOString().split("T")[0];
  const lastStreakDate = currentUserProgress.lastStreakDate;
  let newStreak = currentUserProgress.streak;

  if (lastStreakDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    newStreak = lastStreakDate === yesterday ? newStreak + 1 : 1;
  }

  const isPractice = !!existingChallengeProgress;

  if (isPractice) {
    await db.update(challengeProgress).set({
      completed: true,
    })
    .where(
      eq(challengeProgress.id, existingChallengeProgress.id)
    );

    await db.update(userProgress).set({
      points: currentUserProgress.points + 10,
      streak: newStreak,
      lastStreakDate: today,
    }).where(eq(userProgress.userId, userId));

    revalidatePath(`/lesson/${lessonId}`);
    return;
  }

  await db.insert(challengeProgress).values({
    challengeId,
    userId,
    completed: true,
  });

  await db.update(userProgress).set({
    points: currentUserProgress.points + 10,
    streak: newStreak,
    lastStreakDate: today,
  }).where(eq(userProgress.userId, userId));

  revalidatePath(`/lesson/${lessonId}`);
};
