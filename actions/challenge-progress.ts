"use server";

import { auth } from "@/lib/supabase/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import db from "@/db/drizzle";
import { getListsWithLevels, getUserProgress } from "@/db/queries";
import { COVERAGE_VISIBLE, quranCoverage } from "@/lib/quran-coverage";
import { challengeProgress, challenges, userProgress, weeklyXp, streakActivity } from "@/db/schema";
import { getCurrentWeekStart } from "@/lib/league-utils";
import { maybeJoinLeague } from "@/actions/league";
import { MAX_STREAK_CHARGES, getToday, daysBetween } from "@/lib/streak-utils";

/** XP for an exercise done for the first time, and for one replayed as revision. */
const XP_NEW = 10;
const XP_REVISION = 2;

export type LessonResult = { xp: number; streak: number; streakExtended: boolean; /** Share of the Qur'an's words understood after this lesson (estimate), when it could be computed. */ coverage?: number };

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

/**
 * Saves exercises as they are answered right, so a lesson left halfway resumes where it
 * stopped. Credits their XP at once: full for an exercise done for the first time, a small
 * reward for one replayed as revision. The streak is not touched here: it belongs to a
 * finished lesson (see `finishLesson`).
 */
export const saveLessonProgress = async (challengeIds: number[]): Promise<{ xp: number } | undefined> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const ids = Array.from(new Set(challengeIds)).filter((id) => Number.isInteger(id));
  if (!ids.length) return;

  const [currentUserProgress, existingProgress] = await Promise.all([
    getUserProgress(),
    db.query.challengeProgress.findMany({
      where: and(eq(challengeProgress.userId, userId), inArray(challengeProgress.challengeId, ids)),
    }),
  ]);
  if (!currentUserProgress) throw new Error("User progress not found");

  const existingIds = new Set(existingProgress.map((p) => p.challengeId));
  const newIds = ids.filter((id) => !existingIds.has(id));
  if (newIds.length > 0) {
    await db.insert(challengeProgress).values(newIds.map((challengeId) => ({ challengeId, userId, completed: true })));
  }

  const xp = newIds.length * XP_NEW + (ids.length - newIds.length) * XP_REVISION;
  if (xp > 0) {
    const weekStart = getCurrentWeekStart();
    await db.update(userProgress).set({ points: sql`${userProgress.points} + ${xp}` }).where(eq(userProgress.userId, userId));
    // Weekly XP (leagues). Read then write, as before: it does not depend on the table's unique
    // index being present in the database, and a failure here must never undo a saved exercise.
    try {
      const week = await db.query.weeklyXp.findFirst({ where: and(eq(weeklyXp.userId, userId), eq(weeklyXp.weekStart, weekStart)) });
      if (week) await db.update(weeklyXp).set({ xp: week.xp + xp }).where(eq(weeklyXp.id, week.id));
      else await db.insert(weeklyXp).values({ userId, weekStart, xp });
    } catch (e) {
      console.error("[lesson] weekly XP not recorded", e);
    }
  }
  return { xp };
};

/**
 * Closes a finished lesson: today counts for the streak (a missed day is covered by a charge
 * when one is left), a charge is earned, and the league is joined once the weekly XP allows it.
 */
export const finishLesson = async (clientDate?: string): Promise<{ streak: number; streakExtended: boolean; coverage?: number } | undefined> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const currentUserProgress = await db.query.userProgress.findFirst({ where: eq(userProgress.userId, userId) });
  if (!currentUserProgress) throw new Error("User progress not found");

  const today = learnerToday(clientDate);
  const lastStreakDate = currentUserProgress.lastStreakDate;
  let newStreak = currentUserProgress.streak;
  let newCharges = currentUserProgress.streakCharges ?? 0;
  const alreadyActiveToday = lastStreakDate === today;

  if (!alreadyActiveToday) {
    if (!lastStreakDate) {
      newStreak = 1; // first lesson ever
    } else {
      const missed = daysBetween(lastStreakDate, today) - 1;
      if (missed <= 0) {
        newStreak = newStreak + 1; // the day after
      } else {
        // Missed days are covered by charges when there are enough of them.
        const cover = Math.min(missed, newCharges);
        newCharges -= cover;
        newStreak = missed - cover > 0 ? 1 : newStreak + 1;
      }
    }
  }
  // A finished lesson earns a charge (capped).
  newCharges = Math.min(newCharges + 1, MAX_STREAK_CHARGES);

  await Promise.all([
    db.insert(streakActivity).values({ userId, date: today }).onConflictDoNothing(),
    db.update(userProgress).set({ streak: newStreak, lastStreakDate: today, streakCharges: newCharges }).where(eq(userProgress.userId, userId)),
  ]);
  await maybeJoinLeague(userId, getCurrentWeekStart());

  revalidatePath("/learn");
  revalidatePath("/leaderboard");
  revalidateTag("leaderboard");

  // The figure the lesson moved: shown on the end screen. Never worth failing the save for.
  let coverage: number | undefined;
  try {
    if (COVERAGE_VISIBLE) coverage = quranCoverage(await getListsWithLevels());
  } catch (e) {
    console.error("[lesson] coverage not computed", e);
  }

  return { streak: newStreak, streakExtended: !alreadyActiveToday, coverage };
};

/** A whole lesson saved in one call (kept for callers that do not save as they go). */
export const completeLessonChallenges = async (challengeIds: number[], clientDate?: string): Promise<LessonResult | undefined> => {
  if (!challengeIds.length) return;
  const saved = await saveLessonProgress(challengeIds);
  const done = await finishLesson(clientDate);
  if (!done) return;
  return { xp: saved?.xp ?? 0, ...done };
};

// Keep single challenge progress for backward compat (unused now)
export const upsertChallengeProgress = async (challengeId: number) => {
  // No-op on server - progress is saved in batch at end of lesson
  return;
};
