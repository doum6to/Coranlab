"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getCommencerContent } from "@/lib/commencer-content";
import { COMMENCER_EN } from "@/lib/commencer-en";

/**
 * Stripe Checkout for the /commencer paywall — a ONE-TIME lifetime payment
 * (no trial, no subscription). Reuses the anonymous course pipeline
 * (productType "course" + hasApp "true"): the webhook records a
 * course_purchase, emails the buyer a "create your account" link and
 * linkCoursePurchaseByEmail() grants lifetime Premium on signup.
 */
export async function createCommencerCheckout(email?: string, locale: "fr" | "en" | "es" = "fr") {
  try {
    const { paywall } = locale === "en" ? COMMENCER_EN : await getCommencerContent();
    // FR flow lives at /commencer, the English one at /start.
    const base = locale === "fr" ? "/commencer" : "/start";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale,
      ...(email ? { customer_email: email } : {}),
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          product_data: {
            name: locale === "fr" ? "Quranlab Premium — Accès à vie" : "Quranlab Premium — Lifetime access",
            description: locale === "fr" ? "Paiement unique. Toutes les leçons, à vie, sans abonnement." : "One-time payment. Every lesson, for life, no subscription.",
          },
          unit_amount: paywall.amountCents,
        },
      }],
      metadata: { productType: "course", hasApp: "true", offer: "commencer", plan: "lifetime", locale },
      success_url: absoluteUrl(`${base}/merci?session_id={CHECKOUT_SESSION_ID}&value=${(paywall.amountCents / 100).toFixed(2)}`),
      cancel_url: absoluteUrl(`${base}?step=paywall`),
    });
    return { url: session.url };
  } catch (error: any) {
    console.error("[CommencerCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
