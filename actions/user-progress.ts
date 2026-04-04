"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@/lib/supabase/server";

import db from "@/db/drizzle";
import { getCourseById, getUserProgress, getUserSubscription } from "@/db/queries";
import { challengeProgress, challenges, userProgress, unlockedLists } from "@/db/schema";

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
    });

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

// Daily key claim
export const claimDailyKey = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  if (currentUserProgress.lastKeyDate === today) {
    throw new Error("Daily key already claimed");
  }

  await db.update(userProgress).set({
    keys: currentUserProgress.keys + 1,
    lastKeyDate: today,
  }).where(eq(userProgress.userId, userId));

  revalidatePath("/learn");
};

// Use a key to unlock a list
export const spendKey = async (listId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  // Pro users don't need keys
  if (userSubscription?.isActive) {
    return { success: true };
  }

  // Check if already unlocked
  const existing = await db.query.unlockedLists.findFirst({
    where: and(
      eq(unlockedLists.userId, userId),
      eq(unlockedLists.listId, listId),
    ),
  });

  if (existing) {
    return { success: true };
  }

  if (currentUserProgress.keys <= 0) {
    return { error: "no_keys" };
  }

  await db.update(userProgress).set({
    keys: currentUserProgress.keys - 1,
  }).where(eq(userProgress.userId, userId));

  await db.insert(unlockedLists).values({
    userId,
    listId,
  });

  revalidatePath("/learn");

  return { success: true };
};

// Legacy — keep for backward compat but does nothing meaningful
export const refillHearts = async () => {
  return;
};
