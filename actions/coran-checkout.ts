"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getCoranLandingContent } from "@/lib/coran-landing-content";

/**
 * Stripe EMBEDDED Checkout for the Stan.store-style page (/coran). Returns a
 * client secret that the on-page <EmbeddedCheckout> renders — no redirect.
 *
 * Price is read live from the admin-editable /coran content. Fulfillment reuses
 * the existing anonymous course pipeline: the webhook sees productType "course"
 * + hasApp "true", writes a course_purchase (lifetime), emails the buyer, and
 * grants premium when they sign up with the same email.
 */
export async function createCoranEmbeddedCheckout() {
  try {
    const content = await getCoranLandingContent();
    const { currency, amountCents } = content.price;

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      // Name + email only (no postal address, no phone — least friction).
      // Stripe always collects the email; the cardholder name lands in
      // customer_details.name.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: content.title || "Comprendre 85% du Coran",
              description:
                "Paiement unique. Accès Premium à vie + les documents PDF.",
            },
            unit_amount: amountCents,
          },
        },
      ],
      metadata: {
        productType: "course",
        hasApp: "true",
        offer: "coran_guide",
        locale: "fr",
        currency,
        variant: "coran",
      },
      return_url: absoluteUrl(
        "/offre-a-vie/merci?session_id={CHECKOUT_SESSION_ID}",
      ),
    });

    return { clientSecret: session.client_secret };
  } catch (error: any) {
    console.error("[CoranCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
