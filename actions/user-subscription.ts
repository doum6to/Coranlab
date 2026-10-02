"use server";

import { auth, currentUser } from "@/lib/supabase/server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscription } from "@/db/queries";
import type { PremiumPlan } from "@/lib/premium";
import { getServerStrings } from "@/lib/i18n/server-t";
import type { AppStrings } from "@/lib/i18n/app-dict";

const returnUrl = absoluteUrl("/learn");

type PlanConfig = {
  /** Dictionary keys for the product name/description shown by Stripe. */
  name: keyof AppStrings["stripe"];
  description: keyof AppStrings["stripe"];
  unit_amount: number;
  mode: "subscription" | "payment";
  recurring?: { interval: "month" | "year"; interval_count?: number };
  /** If set, Stripe collects the CB but charges 0 for N days, then auto-bills. */
  trial_period_days?: number;
};

const PLAN_CONFIG: Record<PremiumPlan, PlanConfig> = {
  three_months: {
    name: "name3m",
    description: "desc3m",
    unit_amount: 4491, // 14,97€ × 3
    mode: "subscription",
    recurring: { interval: "month", interval_count: 3 },
  },
  six_months: {
    name: "name6m",
    description: "desc6m",
    unit_amount: 7194, // 11,99€ × 6
    mode: "subscription",
    recurring: { interval: "month", interval_count: 6 },
  },
  annual: {
    name: "nameYear",
    description: "descYear",
    unit_amount: 11988, // 119,88€ = 9,99€/mois
    mode: "subscription",
    recurring: { interval: "year" },
  },
  lifetime: {
    name: "nameLifetime",
    description: "descLifetime",
    unit_amount: 29999, // 299,99€
    mode: "payment",
  },
  monthly_trial: {
    name: "nameTrial",
    description: "descTrial",
    unit_amount: 1497, // 14,97€/mois
    mode: "subscription",
    recurring: { interval: "month" },
    trial_period_days: 7,
  },
};

export const createStripeUrl = async (
  plan: PremiumPlan = "three_months",
  withTrial = false,
) => {
  const { t, locale } = getServerStrings();
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.error("[Stripe] Unauthorized - userId:", userId, "user:", !!user);
      throw new Error("Unauthorized");
    }

    const userSubscription = await getUserSubscription();

    // If user has an active subscription, send to billing portal to manage it.
    // Lifetime users have no billing portal (nothing to manage) — skip.
    if (
      userSubscription?.isActive &&
      userSubscription.stripeCustomerId &&
      !userSubscription.isLifetime
    ) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: returnUrl,
      });

      return { data: stripeSession.url };
    }

    const config = PLAN_CONFIG[plan];
    const email = user.emailAddresses[0]?.emailAddress;

    // Build the line item. For subscriptions we attach `recurring`,
    // for one-time payments (lifetime) we omit it entirely.
    const priceData: Record<string, any> = {
      currency: "EUR",
      product_data: {
        name: t.stripe[config.name],
        description: t.stripe[config.description],
      },
      unit_amount: config.unit_amount,
    };
    if (config.mode === "subscription" && config.recurring) {
      priceData.recurring = config.recurring;
    }

    const sessionParams: Record<string, any> = {
      mode: config.mode,
      // Stripe-hosted checkout UI in the user's language.
      locale,
      line_items: [
        {
          quantity: 1,
          price_data: priceData,
        },
      ],
      metadata: {
        userId,
        plan,
      },
      // Reconcile the subscription server-side on return so premium is
      // active immediately, without waiting on the async webhook. Stripe
      // substitutes {CHECKOUT_SESSION_ID}. Lifetime (mode "payment") sessions
      // also pass through; the reconciliation route ignores non-subscription
      // sessions and lets the webhook mark isLifetime.
      success_url: absoluteUrl(
        "/api/stripe/sync?session_id={CHECKOUT_SESSION_ID}",
      ),
      cancel_url: returnUrl,
    };

    // Trial support: CB collected at checkout, 0€ charged today, auto-bill
    // after `trial_period_days`. Stripe sets subscription.status = "trialing"
    // and current_period_end = trial_end, which flows through our existing
    // webhook logic (no extra handling needed for the trial itself).
    //
    // The trial can be intrinsic to the plan (config.trial_period_days, e.g.
    // the legacy monthly_trial) OR requested at call time on ANY multi-month
    // subscription via `withTrial` — this lets the pricing screen offer "7 days
    // free, then your chosen plan" without introducing a monthly tariff.
    const trialDays =
      config.trial_period_days ??
      (withTrial && config.mode === "subscription" ? 7 : undefined);
    if (config.mode === "subscription" && trialDays) {
      sessionParams.subscription_data = {
        ...(sessionParams.subscription_data || {}),
        trial_period_days: trialDays,
      };
    }

    // Reuse existing Stripe customer if available, otherwise use email
    if (userSubscription?.stripeCustomerId) {
      sessionParams.customer = userSubscription.stripeCustomerId;
    } else {
      sessionParams.customer_email = email;
    }

    const stripeSession = await stripe.checkout.sessions.create(sessionParams);

    return { data: stripeSession.url };
  } catch (error: any) {
    console.error("[Stripe] Error creating checkout:", error);
    return { error: error?.message || t.server.unknown };
  }
};
