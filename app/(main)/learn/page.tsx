import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import {
  getListsWithLevels,
  getUserProgress,
  getCourses,
  getUserSubscription,
} from "@/db/queries";
import { upsertUserProgress } from "@/actions/user-progress";
import { auth } from "@/lib/supabase/server";

import { UnitWithListsView } from "./unit-with-lists";
import { WelcomeTutorial } from "@/components/welcome-tutorial";
import { AddToHomeTutorial } from "@/components/add-to-home-tutorial";
import { PremiumNudgeBanner } from "@/components/premium-nudge-banner";

const LearnPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/login");
  }

  const [userProgressData, listsData, subscription] = await Promise.all([
    getUserProgress(),
    getListsWithLevels(),
    getUserSubscription(),
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

  return (
    <div className="flex flex-col px-0 sm:px-6 overflow-hidden">
      {showTutorial && <WelcomeTutorial />}
      {/* Once onboarding is done, invite mobile users to install the web app
          to their home screen (once, phone only, not when already installed). */}
      {!showTutorial && <AddToHomeTutorial />}
      {!isPro && !showTutorial && (
        <PremiumNudgeBanner streak={userProgress?.streak ?? 0} percent={percent} />
      )}
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
