"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getCommencerContent } from "@/lib/commencer-content";
import { COMMENCER_EN } from "@/lib/commencer-en";
import { isPaywallCurrency, type PaywallCurrency } from "@/lib/geo-currency";

/**
 * Stripe Checkout for the /commencer paywall — a ONE-TIME lifetime payment
 * (no trial, no subscription). Reuses the anonymous course pipeline
 * (productType "course" + hasApp "true"): the webhook records a
 * course_purchase, emails the buyer a "create your account" link and
 * linkCoursePurchaseByEmail() grants lifetime Premium on signup.
 */
type Locale = "fr" | "en" | "es";

/** What both flows (hosted page and on-page sheet) charge: the same one-time lifetime purchase. */
async function sessionParams(email: string | undefined, locale: Locale, currencyIn: PaywallCurrency) {
  // Same amount (e.g. 1499 minor units) charged in the visitor's currency.
  const currency: PaywallCurrency = isPaywallCurrency(currencyIn) ? currencyIn : "EUR";
  const { paywall } = locale === "en" ? COMMENCER_EN : await getCommencerContent();
  // FR flow lives at /commencer, the English one at /start.
  const base = locale === "fr" ? "/commencer" : "/start";
  const doneUrl = absoluteUrl(`${base}/merci?session_id={CHECKOUT_SESSION_ID}&value=${(paywall.amountCents / 100).toFixed(2)}&cur=${currency}`);
  const params = {
    mode: "payment" as const,
    locale,
    ...(email ? { customer_email: email } : {}),
    line_items: [{
      quantity: 1,
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: locale === "fr" ? "Quranlab Premium — Accès à vie" : "Quranlab Premium — Lifetime access",
          description: locale === "fr" ? "Paiement unique. Toutes les leçons, à vie, sans abonnement." : "One-time payment. Every lesson, for life, no subscription.",
        },
        unit_amount: paywall.amountCents,
      },
    }],
    metadata: { productType: "course", hasApp: "true", offer: "commencer", plan: "lifetime", locale, currency },
  };
  return { params, doneUrl, base };
}

/** Hosted Stripe page (redirect). Kept as the fallback of the on-page sheet. */
export async function createCommencerCheckout(email?: string, locale: Locale = "fr", currencyIn: PaywallCurrency = "EUR") {
  try {
    const { params, doneUrl, base } = await sessionParams(email, locale, currencyIn);
    const session = await stripe.checkout.sessions.create({
      ...params,
      success_url: doneUrl,
      cancel_url: absoluteUrl(`${base}?step=paywall`),
    });
    return { url: session.url };
  } catch (error: any) {
    console.error("[CommencerCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}

/**
 * Same purchase, paid without leaving the paywall: Stripe Embedded Checkout
 * shown in a sheet (Apple Pay, Google Pay, Link, Klarna, card — whatever the
 * Stripe account offers). It is the same Checkout Session object as the hosted
 * page, so the webhook, the thank-you page and the upsells work unchanged.
 */
export async function createCommencerEmbeddedCheckout(email?: string, locale: Locale = "fr", currencyIn: PaywallCurrency = "EUR"): Promise<{ clientSecret: string | null } | { error: string }> {
  try {
    const { params, doneUrl } = await sessionParams(email, locale, currencyIn);
    const session = await stripe.checkout.sessions.create({ ...params, ui_mode: "embedded", return_url: doneUrl });
    return { clientSecret: session.client_secret };
  } catch (error: any) {
    console.error("[CommencerEmbeddedCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
