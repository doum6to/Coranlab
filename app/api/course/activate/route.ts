import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";
import { absoluteUrl } from "@/lib/utils";

/**
 * GET /api/course/activate?token=xxx
 *
 * Entry point from the "Créer mon compte premium" CTA in the post-purchase
 * email. Looks up the course_purchase row, and redirects to the signup page
 * with the email and token pre-filled so signup can link the subscription.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(absoluteUrl("/auth/signup"));
  }

  const purchase = await db.query.coursePurchase.findFirst({
    where: eq(coursePurchase.activationToken, token),
  });

  if (!purchase || !purchase.hasAppSubscription) {
    return NextResponse.redirect(absoluteUrl("/auth/signup"));
  }

  const signupUrl = absoluteUrl(
    `/auth/signup?email=${encodeURIComponent(purchase.email)}&course_token=${token}`
  );
  return NextResponse.redirect(signupUrl);
}
