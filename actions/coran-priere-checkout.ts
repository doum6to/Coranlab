"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getCoranPriereLandingContent } from "@/lib/coran-priere-landing-content";

/**
 * Stripe EMBEDDED Checkout for the /comprendre-sa-priere variant. Same product
 * & fulfillment as /coran (lifetime Premium access via the anonymous course
 * pipeline), but the price is read from this page's own admin-editable content
 * so it can be tuned independently. `variant: "coran-priere"` is only used for
 * attribution — the webhook treats it exactly like the /coran purchase.
 */
export async function createCoranPriereEmbeddedCheckout() {
  try {
    const content = await getCoranPriereLandingContent();
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
        variant: "coran-priere",
      },
      return_url: absoluteUrl(
        "/offre-a-vie/merci?session_id={CHECKOUT_SESSION_ID}",
      ),
    });

    return { clientSecret: session.client_secret };
  } catch (error: any) {
    console.error("[CoranPriereCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
