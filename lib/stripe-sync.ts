import "server-only";
import type Stripe from "stripe";

import db from "@/db/drizzle";
import { stripe } from "@/lib/stripe";
import { userSubscription } from "@/db/schema";

/**
 * Writes (or updates) the userSubscription row for a recurring Stripe
 * subscription. Shared by the Stripe webhook and the post-checkout
 * reconciliation route so both produce identical rows. Idempotent.
 */
export async function upsertSubscriptionRow(
  userId: string,
  subscription: Stripe.Subscription,
) {
  const values = {
    userId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: subscription.items.data[0]?.price.id ?? null,
    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    isLifetime: false,
  };

  await db
    .insert(userSubscription)
    .values(values)
    .onConflictDoUpdate({
      target: userSubscription.userId,
      set: {
        stripeSubscriptionId: values.stripeSubscriptionId,
        stripeCustomerId: values.stripeCustomerId,
        stripePriceId: values.stripePriceId,
        stripeCurrentPeriodEnd: values.stripeCurrentPeriodEnd,
        isLifetime: false,
      },
    });
}

/**
 * Reconciles a completed Checkout Session into our DB immediately, without
 * waiting for the asynchronous `checkout.session.completed` webhook. Safe to
 * run repeatedly. Used on the success redirect to close the race where a
 * fresh trial user lands on /learn before the webhook has written their
 * subscription — which left them with no premium access.
 *
 * Only handles `mode: "subscription"`; one-time (lifetime) payments are left
 * to the webhook, which marks `isLifetime`.
 */
export async function syncCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const userId = session.metadata?.userId;
  if (!userId || session.mode !== "subscription" || !session.subscription) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
  );

  await upsertSubscriptionRow(userId, subscription);
}
