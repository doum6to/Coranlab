"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getCommencerContent } from "@/lib/commencer-content";

/**
 * Stripe Checkout for the /commencer paywall — a ONE-TIME lifetime payment
 * (no trial, no subscription). Reuses the anonymous course pipeline
 * (productType "course" + hasApp "true"): the webhook records a
 * course_purchase, emails the buyer a "create your account" link and
 * linkCoursePurchaseByEmail() grants lifetime Premium on signup.
 */
export async function createCommencerCheckout(email?: string) {
  try {
    const { paywall } = await getCommencerContent();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      ...(email ? { customer_email: email } : {}),
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          product_data: {
            name: "Quranlab Premium — Accès à vie",
            description: "Paiement unique. Toutes les leçons, à vie, sans abonnement.",
          },
          unit_amount: paywall.amountCents,
        },
      }],
      metadata: { productType: "course", hasApp: "true", offer: "commencer", plan: "lifetime" },
      success_url: absoluteUrl(`/commencer/merci?session_id={CHECKOUT_SESSION_ID}&value=${(paywall.amountCents / 100).toFixed(2)}`),
      cancel_url: absoluteUrl("/commencer?step=paywall"),
    });
    return { url: session.url };
  } catch (error: any) {
    console.error("[CommencerCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
