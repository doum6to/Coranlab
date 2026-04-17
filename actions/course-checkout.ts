"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

/**
 * Creates a Stripe Checkout session for the /85motscoran landing page.
 *
 * Two variants:
 *   - withApp = false → mode: "payment", one-time 9.99€
 *   - withApp = true  → mode: "subscription", 14.97€/month recurring
 *                       + 9.99€ one-time added to the first invoice
 *
 * No authentication is required: anonymous users can buy. Stripe collects the
 * customer email during checkout. The webhook handles email delivery and
 * optional account linking on subsequent signup.
 *
 * Stripe note: in `mode: "subscription"`, any `line_item` without `recurring`
 * is charged exactly once on the first invoice, which is what we want for the
 * combo (course + app).
 */
export async function createCourseCheckoutUrl(withApp: boolean) {
  try {
    const successUrl = absoluteUrl("/85motscoran/merci");
    const cancelUrl = absoluteUrl("/85motscoran");

    if (!withApp) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "EUR",
              product_data: {
                name: "Cours : 85% des mots du Coran",
                description:
                  "Documents PDF envoyés par email après paiement.",
              },
              unit_amount: 999,
            },
          },
        ],
        metadata: {
          productType: "course",
          hasApp: "false",
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return { url: session.url };
    }

    // Combo : subscription mensuel + cours one-time sur la première facture.
    // En mode "subscription", Stripe accepte des line_items mixtes :
    //   - items avec `recurring` → items de l'abonnement
    //   - items sans `recurring` → ajoutés à la PREMIÈRE invoice uniquement
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "EUR",
            product_data: {
              name: "Application Quranlab : abonnement mensuel",
              description: "Accès premium à toutes les fonctionnalités.",
            },
            unit_amount: 1497,
            recurring: { interval: "month" },
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: "EUR",
            product_data: {
              name: "Cours : 85% des mots du Coran (achat unique)",
              description: "Documents PDF envoyés par email après paiement.",
            },
            unit_amount: 999,
            // Pas de `recurring` → one-time, facturé sur la première invoice
          },
        },
      ],
      subscription_data: {
        metadata: {
          productType: "course_plus_app",
        },
      },
      metadata: {
        productType: "course",
        hasApp: "true",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url };
  } catch (error: any) {
    console.error("[CourseCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}
