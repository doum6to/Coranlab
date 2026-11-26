import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import {
  getListsWithLevels,
  getUserProgress,
  getCourses,
  getUserSubscription,
  getStreakData,
} from "@/db/queries";
import { upsertUserProgress } from "@/actions/user-progress";
import { auth } from "@/lib/supabase/server";

import { UnitWithListsView } from "./unit-with-lists";
import { WelcomeTutorial } from "@/components/welcome-tutorial";
import { AddToHomeTutorial } from "@/components/add-to-home-tutorial";
import { PremiumNudgeBanner } from "@/components/premium-nudge-banner";
import { TodayHero, type NextLesson } from "@/components/today-hero";

const LearnPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/login");
  }

  const [userProgressData, listsData, subscription, streakData] = await Promise.all([
    getUserProgress(),
    getListsWithLevels(),
    getUserSubscription(),
    getStreakData(),
  ]);
  let userProgress = userProgressData;

  // Auto-activate first course if none selected
  if (!userProgress?.activeCourseId) {
    const courses = await getCourses();
    if (courses.length > 0) {
      await upsertUserProgress(courses[0].id);
      userProgress = await getUserProgress();
    }
  }

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/auth/login");
  }

  const showTutorial = !userProgress?.tutorialDone;
  const isPro = !!subscription?.isActive;

  // Overall progress (completed levels / total) — computed from data we already
  // loaded, no extra query. Drives the free-user value nudge.
  let totalLevels = 0;
  let doneLevels = 0;
  for (const unit of listsData) {
    for (const list of unit.lists) {
      totalLevels += list.totalLevels;
      doneLevels += list.completedLevels;
    }
  }
  const percent = totalLevels > 0 ? Math.round((doneLevels / totalLevels) * 100) : 0;

  // Where the learner stopped: the first list of the path that still has a level to do.
  let next: NextLesson | null = null;
  for (const unit of listsData) {
    const list = unit.lists.find((l) => l.activeLevel);
    if (list?.activeLevel) {
      next = {
        lessonId: list.activeLevel.id,
        level: list.completedLevels + 1,
        levels: list.totalLevels,
        listTitle: list.listTitle,
        unitTitle: unit.title,
        started: doneLevels > 0 || list.activeLevel.completedChallengeCount > 0,
        locked: list.isPremiumLocked,
      };
      break;
    }
  }

  return (
    <div className="flex flex-col px-0 sm:px-6 overflow-hidden">
      {showTutorial && <WelcomeTutorial />}
      {/* Once onboarding is done, invite mobile users to install the web app
          to their home screen (once, phone only, not when already installed). */}
      {!showTutorial && <AddToHomeTutorial />}
      {/* Today's step first; the offer comes after it, never before */}
      <div className="mx-auto mb-8 w-full max-w-md sm:mb-10">
        <TodayHero streakData={streakData} next={next} />
        {!isPro && !showTutorial && (
          <div className="mt-4">
            <PremiumNudgeBanner streak={userProgress?.streak ?? 0} percent={percent} />
          </div>
        )}
      </div>
      <FeedWrapper>
        {listsData.map((unit) => (
          <div key={unit.id} className="mb-10">
            <UnitWithListsView
              id={unit.id}
              order={unit.order}
              title={unit.title}
              description={unit.description}
              lists={unit.lists}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
