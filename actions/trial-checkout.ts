"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

/**
 * Creates a Stripe Checkout session for the 7-day free trial subscription,
 * immediately after a user signs up from `/85motscoran`.
 *
 * Differs from `createStripeUrl()` (in user-subscription.ts):
 * - No existing-subscription check (freshly signed-up users have none)
 * - No auth() call (the caller already knows the userId and email from the
 *   signup flow; we avoid a round-trip through Supabase session)
 *
 * Stripe collects the CB during checkout but charges 0€ today. Auto-bills
 * 14,97€/month starting on day 7 unless the user cancels from the Billing
 * Portal or via their account settings.
 */
export async function createTrialCheckoutUrl(params: {
  userId: string;
  email: string;
}) {
  try {
    const { userId, email } = params;

    const successUrl = absoluteUrl("/learn");
    const cancelUrl = absoluteUrl("/auth/signup?trial=true");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "EUR",
            product_data: {
              name: "Quranlab Premium",
              description: "Essai 7 jours offerts, puis 14,97€/mois",
            },
            unit_amount: 1497,
            recurring: { interval: "month" },
          },
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId,
          plan: "monthly_trial",
        },
      },
      metadata: {
        userId,
        plan: "monthly_trial",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url };
  } catch (error: any) {
    console.error("[TrialCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
