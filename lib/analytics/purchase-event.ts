import "server-only";
import type Stripe from "stripe";

import db from "@/db/drizzle";
import { analyticsEvent } from "@/db/schema";

/** Landing path a checkout variant belongs to (for per-landing attribution). */
function pathForVariant(variant: string | undefined): string {
  if (variant === "tiktok") return "/comprendre-le-coran";
  if (variant === "v4" || variant === "funnelB") return "/offre-a-vie-v4";
  return "/offre-a-vie";
}

/**
 * Records a server-side "purchase" analytics event for a lifetime-offer
 * Checkout Session, attributed to the landing it came from (via the
 * `variant` metadata set at checkout creation).
 *
 * Exactly-once: callers only invoke this when THEIR course_purchase insert
 * actually created the row (insert ... onConflictDoNothing ... returning),
 * so the webhook and the /merci reconcile never both record the same sale.
 * Best-effort: never throws.
 */
export async function recordPurchaseEvent(session: Stripe.Checkout.Session) {
  try {
    const variant = (session.metadata?.variant as string) || "v3";
    await db.insert(analyticsEvent).values({
      event: "purchase",
      path: pathForVariant(variant),
      locale: (session.metadata?.locale as string) || null,
      sessionId: null,
      meta: JSON.stringify({
        variant,
        amount:
          typeof session.amount_total === "number"
            ? session.amount_total / 100
            : null,
        currency: session.currency || null,
      }),
    });
  } catch (e) {
    console.error("[analytics] recordPurchaseEvent failed:", e);
  }
}
