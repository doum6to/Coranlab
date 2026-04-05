import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, eq, desc, inArray } from "drizzle-orm";
import { auth } from "@/lib/supabase/server";

import db from "@/db/drizzle";
import {
  challengeProgress,
  courses,
  lessons,
  leagues,
  units,
  userProgress,
  userSubscription,
  unlockedLists,
  weeklyXp,
  streakActivity,
} from "@/db/schema";
import { getCurrentWeekStart } from "@/lib/league-utils";
import { getLast5Days, getToday, daysBetween } from "@/lib/streak-utils";

export const getUserProgress = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });

  return data;
});

export type ListLevel = {
  id: number;
  title: string;
  levelOrder: number;
  completed: boolean;
  challengeCount: number;
  completedChallengeCount: number;
};

export type VocabList = {
  listId: number;
  listTitle: string;
  levels: ListLevel[];
  completedLevels: number;
  totalLevels: number;
  activeLevel: ListLevel | undefined;
  /** True if user has spent a key to unlock this list */
  unlocked: boolean;
};

export type UnitWithLists = {
  id: number;
  title: string;
  description: string;
  order: number;
  lists: VocabList[];
  /** True if this unit requires a key to unlock (Part II, III, etc.) */
  keyLocked: boolean;
};

export const getListsWithLevels = cache(async (): Promise<UnitWithLists[]> => {
  const { userId } = await auth();
  const userProgressData = await getUserProgress();

  if (!userId || !userProgressData?.activeCourseId) {
    return [];
  }

  // Parallelize unlocked lists fetch with the main query
  const [userUnlockedLists, data] = await Promise.all([
    db
      .select({ listId: unlockedLists.listId })
      .from(unlockedLists)
      .where(eq(unlockedLists.userId, userId)),
    db.query.units.findMany({
      orderBy: (units, { asc }) => [asc(units.order)],
      where: eq(units.courseId, userProgressData.activeCourseId),
      // Only columns we actually read downstream
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
    }),
  ]);
  const unlockedListIds = new Set(userUnlockedLists.map((u) => u.listId));

  return data.map((unit) => {
    // Group lessons by listId
    const listMap = new Map<number, typeof unit.lessons>();
    for (const lesson of unit.lessons) {
      const lid = lesson.listId;
      if (!listMap.has(lid)) listMap.set(lid, []);
      listMap.get(lid)!.push(lesson);
    }

    const lists: VocabList[] = [];
    for (const [listId, listLessons] of Array.from(listMap.entries())) {
      const sortedLessons = listLessons.sort((a, b) => a.levelOrder - b.levelOrder);
      const levels: ListLevel[] = sortedLessons.map((lesson) => {
        const challengeCount = lesson.challenges.length;
        const completedChallengeCount = lesson.challenges.filter((ch) =>
          ch.challengeProgress?.length > 0 &&
          ch.challengeProgress.every((p) => p.completed)
        ).length;
        const completed = challengeCount > 0 && completedChallengeCount === challengeCount;

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
        listTitle: sortedLessons[0].listTitle || sortedLessons[0].title,
        levels,
        completedLevels,
        totalLevels: levels.length,
        activeLevel,
        unlocked: unlockedListIds.has(listId),
      });
    }

    return {
      id: unit.id,
      title: unit.title,
      description: unit.description,
      order: unit.order,
      lists,
      keyLocked: unit.order > 1,
    };
  });
});

