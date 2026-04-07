"use server";

import { auth, currentUser } from "@/lib/supabase/server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscription } from "@/db/queries";
import type { PremiumPlan } from "@/lib/premium";

const returnUrl = absoluteUrl("/learn");

const PLAN_CONFIG: Record<PremiumPlan, {
  name: string;
  description: string;
  unit_amount: number;
  interval: "month" | "year";
}> = {
  monthly: {
    name: "Quranlab Premium (Mensuel)",
    description: "Accès illimité à tous les cours",
    unit_amount: 1497, // 14.97 EUR
    interval: "month",
  },
  annual: {
    name: "Quranlab Premium (Annuel)",
    description: "Accès illimité à tous les cours — facturé annuellement",
    unit_amount: 11988, // 119.88 EUR = 9.99/mois
    interval: "year",
  },
};

export const createStripeUrl = async (plan: PremiumPlan = "monthly") => {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.error("[Stripe] Unauthorized - userId:", userId, "user:", !!user);
      throw new Error("Unauthorized");
    }

    const userSubscription = await getUserSubscription();

    // If user has an active subscription, send to billing portal to manage it
    if (userSubscription?.isActive && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: returnUrl,
      });

      return { data: stripeSession.url };
    }

    const config = PLAN_CONFIG[plan];
    const email = user.emailAddresses[0]?.emailAddress;

    // Create a new checkout session (works for new users and users
    // whose previous subscription expired or was never completed)
    const sessionParams: Record<string, any> = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "EUR",
            product_data: {
              name: config.name,
              description: config.description,
            },
            unit_amount: config.unit_amount,
            recurring: {
              interval: config.interval,
            },
          },
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
