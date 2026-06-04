"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getOfferSettings } from "@/lib/offer";

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
export async function createAppLifetimeCheckoutUrl() {
  try {
    const { priceCents } = await getOfferSettings();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "EUR",
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
      },
      success_url: absoluteUrl(
        "/offre-a-vie/merci?session_id={CHECKOUT_SESSION_ID}",
      ),
      cancel_url: absoluteUrl("/offre-a-vie"),
    });

    return { url: session.url };
  } catch (error: any) {
    console.error("[AppLifetimeCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
