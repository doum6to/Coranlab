"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getApprendreCoranContent } from "@/lib/apprendre-coran-content";

/**
 * Stripe Checkout for the /apprendre-coran onboarding paywall — an ANONYMOUS
 * recurring subscription (weekly or annual). No account is required up front.
 *
 * It reuses the existing anonymous course-purchase pipeline by tagging the
 * session with productType "course" + hasApp "true". On payment, the Stripe
 * webhook:
 *   1. records a course_purchase row (with the subscription id), and
 *   2. emails the buyer a link to CREATE their account (sendCoursePurchaseEmail).
 * When they sign up / log in with that same email, linkCoursePurchaseByEmail()
 * grants the matching recurring premium subscription.
 *
 * Prices are read live from the admin-editable content, so an admin price
 * change applies to the very next checkout.
 */
export async function createApprendreCoranCheckout(plan: "weekly" | "annual") {
  try {
    const content = await getApprendreCoranContent();
    const cfg = plan === "annual" ? content.paywall.annual : content.paywall.weekly;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            recurring: { interval: cfg.interval },
            product_data: {
              name:
                cfg.interval === "year"
                  ? "Quranlab Premium — Accès annuel"
                  : "Quranlab Premium — Accès hebdomadaire",
              description: "Comprends le Coran, sans limite. Annulable à tout moment.",
            },
            unit_amount: cfg.amountCents,
          },
        },
      ],
      metadata: {
        productType: "course",
        hasApp: "true",
        offer: "apprendre_coran",
        plan,
      },
      // session_id lets the /merci page fire CompletePayment with the SAME
      // event_id as the server webhook → TikTok dedupes (no double count).
      // plan + value are for the client event's reporting.
      success_url: absoluteUrl(
        `/apprendre-coran/merci?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&value=${(cfg.amountCents / 100).toFixed(2)}`,
      ),
      cancel_url: absoluteUrl("/apprendre-coran"),
    });

    return { url: session.url };
  } catch (error: any) {
    console.error("[ApprendreCoranCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
