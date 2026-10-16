"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getCommencerContent } from "@/lib/commencer-content";

/**
 * Post-purchase upsell on /commencer/merci: the "Lire l'arabe en 7h" video
 * course at a one-time discounted price. Reuses the standalone course
 * fulfilment (productType "arabic_course" in the webhook → course_purchase
 * row → access via "Ma formation" for the account with the same email).
 * The buyer's email is read from the original Checkout session so both
 * purchases land on the same address.
 */
export async function createArabicUpsellCheckout(originalSessionId: string) {
  try {
    const { upsell } = await getCommencerContent();
    if (!upsell.enabled) return { error: "Offre indisponible." };

    let email: string | undefined;
    let customer: string | undefined;
    if (originalSessionId) {
      try {
        const orig = await stripe.checkout.sessions.retrieve(originalSessionId);
        email = orig.customer_details?.email || orig.customer_email || undefined;
        customer = typeof orig.customer === "string" ? orig.customer : undefined;
      } catch (e) {
        console.error("[CommencerUpsell] original session lookup failed:", e);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      ...(customer ? { customer } : email ? { customer_email: email } : {}),
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          product_data: {
            name: "Lire l'arabe en moins de 7h — Accès à vie",
            description: "21 cours en vidéo. Offre membre, paiement unique.",
          },
          unit_amount: Math.max(50, upsell.amountCents),
        },
      }],
      metadata: { productType: "arabic_course", offer: "commencer_upsell" },
      success_url: absoluteUrl(`/commencer/merci?session_id=${encodeURIComponent(originalSessionId)}&upsell=done`),
      cancel_url: absoluteUrl(`/commencer/merci?session_id=${encodeURIComponent(originalSessionId)}&upsell=skip`),
    });
    return { url: session.url };
  } catch (error: any) {
    console.error("[CommencerUpsell] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