export const getListLevels = cache(async (listId: number) => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const data = await db.query.lessons.findMany({
    where: eq(lessons.listId, listId),
    orderBy: (lessons, { asc }) => [asc(lessons.levelOrder)],
    with: {
      unit: true,
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
          challengeOptions: true,
        },
      },
    },
  });

  if (!data || data.length === 0) return null;

  const levels = data.map((lesson) => {
    const challengeCount = lesson.challenges.length;
    const completedChallengeCount = lesson.challenges.filter((ch) =>
      ch.challengeProgress?.length > 0 &&
      ch.challengeProgress.every((p) => p.completed)
    ).length;
    const completed = challengeCount > 0 && completedChallengeCount === challengeCount;

    return {
      id: lesson.id,
      title: lesson.title,
      levelOrder: lesson.levelOrder,
      completed,
      challengeCount,
      completedChallengeCount,
      percentage: challengeCount > 0
        ? Math.round((completedChallengeCount / challengeCount) * 100)
        : 0,
    };
  });

  const totalExercises = levels.reduce((sum, l) => sum + l.challengeCount, 0);

  // Extract unique vocabulary words from challenges + options
  const wordSet = new Set<string>();
  const vocabWords: { arabic: string; french: string }[] = [];

  const addWord = (arabic: string, french: string) => {
    const key = arabic.trim();
    if (key && french && !wordSet.has(key)) {
      wordSet.add(key);
      vocabWords.push({ arabic: key, french: french.trim() });
    }
  };

  for (const lesson of data) {
    for (const ch of lesson.challenges) {
      // From challenge fields
      if (ch.arabicWord && ch.frenchTranslation) {
        addWord(ch.arabicWord, ch.frenchTranslation);
      }
      // From challenge options (arabicText + frenchText pairs)
      if (ch.challengeOptions) {
        for (const opt of ch.challengeOptions) {
          if (opt.arabicText && opt.frenchText) {
            addWord(opt.arabicText, opt.frenchText);
          }
        }
      }
    }
  }

  return {
    listId,
    listTitle: data[0].listTitle || data[0].title,
    unitTitle: data[0].unit.title,
    levels,
    completedLevels: levels.filter((l) => l.completed).length,
    totalLevels: levels.length,
    totalExercises,
    vocabWords,
  };
});

// Keep getUnits for backward compat but simplified
export const getUnits = cache(async () => {
  const { userId } = await auth();
  const userProgressData = await getUserProgress();

  if (!userId || !userProgressData?.activeCourseId) {
    return [];
  }

  const data = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgressData.activeCourseId),
    columns: { id: true, title: true, description: true, order: true, courseId: true },
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        columns: { id: true, title: true, order: true, unitId: true },
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

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (lesson.challenges.length === 0) {
        return { ...lesson, completed: false };
      }

      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return challenge.challengeProgress
          && challenge.challengeProgress.length > 0
          && challenge.challengeProgress.every((progress) => progress.completed);
      });

      return { ...lesson, completed: allCompletedChallenges };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  return normalizedData;
});

// Cached across requests (1 hour) — courses rarely change
export const getCourses = unstable_cache(
  async () => {
    return await db.query.courses.findMany();
  },
  ["courses-all"],
  { revalidate: 3600, tags: ["courses"] }
);

export const getCourseById = unstable_cache(
  async (courseId: number) => {
    return await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        units: {
          orderBy: (units, { asc }) => [asc(units.order)],
          with: {
            lessons: {
              orderBy: (lessons, { asc }) => [asc(lessons.order)],
            },
          },
        },
      },
    });
  },
  ["course-by-id"],
  { revalidate: 3600, tags: ["courses"] }
);

export const getCourseProgress = cache(async () => {
  const { userId } = await auth();
  const userProgressData = await getUserProgress();

  if (!userId || !userProgressData?.activeCourseId) {
    return null;
  }

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgressData.activeCourseId),
    columns: { id: true, order: true },
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        columns: { id: true, title: true, order: true, unitId: true },
        with: {
          unit: { columns: { id: true, title: true } },
          challenges: {
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

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return !challenge.challengeProgress
          || challenge.challengeProgress.length === 0
          || challenge.challengeProgress.some((progress) => progress.completed === false)
      });
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  let lessonId = id;

  if (!lessonId) {
    const courseProgress = await getCourseProgress();
    lessonId = courseProgress?.activeLessonId;
  }

  if (!lessonId) {
    return null;
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });

  if (!data || !data.challenges) {
    return null;
  }

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed = challenge.challengeProgress
      && challenge.challengeProgress.length > 0
      && challenge.challengeProgress.every((progress) => progress.completed)

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges }
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) {
    return 0;
  }

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson) {
    return 0;
  }

  const completedChallenges = lesson.challenges
    .filter((challenge) => challenge.completed);
  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100,
  );

  return percentage;
});

