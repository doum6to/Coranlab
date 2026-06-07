"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

/**
 * Stripe Checkout for the standalone "Lire l'arabe en 7h" course — a single
 * 27€ payment, separate from the app premium / ebook offer. Anonymous; the
 * email is collected at checkout.
 */
export async function createArabicCourseCheckoutUrl() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "EUR",
            product_data: {
              name: "Lire l'arabe en moins de 7h — Accès à vie",
              description:
                "21 cours en vidéo. Accès à vie, paiement unique.",
            },
            unit_amount: 2700,
          },
        },
      ],
      metadata: {
        productType: "arabic_course",
      },
      success_url: absoluteUrl("/lire-larabe/merci?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: absoluteUrl("/lire-larabe"),
    });

    return { url: session.url };
  } catch (error: any) {
    console.error("[ArabicCourseCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
