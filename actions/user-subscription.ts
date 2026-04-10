"use server";

import { auth, currentUser } from "@/lib/supabase/server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscription } from "@/db/queries";
import type { PremiumPlan } from "@/lib/premium";

const returnUrl = absoluteUrl("/learn");

type PlanConfig = {
  name: string;
  description: string;
  unit_amount: number;
  mode: "subscription" | "payment";
  recurring?: { interval: "month" | "year"; interval_count?: number };
};

const PLAN_CONFIG: Record<PremiumPlan, PlanConfig> = {
  three_months: {
    name: "Quranlab Premium (3 mois)",
    description: "Accès illimité — facturé tous les 3 mois",
    unit_amount: 4491, // 14,97€ × 3
    mode: "subscription",
    recurring: { interval: "month", interval_count: 3 },
  },
  six_months: {
    name: "Quranlab Premium (6 mois)",
    description: "Accès illimité — facturé tous les 6 mois",
    unit_amount: 7194, // 11,99€ × 6
    mode: "subscription",
    recurring: { interval: "month", interval_count: 6 },
  },
  annual: {
    name: "Quranlab Premium (Annuel)",
    description: "Accès illimité à tous les cours — facturé annuellement",
    unit_amount: 11988, // 119,88€ = 9,99€/mois
    mode: "subscription",
    recurring: { interval: "year" },
  },
  lifetime: {
    name: "Quranlab Premium (À vie)",
    description:
      "Accès illimité à tous les cours — paiement unique, à vie",
    unit_amount: 29999, // 299,99€
    mode: "payment",
  },
};

export const createStripeUrl = async (
  plan: PremiumPlan = "three_months"
) => {
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
        name: config.name,
        description: config.description,
      },
      unit_amount: config.unit_amount,
    };
    if (config.mode === "subscription" && config.recurring) {
      priceData.recurring = config.recurring;
    }

    const sessionParams: Record<string, any> = {
      mode: config.mode,
      payment_method_types: ["card"],
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
      success_url: returnUrl,
      cancel_url: returnUrl,
    };

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
    return { error: error?.message || "Unknown error" };
  }
};
