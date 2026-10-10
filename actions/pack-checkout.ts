"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getPackContent } from "@/lib/pack-content";

/**
 * Stripe EMBEDDED Checkout for /pack-coran: ONE-TIME payment (no subscription).
 * Fulfilment reuses the anonymous course pipeline: the webhook sees
 * productType "course" + hasApp "true", writes a course_purchase, emails the
 * buyer the access link (PDF + bonuses) and grants lifetime Premium on signup
 * with the same email. Price is read from this page's admin content.
 */
export async function createPackEmbeddedCheckout() {
  try {
    const content = await getPackContent();
    const { currency, amountCents } = content.price;

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      locale: "fr",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "Pack Comprendre 85% du Coran — Guide PDF + bonus",
              description: "Paiement unique. Accès à vie, livré par email avec lien d'accès.",
            },
            unit_amount: amountCents,
          },
        },
      ],
      metadata: {
        productType: "course",
        hasApp: "true",
        offer: "pack_coran",
        locale: "fr",
        currency,
        variant: "pack47",
      },
      return_url: absoluteUrl("/offre-a-vie/merci?session_id={CHECKOUT_SESSION_ID}"),
    });

    return { clientSecret: session.client_secret };
  } catch (error: any) {
    console.error("[PackCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
