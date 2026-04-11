"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@/lib/supabase/server";

import db from "@/db/drizzle";
import {
  getCourseById,
  getFirstLessonId,
  getUserProgress,
} from "@/db/queries";
import { challengeProgress, userProgress } from "@/db/schema";

export const upsertUserProgress = async (courseId: number) => {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  const course = await getCourseById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.units.length || !course.units[0].lessons.length) {
    throw new Error("Course is empty");
  }

  const existingUserProgress = await getUserProgress();

  if (existingUserProgress) {
    await db.update(userProgress).set({
      activeCourseId: courseId,
      userName: user.firstName || "User",
      userImageSrc: user.imageUrl || "/mascot.svg",
    }).where(eq(userProgress.userId, userId));

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  await db.insert(userProgress).values({
    userId,
    activeCourseId: courseId,
    userName: user.firstName || "User",
    userImageSrc: user.imageUrl || "/mascot.svg",
  });

  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

// No-op for wrong answers — we no longer reduce hearts
// The 90% threshold is checked on the client side at level completion
export const reduceHearts = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  });

  // Practice mode — no penalty
  if (existingProgress) {
    return { error: "practice" };
  }

  // No hearts to lose — just track wrong answer on client
  return;
};

// Legacy — keep for backward compat but does nothing meaningful
export const refillHearts = async () => {
  return;
};

export const markTutorialDone = async () => {
  const { userId } = await auth();
  if (!userId) return;

  await db.update(userProgress).set({
    tutorialDone: true,
  }).where(eq(userProgress.userId, userId));

  revalidatePath("/learn");
};

export const finishTutorialAndStartTest = async (): Promise<{
  lessonId: number | null;
}> => {
  const { userId } = await auth();
  if (!userId) return { lessonId: null };

  await db.update(userProgress).set({
    tutorialDone: true,
  }).where(eq(userProgress.userId, userId));

  revalidatePath("/learn");

  const lessonId = await getFirstLessonId();
  return { lessonId };
};
