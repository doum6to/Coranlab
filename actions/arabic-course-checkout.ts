"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getArabicLandingContent } from "@/lib/arabic-landing-content";

/**
 * Stripe Checkout for the standalone "Lire l'arabe en 7h" course — a single
 * one-time payment, separate from the app premium / ebook offer. Anonymous;
 * the email is collected at checkout. The amount is read from the admin-
 * editable landing content so price stays in sync with what's displayed.
 */
export async function createArabicCourseCheckoutUrl() {
  try {
    const content = await getArabicLandingContent();
    const unitAmount = Math.max(50, Math.round(content.pricing.priceCents) || 2700);

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
            unit_amount: unitAmount,
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
