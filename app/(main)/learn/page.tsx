import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import {
  getListsWithLevels,
  getUserProgress,
  getUserSubscription,
  getCourses,
} from "@/db/queries";
import { upsertUserProgress } from "@/actions/user-progress";
import { auth } from "@/lib/supabase/server";

import { UnitWithListsView } from "./unit-with-lists";
import { WelcomeTutorial } from "@/components/welcome-tutorial";

const LearnPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/login");
  }

  const [userProgressData, userSubscription, listsData] = await Promise.all([
    getUserProgress(),
    getUserSubscription(),
    getListsWithLevels(),
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

  const isPro = !!userSubscription?.isActive;
  const userKeys = userProgress?.keys ?? 0;
  const showTutorial = !userProgress?.tutorialDone;

  return (
    <div className="flex flex-col px-0 sm:px-6 overflow-hidden">
      {showTutorial && <WelcomeTutorial />}
      <FeedWrapper>
        {listsData.map((unit) => (
          <div key={unit.id} className="mb-10">
            <UnitWithListsView
              id={unit.id}
              order={unit.order}
              title={unit.title}
              description={unit.description}
              lists={unit.lists}
              keyLocked={unit.keyLocked && !isPro}
              isPro={isPro}
              userKeys={userKeys}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
