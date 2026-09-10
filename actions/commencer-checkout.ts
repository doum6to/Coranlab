"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getCommencerContent } from "@/lib/commencer-content";

/**
 * Stripe Checkout for the /commencer paywall — an ANONYMOUS recurring
 * subscription (weekly or annual), BOTH with a 7-day free trial.
 *
 * Reuses the anonymous course pipeline (productType "course" + hasApp "true"):
 * the webhook records a course_purchase (with the subscription id) even at 0 €
 * during the trial, emails the buyer a "create your account" link, and
 * linkCoursePurchaseByEmail() grants Premium (current_period_end = trial end,
 * then renewed by Stripe). trial_will_end / invoice.* events are already wired.
 */
export async function createCommencerCheckout(plan: "weekly" | "annual", email?: string) {
  try {
    const content = await getCommencerContent();
    const cfg = plan === "annual" ? content.paywall.annual : content.paywall.weekly;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...(email ? { customer_email: email } : {}),
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          recurring: { interval: cfg.interval },
          product_data: {
            name: cfg.interval === "year" ? "Quranlab Premium — Accès annuel" : "Quranlab Premium — Accès hebdomadaire",
            description: "7 jours d'essai gratuit, puis abonnement. Annulable à tout moment.",
          },
          unit_amount: cfg.amountCents,
        },
      }],
      subscription_data: { trial_period_days: 7, metadata: { plan: `commencer_${plan}_trial`, offer: "commencer" } },
      metadata: { productType: "course", hasApp: "true", offer: "commencer", plan },
      success_url: absoluteUrl(`/commencer/merci?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&value=${(cfg.amountCents / 100).toFixed(2)}`),
      cancel_url: absoluteUrl("/commencer?step=paywall"),
    });
    return { url: session.url };
  } catch (error: any) {
    console.error("[CommencerCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
