import { NextResponse, type NextRequest } from "next/server";

import { absoluteUrl } from "@/lib/utils";
import { syncCheckoutSession } from "@/lib/stripe-sync";

export const dynamic = "force-dynamic";

/**
 * Post-checkout landing route. Stripe redirects here with the Checkout
 * Session id ({CHECKOUT_SESSION_ID}) so we can write the subscription to our
 * DB synchronously, before the user reaches /learn — closing the webhook
 * race that left fresh trial users without premium access.
 *
 * Always redirects on to the app, even if reconciliation fails: the Stripe
 * webhook remains the fallback source of truth.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (sessionId) {
    try {
      await syncCheckoutSession(sessionId);
    } catch (err) {
      console.error("[StripeSync] reconciliation failed:", err);
    }
  }

  return NextResponse.redirect(absoluteUrl("/learn"));
}
