import "server-only";
import { and, eq, isNull } from "drizzle-orm";

import db from "@/db/drizzle";
import { coursePurchase, userSubscription } from "@/db/schema";
import { stripe } from "@/lib/stripe";

/**
 * Links any unlinked course_purchase (hasAppSubscription=true) for this email
 * to the given user and creates the matching user_subscription so the account
 * gets premium immediately. Used on BOTH signup and login so a buyer is never
 * lost — whether the account is brand new or already existed.
 *
 * Matching key is the email used at Stripe checkout. Returns true if access
 * was granted.
 */
export async function linkCoursePurchaseByEmail(
  userId: string,
  email: string,
): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();

  const purchase = await db.query.coursePurchase.findFirst({
    where: and(
      eq(coursePurchase.email, normalizedEmail),
      eq(coursePurchase.hasAppSubscription, true),
      isNull(coursePurchase.linkedUserId),
    ),
  });

  if (!purchase) return false;

  // Lifetime app purchase (one-time payment): hasApp but no subscription.
  if (!purchase.stripeSubscriptionId) {
    const LIFETIME_END = new Date("2099-12-31T23:59:59Z");
    await db
      .insert(userSubscription)
      .values({
        userId,
        stripeCustomerId: purchase.stripeCustomerId || `lifetime_${userId}`,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: LIFETIME_END,
        isLifetime: true,
      })
      .onConflictDoUpdate({
        target: userSubscription.userId,
        set: { stripeCurrentPeriodEnd: LIFETIME_END, isLifetime: true },
      });

    await db
      .update(coursePurchase)
      .set({ linkedUserId: userId })
      .where(eq(coursePurchase.id, purchase.id));
    return true;
  }

  // Recurring subscription purchase.
  const sub = await stripe.subscriptions.retrieve(purchase.stripeSubscriptionId);
  await db
    .insert(userSubscription)
    .values({
      userId,
      stripeCustomerId: purchase.stripeCustomerId!,
      stripeSubscriptionId: purchase.stripeSubscriptionId,
      stripePriceId: sub.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
      isLifetime: false,
    })
    .onConflictDoUpdate({
      target: userSubscription.userId,
      set: {
        stripeCustomerId: purchase.stripeCustomerId!,
        stripeSubscriptionId: purchase.stripeSubscriptionId,
        stripePriceId: sub.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
        isLifetime: false,
      },
    });

  await db
    .update(coursePurchase)
    .set({ linkedUserId: userId })
    .where(eq(coursePurchase.id, purchase.id));
  return true;
}
