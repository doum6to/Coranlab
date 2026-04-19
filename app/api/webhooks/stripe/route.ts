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
import { ttqServerTrack } from "@/lib/analytics/tiktok-server";

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

      // 1. Record the purchase in our DB — this is the source of truth for
      //    "did the customer actually pay?". If this fails we want Stripe
      //    to retry, so we still throw here.
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
      } catch (err: any) {
        console.error("[Webhook] DB insert failed for course purchase", err);
        return new NextResponse(`DB insert error: ${err.message}`, {
          status: 500,
        });
      }

      // 2. Try to send the email — but never fail the webhook on this.
      //    If Resend rejects (unverified domain, rate limit, etc.), the
      //    purchase is still recorded. We log loudly and let an admin
      //    retry via /api/admin/resend-course-emails.
      const sendResult = await sendCoursePurchaseEmail({
        email,
        hasApp,
        activationToken,
      });

      if (sendResult.ok) {
        try {
          await db
            .update(coursePurchase)
            .set({ emailSentAt: new Date() })
            .where(eq(coursePurchase.stripeSessionId, session.id));
        } catch (err: any) {
          // Non-critical: the email went out, we just couldn't flag it.
          console.error("[Webhook] emailSentAt update failed", err);
        }
      } else {
        console.error(
          `[Webhook] course email FAILED for ${email} — session ${session.id}: ${sendResult.error}. ` +
            `Row is recorded; retry via POST /api/admin/resend-course-emails.`
        );
      }

      // 3. Server-side TikTok conversion (independent of the email).
      try {
        const amountCents = session.amount_total ?? (hasApp ? 2496 : 999);
        await ttqServerTrack("CompletePayment", {
          event_id: session.id,
          email,
          value: amountCents / 100,
          currency: "EUR",
          contentId: hasApp ? "course_plus_app" : "course_only",
          contentName: hasApp
            ? "Le Pack + Application"
            : "Le Pack 85% des mots du Coran",
          contentCategory: "course",
        });
      } catch (err) {
        console.error("[Webhook] TikTok tracking failed", err);
      }

      // Return 200 no matter what — Stripe has done its job; our side
      // of things (DB row) is recorded. Any failures are logged above.
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

          // Server-side StartTrial — signals the conversion to TikTok
          // even if the user never hits a page with the client pixel.
          await ttqServerTrack("StartTrial", {
            event_id: session.id,
            email,
            value: 0,
            currency: "EUR",
            contentId: "monthly_trial",
            contentName: "Quranlab Premium — Essai 7j",
            contentCategory: "subscription",
          });
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

        // Server-side Subscribe — the real revenue moment for the trial
        // funnel. This is what TikTok should optimise ads against.
        await ttqServerTrack("Subscribe", {
          event_id: invoice.id,
          email: invoice.customer_email,
          value: invoice.amount_paid / 100,
          currency: (invoice.currency || "eur").toUpperCase(),
          contentId: "monthly_trial",
          contentName: "Quranlab Premium — Abonnement mensuel",
          contentCategory: "subscription",
        });
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
