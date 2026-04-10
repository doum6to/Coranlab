import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { stripe } from "@/lib/stripe";
import { userSubscription } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    return new NextResponse(`Webhook error: ${error.message}`, {
      status: 400,
    });
  }

  // --- 1. New subscription or one-time payment completed via Checkout ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session?.metadata?.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    if (session.mode === "payment") {
      // One-time lifetime purchase — no Stripe subscription exists.
      const customerId = session.customer as string;
      const lifetimeEnd = new Date("2099-12-31T23:59:59Z");

      await db
        .insert(userSubscription)
        .values({
          userId: session.metadata.userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: lifetimeEnd,
          isLifetime: true,
        })
        .onConflictDoUpdate({
          target: userSubscription.userId,
          set: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: lifetimeEnd,
            isLifetime: true,
          },
        });
    } else {
      // Recurring subscription (3 months / 6 months / annual)
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await db
        .insert(userSubscription)
        .values({
          userId: session.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
          isLifetime: false,
        })
        .onConflictDoUpdate({
          target: userSubscription.userId,
          set: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ),
            isLifetime: false,
          },
        });
    }
  }

  // --- 2. Recurring payment succeeded → extend period ---
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      await db.update(userSubscription).set({
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
      }).where(eq(userSubscription.stripeSubscriptionId, subscription.id));
    }
  }

  // --- 3. Payment failed → mark subscription as expired immediately ---
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;

    if (invoice.subscription) {
      // Set period end to now so isActive becomes false immediately
      await db.update(userSubscription).set({
        stripeCurrentPeriodEnd: new Date(),
      }).where(eq(userSubscription.stripeSubscriptionId, invoice.subscription as string));
    }
  }

  // --- 4. Subscription cancelled or expired → end access immediately ---
  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.updated"
  ) {
    const subscription = event.data.object as Stripe.Subscription;

    // Only act on non-active statuses (canceled, unpaid, past_due, incomplete_expired)
    if (subscription.status !== "active" && subscription.status !== "trialing") {
      await db.update(userSubscription).set({
        stripeCurrentPeriodEnd: new Date(),
      }).where(eq(userSubscription.stripeSubscriptionId, subscription.id));
    }

    // If subscription is active (e.g. reactivated), update the period end
    if (subscription.status === "active") {
      await db.update(userSubscription).set({
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
      }).where(eq(userSubscription.stripeSubscriptionId, subscription.id));
    }
  }

  return new NextResponse(null, { status: 200 });
}
