import crypto from "crypto";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { coursePurchase, userSubscription } from "@/db/schema";
import { sendCoursePurchaseEmail } from "@/lib/email/send-course-email";
import {
  sendTrialWelcome,
  sendTrialEndingSoon,
  sendPaymentSucceeded,
  sendPaymentFailed,
} from "@/lib/email/send-trial-emails";

/**
 * Opens a Stripe Billing Portal session for the given customer so they can
 * manage their subscription (cancel, update card). Used in trial-ending and
 * payment-failed emails.
 */
async function billingPortalUrlFor(customerId: string): Promise<string> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: absoluteUrl("/settings"),
    });
    return session.url;
  } catch (err) {
    console.error("[Webhook] billingPortal error:", err);
    return absoluteUrl("/settings");
  }
}

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

    // --- 1a. Course purchase via /85motscoran (anonymous, no userId) ---
    if (session.metadata?.productType === "course") {
      const email =
        session.customer_details?.email || session.customer_email;
      if (!email) {
        console.error("[Webhook] Course purchase missing email", session.id);
        return new NextResponse("Email required", { status: 400 });
      }

      const hasApp = session.metadata.hasApp === "true";
      const activationToken = crypto.randomUUID();

      try {
        await db
          .insert(coursePurchase)
          .values({
            email: email.toLowerCase(),
            stripeSessionId: session.id,
            stripeCustomerId: (session.customer as string) || null,
            stripeSubscriptionId:
              (session.subscription as string | null) || null,
            hasAppSubscription: hasApp,
            activationToken,
          })
          .onConflictDoNothing({ target: coursePurchase.stripeSessionId });

        await sendCoursePurchaseEmail({
          email,
          hasApp,
          activationToken,
        });

        await db
          .update(coursePurchase)
          .set({ emailSentAt: new Date() })
          .where(eq(coursePurchase.stripeSessionId, session.id));
      } catch (err: any) {
        console.error("[Webhook] Course purchase error:", err);
        // Return 500 so Stripe retries
        return new NextResponse(`Course purchase error: ${err.message}`, {
          status: 500,
        });
      }

      return new NextResponse(null, { status: 200 });
    }

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
      // Recurring subscription (trial / 3 months / 6 months / annual)
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

      // Trial welcome email — only on fresh trial signups (status = trialing
      // and plan metadata flag set by trial-checkout.ts).
      const isTrialStart =
        subscription.status === "trialing" &&
        session.metadata.plan === "monthly_trial";
      if (isTrialStart) {
        const email =
          session.customer_details?.email || session.customer_email;
        const trialEndsAt = subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : new Date(subscription.current_period_end * 1000);
        if (email) {
          try {
            await sendTrialWelcome({ email, trialEndsAt });
          } catch (e) {
            console.error("[Webhook] sendTrialWelcome failed:", e);
          }
        }
      }
    }
  }

  // --- 2. Recurring payment succeeded → extend period + "thanks" email ---
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

      // Send "payment received" email ONLY for the first real charge (i.e.
      // the one right after a trial ends). Invoices during a trial are 0€
      // and shouldn't trigger this email; subsequent monthly renewals send
      // a receipt that Stripe already handles.
      const billingReason = (invoice as any).billing_reason as
        | string
        | undefined;
      const isFirstPostTrialCharge =
        billingReason === "subscription_cycle" &&
        (invoice.amount_paid ?? 0) > 0 &&
        subscription.status === "active";

      if (isFirstPostTrialCharge && invoice.customer_email) {
        try {
          await sendPaymentSucceeded({
            email: invoice.customer_email,
            amountCents: invoice.amount_paid,
            nextBillingAt: new Date(
              subscription.current_period_end * 1000
            ),
          });
        } catch (e) {
          console.error("[Webhook] sendPaymentSucceeded failed:", e);
        }
      }
    }
  }

  // --- 3. Payment failed → mark expired + notify the user ---
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;

    if (invoice.subscription) {
      await db.update(userSubscription).set({
        stripeCurrentPeriodEnd: new Date(),
      }).where(eq(userSubscription.stripeSubscriptionId, invoice.subscription as string));

      if (invoice.customer_email && invoice.customer) {
        try {
          const portalUrl = await billingPortalUrlFor(
            invoice.customer as string
          );
          await sendPaymentFailed({
            email: invoice.customer_email,
            billingPortalUrl: portalUrl,
          });
        } catch (e) {
          console.error("[Webhook] sendPaymentFailed failed:", e);
        }
      }
    }
  }

  // --- 3b. Trial ending soon (fires ~3 days before trial_end) ---
  if (event.type === "customer.subscription.trial_will_end") {
    const subscription = event.data.object as Stripe.Subscription;

    try {
      const customer = (await stripe.customers.retrieve(
        subscription.customer as string
      )) as Stripe.Customer;

      if (!customer.deleted && customer.email && subscription.trial_end) {
        const portalUrl = await billingPortalUrlFor(customer.id);
        await sendTrialEndingSoon({
          email: customer.email,
          trialEndsAt: new Date(subscription.trial_end * 1000),
          billingPortalUrl: portalUrl,
        });
      }
    } catch (e) {
      console.error("[Webhook] sendTrialEndingSoon failed:", e);
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
