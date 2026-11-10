"use server";

import { revalidatePath } from "next/cache";

import { auth, currentUser } from "@/lib/supabase/server";
import { linkCoursePurchaseByEmail, linkCoursePurchaseByToken } from "@/lib/link-purchase";

/**
 * Claims any pending purchase for the currently logged-in user (matched by
 * email) and grants premium. Called after login so a buyer who already had an
 * account — and therefore couldn't be linked at signup — still gets access.
 */
export async function claimPurchase(courseToken?: string) {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!userId || !email) return { ok: false, granted: false };

  try {
    // The activation token (from the post-purchase email link) works even
    // when the account email differs from the one used to pay.
    const byToken = courseToken ? await linkCoursePurchaseByToken(userId, courseToken) : false;
    const granted = byToken || (await linkCoursePurchaseByEmail(userId, email));
    if (granted) {
      revalidatePath("/learn");
      revalidatePath("/");
    }
    return { ok: true, granted };
  } catch (e) {
    console.error("[claimPurchase] failed:", e);
    return { ok: false, granted: false };
  }
}
