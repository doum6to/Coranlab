import { redirect } from "next/navigation";

import {
  getLesson,
  getUserProgress,
  getUserSubscription,
  isListPremiumLocked,
} from "@/db/queries";

import { Quiz } from "../quiz";

type Props = {
  params: {
    lessonId: number;
  };
  searchParams: {
    testMode?: string;
  };
};

const LessonIdPage = async ({
  params,
  searchParams,
}: Props) => {
  const testMode = searchParams.testMode === "1";

  const lessonData = getLesson(params.lessonId);
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();

  const [
    lesson,
    userProgress,
    userSubscription,
  ] = await Promise.all([
    lessonData,
    userProgressData,
    userSubscriptionData,
  ]);

  if (!lesson || !userProgress) {
    redirect("/learn");
  }

  // Skip premium lock in test mode — the first lesson is free anyway but
  // this makes the bypass explicit and safe.
  if (!testMode && (await isListPremiumLocked(lesson.listId))) {
    redirect("/premium");
  }

  const initialPercentage = lesson.challenges
    .filter((challenge) => challenge.completed)
    .length / lesson.challenges.length * 100;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={initialPercentage}
      userSubscription={userSubscription}
      listId={lesson.listId}
      levelOrder={lesson.levelOrder}
      testMode={testMode}
    />
  );
};
 
export default LessonIdPage;
