"use server";

import { revalidatePath } from "next/cache";

import { recordReviewAnswers } from "@/lib/review";
import { learnerToday } from "@/lib/streak-utils";
import { auth } from "@/lib/supabase/server";

/** Saves how the words of a review were answered at the first try (see lib/review.ts). */
export const saveReviewAnswers = async (answers: { id: number; right: boolean }[], clientDate?: string): Promise<void> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!Array.isArray(answers) || !answers.length) return;
  await recordReviewAnswers(userId, answers, learnerToday(clientDate));
  revalidatePath("/lecons");
};
