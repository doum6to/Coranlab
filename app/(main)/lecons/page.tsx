import { redirect } from "next/navigation";

import { isListPremiumLocked } from "@/db/queries";
import { ReviewView } from "@/components/review-view";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { SESSION_MIN, SESSION_SIZE, getReviewOverview, type ReviewOverview } from "@/lib/review";
import { daysBetween, getToday } from "@/lib/streak-utils";
import { auth } from "@/lib/supabase/server";

/** The review tab: today's session and the learner's words. */
const ReviewTabPage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/auth/login");

  // A failure here must not take the whole tab down: it opens empty and the error is logged.
  let overview: ReviewOverview = { words: [], practised: 0, due: 0, known: 0, next: null };
  try {
    overview = await getReviewOverview(userId, getRequestLocale(), isListPremiumLocked);
  } catch (e) {
    console.error("[review] overview unavailable", e);
  }
  const nextInDays = overview.next ? Math.max(1, daysBetween(getToday(), overview.next.date)) : null;

  return <ReviewView overview={overview} sessionSize={SESSION_SIZE} sessionMin={SESSION_MIN} nextInDays={nextInDays} />;
};

export default ReviewTabPage;
