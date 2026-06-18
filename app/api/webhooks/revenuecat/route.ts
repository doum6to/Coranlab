import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";

/**
 * RevenueCat webhook → grants/revokes premium for Apple In-App Purchases.
 *
 * RevenueCat is the source of truth for IAP. We map its events onto the SAME
 * `user_subscription` row that the Stripe webhook uses, so the existing
 * `getUserSubscription().isActive` logic works unchanged (premium = active
 * period end OR lifetime).
 *
 * The native app sets RevenueCat's appUserID to the Supabase user id
 * (see lib/iap/revenuecat.ts → initIAP), so `event.app_user_id` IS our userId.
 *
 * Auth: set a custom "Authorization" header in the RevenueCat webhook config
 * equal to REVENUECAT_WEBHOOK_SECRET.
 */

// Same sentinel the Stripe webhook uses to revoke access immediately.
const ACCESS_REVOKED = new Date(0);
const LIFETIME_END = new Date("2099-12-31T23:59:59Z");

// Events that grant or extend access.
const GRANT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
]);
// Events that end access now. (CANCELLATION = auto-renew off but still active
// until expiry, so we do NOT revoke on it — EXPIRATION comes later.)
const REVOKE_TYPES = new Set(["EXPIRATION", "SUBSCRIPTION_PAUSED"]);

export async function POST(req: Request) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (secret && req.headers.get("authorization") !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  const event = payload?.event;
  const type: string | undefined = event?.type;
  const userId: string | undefined = event?.app_user_id;

  // Ignore anonymous ids (purchase made before we tied the user) and noise.
  if (!type || !userId || userId.startsWith("$RCAnonymousID:")) {
    return new NextResponse(null, { status: 200 });
  }

  try {
    if (GRANT_TYPES.has(type)) {
      const isLifetime = type === "NON_RENEWING_PURCHASE" || !event.expiration_at_ms;
      const periodEnd = event.expiration_at_ms
        ? new Date(Number(event.expiration_at_ms))
        : LIFETIME_END;
      const priceId: string | null = event.product_id ?? null;

      await db
        .insert(userSubscription)
        .values({
          userId,
          // Sentinel customer id (the column is NOT NULL + unique). Kept stable
          // per user; never overwritten on conflict to preserve any Stripe link.
          stripeCustomerId: `rc_${userId}`,
          stripeSubscriptionId: null,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: periodEnd,
          isLifetime,
        })
        .onConflictDoUpdate({
          target: userSubscription.userId,
          set: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: periodEnd,
            isLifetime,
          },
        });
    } else if (REVOKE_TYPES.has(type)) {
      // Only revoke if a row exists for this user (no-op insert otherwise).
      await db
        .update(userSubscription)
        .set({ stripeCurrentPeriodEnd: ACCESS_REVOKED, isLifetime: false })
        .where(eq(userSubscription.userId, userId));
    }
    // Other types (CANCELLATION, BILLING_ISSUE, TRANSFER, TEST...) → no-op.
  } catch (e) {
    console.error("[RevenueCat] webhook DB error:", e);
    return new NextResponse("DB error", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