const DAY_IN_MS = 86_400_000;
export const getUserSubscription = cache(async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const data = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.userId, userId),
  });

  if (!data) return null;

  const isActive =
    data.stripePriceId &&
    data.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return {
    ...data,
    isActive: !!isActive,
  };
});

export const getUnlockedLessons = cache(async () => {
  const { userId } = await auth();
  const userProgressData = await getUserProgress();

  if (!userId || !userProgressData?.activeCourseId) {
    return [];
  }

  const unitsData = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgressData.activeCourseId),
    columns: { id: true, title: true },
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        columns: { id: true, title: true, listId: true, listTitle: true },
        with: {
          challenges: {
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

  // Group by listId and return list-level progress
  const listMap = new Map<number, {
    listId: number;
    listTitle: string;
    unitTitle: string;
    completedLevels: number;
    totalLevels: number;
    hasProgress: boolean;
  }>();

  for (const unit of unitsData) {
    for (const lesson of unit.lessons) {
      const lid = lesson.listId;
      if (!listMap.has(lid)) {
        listMap.set(lid, {
          listId: lid,
          listTitle: lesson.listTitle || lesson.title,
          unitTitle: unit.title,
          completedLevels: 0,
          totalLevels: 0,
          hasProgress: false,
        });
      }

      const entry = listMap.get(lid)!;
      entry.totalLevels++;

      const allCompleted = lesson.challenges.length > 0 && lesson.challenges.every((ch) =>
        ch.challengeProgress?.length > 0 &&
        ch.challengeProgress.every((p) => p.completed)
      );

      if (allCompleted) entry.completedLevels++;

      const hasAnyProgress = lesson.challenges.some((ch) =>
        ch.challengeProgress && ch.challengeProgress.length > 0
      );

      if (hasAnyProgress) entry.hasProgress = true;
    }
  }

  return Array.from(listMap.values()).filter((l) => l.hasProgress);
});

// Cached across requests for 60s — the top 10 changes slowly.
// Invalidated via revalidateTag("leaderboard") in challenge-progress.ts
const _getTopTenUsersCached = unstable_cache(
  async () => {
    return await db.query.userProgress.findMany({
      orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
      limit: 10,
      columns: {
        userId: true,
        userName: true,
        userImageSrc: true,
        points: true,
      },
    });
  },
  ["top-ten-users"],
  { revalidate: 60, tags: ["leaderboard"] }
);

export const getTopTenUsers = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];
  return await _getTopTenUsersCached();
});

// League queries

export const getUserLeague = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const weekStart = getCurrentWeekStart();
  const data = await db.query.leagues.findFirst({
    where: and(
      eq(leagues.userId, userId),
      eq(leagues.weekStart, weekStart),
    ),
  });

  return data ?? null;
});

export const getUserWeeklyXp = cache(async () => {
  const { userId } = await auth();
  if (!userId) return 0;

  const weekStart = getCurrentWeekStart();
  const data = await db.query.weeklyXp.findFirst({
    where: and(
      eq(weeklyXp.userId, userId),
      eq(weeklyXp.weekStart, weekStart),
    ),
  });

  return data?.xp ?? 0;
});

export type LeagueMember = {
  rank: number;
  userId: string;
  name: string;
  imageSrc: string;
  weeklyXp: number;
  isBot: boolean;
  isCurrentUser: boolean;
};

