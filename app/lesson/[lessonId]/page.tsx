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

  // The premium lock applies in every mode. Test mode is only the welcome tutorial's short demo
  // of the first, free lesson: it must never open a locked one from the address bar.
  if (await isListPremiumLocked(lesson.listId)) {
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
