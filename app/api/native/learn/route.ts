import { NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";

import db from "@/db/drizzle";
import {
  challengeProgress,
  courses,
  units,
  userProgress,
  userSubscription,
  streakActivity,
} from "@/db/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { translateContent } from "@/lib/i18n/content-i18n";

/**
 * Native iOS endpoint: returns the "Apprendre" data (units → lists → levels)
 * for the authenticated user, in the SAME shape/logic as the web's
 * getListsWithLevels — but identified by a Supabase Bearer token instead of
 * cookies, so the native app can call it.
 *
 * Self-contained on purpose: it does NOT import/modify the cookie-coupled web
 * queries, so the website is unaffected.
 */
export const dynamic = "force-dynamic";

const DAY_IN_MS = 86_400_000;
type Locale = "fr" | "en" | "es";

function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}


export async function GET(req: Request) {
  // 1. Auth is OPTIONAL: signed-out (guest) users may browse the free content
  // (App Store Review 5.1.1(v) — don't force registration for non-account
  // features). With a valid token we personalise (progress, streak, premium).
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  let userId = "";
  let guest = true;
  let displayName = "User";
  if (token) {
    const supabase = createAdminClient();
    const { data: userData } = await supabase.auth.getUser(token);
    if (userData?.user) {
      userId = userData.user.id;
      guest = false;
      displayName =
        (userData.user.user_metadata?.full_name as string | undefined) ||
        userData.user.email?.split("@")[0] ||
        "User";
    }
  }

  // Real streak activity for the last 7 calendar days (signed-in users only).
  let activeDays: string[] = [];
  if (!guest) {
    const weekDays = lastNDays(7);
    const activityRows = await db.query.streakActivity.findMany({
      where: and(
        eq(streakActivity.userId, userId),
        inArray(streakActivity.date, weekDays),
      ),
      columns: { date: true },
    });
    activeDays = activityRows.map((r) => r.date);
  }

  const url = new URL(req.url);
  const locale = ((url.searchParams.get("locale") as Locale) || "fr") as Locale;

  // 2. Active course for this user. New accounts (e.g. fresh sign-ups) have no
  // userProgress / activeCourseId yet — auto-assign the first course so they
  // immediately see content instead of an empty "Apprendre"/"Leçons".
  let up = guest
    ? undefined
    : await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
      });

  // A course that ACTUALLY has content (first unit's course) — used both for
  // brand-new accounts and to recover accounts stuck on an empty course.
  const firstUnit = await db.query.units.findFirst({
    orderBy: (u, { asc }) => [asc(u.courseId), asc(u.order)],
    columns: { courseId: true },
  });
  const contentCourseId =
    firstUnit?.courseId ??
    (await db.query.courses.findFirst({ orderBy: (c, { asc }) => [asc(c.id)] }))?.id ??
    null;

  let activeCourseId = up?.activeCourseId ?? null;

  // Guests always view the content course (no account = no saved course).
  if (guest) {
    activeCourseId = contentCourseId;
  }

  // Reassign when there is no active course, OR the active course has no units
  // (e.g. an empty placeholder course that was assigned by mistake).
  let needsAssign = !guest && !activeCourseId;
  if (!guest && activeCourseId) {
    const hasUnit = await db.query.units.findFirst({
      where: eq(units.courseId, activeCourseId),
      columns: { id: true },
    });
    if (!hasUnit) needsAssign = true;
  }
  if (needsAssign && contentCourseId) {
    activeCourseId = contentCourseId;
    const fallbackName = displayName;
    if (up) {
      await db
        .update(userProgress)
        .set({ activeCourseId })
        .where(eq(userProgress.userId, userId));
    } else {
      await db.insert(userProgress).values({
        userId,
        activeCourseId,
        userName: fallbackName,
      });
      up = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
      });
    }
  }
  if (!activeCourseId) {
    return NextResponse.json({ isPro: false, units: [], streak: up?.streak ?? 0, streakCharges: 0, points: 0, activeDays });
  }

  // 3. Subscription → isPro (same rule as getUserSubscription().isActive).
  const sub = guest
    ? undefined
    : await db.query.userSubscription.findFirst({
        where: eq(userSubscription.userId, userId),
      });
  let isPro = false;
  if (sub) {
    if (sub.isLifetime) {
      isPro = true;
    } else {
      const end = sub.stripeCurrentPeriodEnd?.getTime();
      isPro =
        typeof end === "number" && !Number.isNaN(end) && end + DAY_IN_MS > Date.now();
    }
  }

  // 4. Units → lessons → challenges (+ this user's progress). Same query as web.
  const data = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, activeCourseId),
    columns: { id: true, title: true, description: true, order: true },
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        columns: {
          id: true,
          title: true,
          listId: true,
          listTitle: true,
          levelOrder: true,
        },
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            columns: { id: true },
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
                columns: { completed: true },
              },
            },
          },
        },
      },
    },
  });

  // 5. Assemble (mirrors getListsWithLevels).
  const result = data.map((unit) => {
    const listMap = new Map<number, typeof unit.lessons>();
    for (const lesson of unit.lessons) {
      const lid = lesson.listId;
      if (!listMap.has(lid)) listMap.set(lid, []);
      listMap.get(lid)!.push(lesson);
    }

    const lists: Array<{
      listId: number;
      listTitle: string;
      completedLevels: number;
      totalLevels: number;
      activeLevelId: number | null;
      isPremiumLocked: boolean;
      levels: Array<{
        id: number;
        title: string;
        levelOrder: number;
        completed: boolean;
        challengeCount: number;
        completedChallengeCount: number;
      }>;
    }> = [];

    for (const [listId, listLessons] of Array.from(listMap.entries())) {
      const sorted = listLessons.sort((a, b) => a.levelOrder - b.levelOrder);
      const levels = sorted.map((lesson) => {
        const challengeCount = lesson.challenges.length;
        const completedChallengeCount = lesson.challenges.filter(
          (ch) =>
            ch.challengeProgress?.length > 0 &&
            ch.challengeProgress.every((p) => p.completed),
        ).length;
        const completed =
          challengeCount > 0 && completedChallengeCount === challengeCount;
        return {
          id: lesson.id,
          title: lesson.title,
          levelOrder: lesson.levelOrder,
          completed,
          challengeCount,
          completedChallengeCount,
        };
      });
      const completedLevels = levels.filter((l) => l.completed).length;
      const activeLevel = levels.find((l) => !l.completed);
      lists.push({
        listId,
        listTitle: translateContent(sorted[0].listTitle || sorted[0].title, locale),
        completedLevels,
        totalLevels: levels.length,
        activeLevelId: activeLevel?.id ?? null,
        isPremiumLocked: false, // set below
        levels,
      });
    }

    // Premium lock: only the first list of the very first unit is free.
    const isFirstUnit = unit.order === 1;
    const firstListId = lists[0]?.listId;
    for (const list of lists) {
      const isFreeList = isFirstUnit && list.listId === firstListId;
      list.isPremiumLocked = !isPro && !isFreeList;
    }

    return {
      id: unit.id,
      title: translateContent(unit.title, locale),
      description: translateContent(unit.description, locale),
      order: unit.order,
      lists,
    };
  });

  return NextResponse.json({
    isPro,
    units: result,
    streak: up?.streak ?? 0,
    streakCharges: up?.streakCharges ?? 0,
    points: up?.points ?? 0,
    activeDays,
  });
}
