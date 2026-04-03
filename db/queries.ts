import { cache } from "react";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/supabase/server";

import db from "@/db/drizzle";
import {
  challengeProgress,
  courses,
  lessons,
  units,
  userProgress,
  userSubscription,
  unlockedLists,
} from "@/db/schema";

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

  // Fetch user's unlocked lists
  const userUnlockedLists = await db
    .select({ listId: unlockedLists.listId })
    .from(unlockedLists)
    .where(eq(unlockedLists.userId, userId));
  const unlockedListIds = new Set(userUnlockedLists.map((u) => u.listId));

  const data = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgressData.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

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
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
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

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany();
  return data;
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
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

  return data;
});

export const getCourseProgress = cache(async () => {
  const { userId } = await auth();
  const userProgressData = await getUserProgress();

  if (!userId || !userProgressData?.activeCourseId) {
    return null;
  }

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgressData.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
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

  const courseProgress = await getCourseProgress();

  const lessonId = id || courseProgress?.activeLessonId;

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
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
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

export const getTopTenUsers = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });

  return data;
});
