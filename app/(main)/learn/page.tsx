import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import {
  getListsWithLevels,
  getUserProgress,
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

  const [userProgressData, listsData] = await Promise.all([
    getUserProgress(),
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
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
