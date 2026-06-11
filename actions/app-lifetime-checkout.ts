"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getOfferSettings, getLocalePrice } from "@/lib/offer";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";

const CANCEL_PATH: Record<Locale, string> = {
  fr: "/offre-a-vie",
  en: "/en/offre-a-vie",
  es: "/es/offre-a-vie",
};

/**
 * Stripe Checkout for the lifetime app-access offer (/offre-a-vie): a single
 * one-time payment that grants permanent Premium access. The amount is read
 * live from the admin-editable offer settings, so a price change in the
 * admin applies to the very next payment.
 *
 * No auth required (anonymous landing page). We reuse the existing anonymous
 * course-purchase pipeline by tagging the session with productType "course" +
 * hasApp "true": the Stripe webhook then writes a course_purchase row
 * (hasAppSubscription=true, no subscription id). When the buyer later signs up
 * with the same email, linkCoursePurchaseIfAny() detects the "hasApp but no
 * subscription" case and grants a lifetime user_subscription row.
 *
 * The `offer: "app_lifetime"` tag is for analytics/traceability only.
 */
export async function createAppLifetimeCheckoutUrl(
  locale: Locale = DEFAULT_LOCALE,
  variant:
    | "v3"
    | "v4"
    | "funnel"
    | "funnelB"
    | "tiktok"
    | "tiktokB" = "v3",
  lead?: { email?: string; firstName?: string },
) {
  try {
    if (!isLocale(locale)) locale = DEFAULT_LOCALE;
    if (
      variant !== "v4" &&
      variant !== "funnel" &&
      variant !== "funnelB" &&
      variant !== "tiktok" &&
      variant !== "tiktokB"
    )
      variant = "v3";
    const offer = await getOfferSettings();
    const { currency, priceCents } = getLocalePrice(offer, locale, variant);

    // When the funnel collected an email/first name up-front, prefill the
    // Checkout email and remember the first name so the thank-you page can
    // pre-fill the signup form too. Stripe metadata values must be strings.
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const customerEmail =
      lead?.email && emailRe.test(lead.email.trim())
        ? lead.email.trim().toLowerCase()
        : undefined;
    const firstName = (lead?.firstName || "").trim().slice(0, 80);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      // Collect the phone number — strengthens TikTok/Meta advanced matching
      // (email + phone), which TikTok reports as ~-13% CPA.
      phone_number_collection: { enabled: true },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "Quranlab — Accès à vie à l'application",
              description:
                "Paiement unique. Accès Premium à vie + les documents PDF en bonus.",
            },
            unit_amount: priceCents,
          },
        },
      ],
      metadata: {
        productType: "course",
        hasApp: "true",
        offer: "app_lifetime",
        locale,
        currency,
        variant,
        ...(firstName ? { firstName } : {}),
      },
      success_url: absoluteUrl(
        "/offre-a-vie/merci?session_id={CHECKOUT_SESSION_ID}",
      ),
      cancel_url: absoluteUrl(
        variant === "tiktok"
          ? "/comprendre-le-coran"
          : variant === "tiktokB"
            ? "/comprendre-le-coran-b"
            : CANCEL_PATH[locale],
      ),
    });

    return { url: session.url };
  } catch (error: any) {
    console.error("[AppLifetimeCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
