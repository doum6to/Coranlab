"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getDuasLandingContent } from "@/lib/duas-landing-content";

/**
 * Stripe EMBEDDED Checkout for the /duas product. Delivery is by email only:
 * the webhook (and the /duas/merci reconcile) send the buyer the Google Drive
 * link — no account, no premium. Metadata productType "drive" routes it.
 */
export async function createDuasEmbeddedCheckout() {
  try {
    const content = await getDuasLandingContent();
    const { currency, amountCents } = content.price;

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: content.title || "Recueil de duas",
              description: "Paiement unique. Lien Google Drive envoyé par email.",
            },
            unit_amount: amountCents,
          },
        },
      ],
      metadata: {
        productType: "drive",
        product: "duas",
        locale: "fr",
        currency,
      },
      return_url: absoluteUrl("/duas/merci?session_id={CHECKOUT_SESSION_ID}"),
    });

    return { clientSecret: session.client_secret };
  } catch (error: any) {
    console.error("[DuasCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
