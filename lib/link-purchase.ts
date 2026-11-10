import "server-only";
import { and, eq, isNull } from "drizzle-orm";

import db from "@/db/drizzle";
import { coursePurchase, userSubscription } from "@/db/schema";
import { stripe } from "@/lib/stripe";

type Purchase = typeof coursePurchase.$inferSelect;

/**
 * Grants the access bought in `purchase` to `userId` (lifetime for a one-time
 * payment, the live period for a subscription) and marks the purchase linked.
 */
export async function grantFromPurchase(userId: string, purchase: Purchase): Promise<void> {
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
  } else {
    // Recurring subscription purchase.
    const sub = await stripe.subscriptions.retrieve(purchase.stripeSubscriptionId);
    const values = {
      stripeCustomerId: purchase.stripeCustomerId!,
      stripeSubscriptionId: purchase.stripeSubscriptionId,
      stripePriceId: sub.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
      isLifetime: false,
    };
    await db
      .insert(userSubscription)
      .values({ userId, ...values })
      .onConflictDoUpdate({ target: userSubscription.userId, set: values });
  }

  await db.update(coursePurchase).set({ linkedUserId: userId }).where(eq(coursePurchase.id, purchase.id));
}

/**
 * Links any unlinked course_purchase (hasAppSubscription=true) for this email
 * to the given user and grants the access. Used on signup, login, every app
 * load and OAuth sign-in, so a buyer is never lost. Returns true if granted.
 */
export async function linkCoursePurchaseByEmail(userId: string, email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const purchase = await db.query.coursePurchase.findFirst({
    where: and(
      eq(coursePurchase.email, normalizedEmail),
      eq(coursePurchase.hasAppSubscription, true),
      isNull(coursePurchase.linkedUserId),
    ),
  });
  if (!purchase) return false;
  await grantFromPurchase(userId, purchase);
  return true;
}

/**
 * Links the purchase identified by the activation token of the post-purchase
 * email to the given user, WHATEVER the account's email. Covers buyers who
 * paid with one address and sign in with another. Only an unlinked purchase
 * (or one already linked to this same user) can be claimed.
 */
export async function linkCoursePurchaseByToken(userId: string, token: string): Promise<boolean> {
  if (!token) return false;
  const purchase = await db.query.coursePurchase.findFirst({
    where: and(eq(coursePurchase.activationToken, token), eq(coursePurchase.hasAppSubscription, true)),
  });
  if (!purchase) return false;
  if (purchase.linkedUserId && purchase.linkedUserId !== userId) return false;
  await grantFromPurchase(userId, purchase);
  return true;
}
