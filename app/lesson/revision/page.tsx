import { redirect } from "next/navigation";

import { getUserProgress, getUserSubscription, isListPremiumLocked } from "@/db/queries";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { buildReviewSession } from "@/lib/review";
import { auth } from "@/lib/supabase/server";

import { Quiz } from "../quiz";

// A session is drawn afresh each time: never served from a cache.
export const dynamic = "force-dynamic";

/** A review session: ten words already learned, the ones due first. */
const ReviewPage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/auth/login");

  const [userProgress, userSubscription, session] = await Promise.all([
    getUserProgress(),
    getUserSubscription(),
    buildReviewSession(userId, getRequestLocale(), isListPremiumLocked),
  ]);
  if (!userProgress || !session) redirect("/lecons");

  return (
    <Quiz
      review
      initialLessonId={0}
      initialLessonChallenges={session.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={0}
      userSubscription={userSubscription}
    />
  );
};

export default ReviewPage;
