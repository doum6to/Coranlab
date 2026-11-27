import { redirect } from "next/navigation";

import {
  getLesson,
  getUserProgress,
  getUserSubscription,
  isListPremiumLocked,
} from "@/db/queries";

import { auth } from "@/lib/supabase/server";
import { getBoostUntil } from "@/lib/xp-boost";

import { Quiz } from "./quiz";

const LessonPage = async () => {
  const lessonData = getLesson();
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();

  const { userId } = await auth();
  const [
    lesson,
    userProgress,
    userSubscription,
    boostUntil,
  ] = await Promise.all([
    lessonData,
    userProgressData,
    userSubscriptionData,
    userId ? getBoostUntil(userId) : null,
  ]);

  if (!lesson || !userProgress) {
    redirect("/learn");
  }

  if (await isListPremiumLocked(lesson.listId)) {
    redirect("/premium");
  }

  const initialPercentage = lesson.challenges
    .filter((challenge) => challenge.completed)
    .length / lesson.challenges.length * 100;

  return (
    <Quiz
      key={lesson.id}
      boostUntil={boostUntil}
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={initialPercentage}
      userSubscription={userSubscription}
      listId={lesson.listId}
      levelOrder={lesson.levelOrder}
    />
  );
};
 
export default LessonPage;
