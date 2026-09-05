"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getEbook30Content } from "@/lib/ebook30-content";

/**
 * Stripe EMBEDDED Checkout for /coran-30-jours. Same fulfillment as /coran
 * (PDF + lifetime Premium via the anonymous course pipeline): the webhook sees
 * productType "course" + hasApp "true", writes a course_purchase, emails the
 * buyer and grants Premium on signup with the same email. Price is read from
 * this page's own admin-editable content. `variant` is for attribution only.
 */
export async function createEbook30EmbeddedCheckout() {
  try {
    const content = await getEbook30Content();
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
              name: "Comprendre 85% du Coran en 30 jours",
              description: "Ebook + accès Premium à vie à l'application.",
            },
            unit_amount: amountCents,
          },
        },
      ],
      metadata: {
        productType: "course",
        hasApp: "true",
        offer: "coran_ebook30",
        locale: "fr",
        currency,
        variant: "ebook30",
      },
      return_url: absoluteUrl("/offre-a-vie/merci?session_id={CHECKOUT_SESSION_ID}"),
    });

    return { clientSecret: session.client_secret };
  } catch (error: any) {
    console.error("[Ebook30Checkout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