export const getLeagueGroup = cache(async (groupId: string): Promise<LeagueMember[]> => {
  const { userId } = await auth();
  if (!userId || !groupId || groupId === "PENDING") return [];

  const weekStart = getCurrentWeekStart();

  // Get all members of this group
  const members = await db
    .select()
    .from(leagues)
    .where(eq(leagues.groupId, groupId));

  if (members.length === 0) return [];

  // Get weekly XP for all members
  const memberIds = members.map((m) => m.userId);
  const xpData = await db
    .select()
    .from(weeklyXp)
    .where(eq(weeklyXp.weekStart, weekStart));

  const xpMap = new Map<string, number>();
  for (const row of xpData) {
    if (memberIds.includes(row.userId)) {
      xpMap.set(row.userId, row.xp);
    }
  }

  // Get real user names
  const realUserIds = members.filter((m) => !m.isBot).map((m) => m.userId);
  const realUsers = new Map<string, { name: string; imageSrc: string }>();

  if (realUserIds.length > 0) {
    const userData = await db.query.userProgress.findMany({
      columns: {
        userId: true,
        userName: true,
        userImageSrc: true,
      },
    });
    for (const u of userData) {
      if (realUserIds.includes(u.userId)) {
        realUsers.set(u.userId, { name: u.userName, imageSrc: u.userImageSrc });
      }
    }
  }

  // Build sorted member list
  const result: LeagueMember[] = members.map((m) => ({
    rank: 0,
    userId: m.userId,
    name: m.isBot ? (m.botName ?? "Joueur") : (realUsers.get(m.userId)?.name ?? "Joueur"),
    imageSrc: m.isBot ? (m.botImageSrc ?? "/mascot.svg") : (realUsers.get(m.userId)?.imageSrc ?? "/mascot.svg"),
    weeklyXp: xpMap.get(m.userId) ?? 0,
    isBot: m.isBot,
    isCurrentUser: m.userId === userId,
  }));

  // Sort by XP descending
  result.sort((a, b) => b.weeklyXp - a.weeklyXp);

  // Assign ranks
  result.forEach((m, i) => { m.rank = i + 1; });

  return result;
});

// Streak data for the sidebar card
export type StreakData = {
  streak: number;
  charges: number;
  days: { date: string; label: string; active: boolean; isToday: boolean }[];
};

export const getStreakData = cache(async (): Promise<StreakData> => {
  const { userId } = await auth();
  if (!userId) {
    return { streak: 0, charges: 0, days: [] };
  }

  let up = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (!up) {
    return { streak: 0, charges: 0, days: [] };
  }

  const today = getToday();

  // Backfill streak_activity for historical streak (idempotent via unique index)
  if (up.lastStreakDate && up.streak > 0) {
    const backfillDates: string[] = [];
    const end = new Date(up.lastStreakDate + "T00:00:00Z");
    for (let i = 0; i < up.streak; i++) {
      const d = new Date(end);
      d.setUTCDate(end.getUTCDate() - i);
      backfillDates.push(d.toISOString().split("T")[0]);
    }
    if (backfillDates.length > 0) {
      await db
        .insert(streakActivity)
        .values(backfillDates.map((date) => ({ userId, date })))
        .onConflictDoNothing();
    }
  }

  // Lazy charge-apply: if user missed days since last activity, consume charges
  if (up.lastStreakDate && up.streak > 0) {
    const missed = daysBetween(up.lastStreakDate, today) - 1;
    if (missed > 0) {
      const currentCharges = up.streakCharges ?? 0;
      const cover = Math.min(missed, currentCharges);
      const newCharges = currentCharges - cover;
      const streakBroken = missed - cover > 0;
      const newStreak = streakBroken ? 0 : up.streak;
      if (newStreak !== up.streak || newCharges !== currentCharges) {
        await db.update(userProgress).set({
          streak: newStreak,
          streakCharges: newCharges,
        }).where(eq(userProgress.userId, userId));
        up = { ...up, streak: newStreak, streakCharges: newCharges };
      }
    }
  }

  const last5 = getLast5Days();

  const activityRows = await db
    .select()
    .from(streakActivity)
    .where(and(
      eq(streakActivity.userId, userId),
      inArray(streakActivity.date, last5),
    ));
  const activeDates = new Set(activityRows.map((r) => r.date));

  // French 2-letter labels
  const DAY_LABELS: Record<number, string> = {
    0: "Di", 1: "Lu", 2: "Ma", 3: "Me", 4: "Je", 5: "Ve", 6: "Sa",
  };

  const days = last5.map((date) => {
    const d = new Date(date + "T00:00:00Z");
    return {
      date,
      label: DAY_LABELS[d.getUTCDay()],
      active: activeDates.has(date),
      isToday: date === today,
    };
  });

  return {
    streak: up.streak,
    charges: up.streakCharges ?? 0,
    days,
  };
});
