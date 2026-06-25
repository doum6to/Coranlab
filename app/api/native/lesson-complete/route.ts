import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";

import db from "@/db/drizzle";
import {
  challengeProgress,
  userProgress,
  weeklyXp,
  streakActivity,
} from "@/db/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWeekStart } from "@/lib/league-utils";
import { MAX_STREAK_CHARGES, getToday, daysBetween } from "@/lib/streak-utils";

/**
 * Native iOS endpoint: records a finished lesson — mirrors the web's
 * completeLessonChallenges (challenge progress + streak/charges + points +
 * weekly XP). Auth via Supabase Bearer token. Self-contained: it does NOT
 * import the cookie-coupled web action, so the website is unaffected.
 *
 * (League auto-join is intentionally omitted here; it stays a web concern.)
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const userId = userData.user.id;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }
  const challengeIds: number[] = Array.isArray(body?.challengeIds)
    ? body.challengeIds.filter((n: unknown) => Number.isFinite(n))
    : [];
  if (!challengeIds.length) {
    return NextResponse.json({ error: "No challenges" }, { status: 400 });
  }

  const up = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });
  if (!up) {
    return NextResponse.json({ error: "No user progress" }, { status: 400 });
  }

  // Only count challenges not already completed (no XP for repeats).
  const existing = await db.query.challengeProgress.findMany({
    where: and(
      eq(challengeProgress.userId, userId),
      inArray(challengeProgress.challengeId, challengeIds),
    ),
    columns: { challengeId: true },
  });
  const existingIds = new Set(existing.map((p) => p.challengeId));
  const newChallengeIds = challengeIds.filter((id) => !existingIds.has(id));

  if (newChallengeIds.length > 0) {
    await db.insert(challengeProgress).values(
      newChallengeIds.map((challengeId) => ({ challengeId, userId, completed: true })),
    );
  }

  // Streak + charges (same rules as the web).
  const today = getToday();
  const lastStreakDate = up.lastStreakDate;
  let newStreak = up.streak;
  let newCharges = up.streakCharges ?? 0;
  const alreadyActiveToday = lastStreakDate === today;

  if (!alreadyActiveToday) {
    if (!lastStreakDate) {
      newStreak = 1;
    } else {
      const missed = daysBetween(lastStreakDate, today) - 1;
      if (missed <= 0) {
        newStreak = newStreak + 1;
      } else {
        const cover = Math.min(missed, newCharges);
        newCharges -= cover;
        newStreak = missed - cover > 0 ? 1 : newStreak + 1;
      }
    }
  }
  newCharges = Math.min(newCharges + 1, MAX_STREAK_CHARGES);

  await db
    .insert(streakActivity)
    .values({ userId, date: today })
    .onConflictDoNothing();

  const pointsEarned = newChallengeIds.length * 10;

  await db
    .update(userProgress)
    .set({
      points: up.points + pointsEarned,
      streak: newStreak,
      lastStreakDate: today,
      streakCharges: newCharges,
    })
    .where(eq(userProgress.userId, userId));

  if (pointsEarned > 0) {
    const weekStart = getCurrentWeekStart();
    const existingXp = await db.query.weeklyXp.findFirst({
      where: and(eq(weeklyXp.userId, userId), eq(weeklyXp.weekStart, weekStart)),
    });
    if (existingXp) {
      await db
        .update(weeklyXp)
        .set({ xp: existingXp.xp + pointsEarned })
        .where(eq(weeklyXp.id, existingXp.id));
    } else {
      await db.insert(weeklyXp).values({ userId, weekStart, xp: pointsEarned });
    }
  }

  return NextResponse.json({
    ok: true,
    pointsEarned,
    streak: newStreak,
    streakCharges: newCharges,
  });
}
