import "server-only";
import type Stripe from "stripe";
import { and, eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { analyticsEvent } from "@/db/schema";

/** Landing path a checkout variant belongs to (for per-landing attribution). */
function pathForVariant(variant: string | undefined): string {
  if (variant === "tiktok") return "/comprendre-le-coran";
  if (variant === "tiktokB") return "/comprendre-le-coran-b";
  if (variant === "v4" || variant === "funnelB") return "/offre-a-vie-v4";
  return "/offre-a-vie";
}

/**
 * Records a server-side "purchase" analytics event for a lifetime-offer
 * Checkout Session, attributed to the landing it came from (via the
 * `variant` metadata set at checkout creation).
 *
 * Idempotent per Stripe session: the session id is stored in `session_id` and
 * we skip if a purchase event already exists for it — so the webhook AND the
 * /merci reconcile (and Stripe retries) can all call this without ever
 * double-counting a sale. Best-effort: never throws.
 */
export async function recordPurchaseEvent(session: Stripe.Checkout.Session) {
  try {
    // Already recorded for this checkout session? → stop (dedupe).
    const existing = await db
      .select({ id: analyticsEvent.id })
      .from(analyticsEvent)
      .where(
        and(
          eq(analyticsEvent.event, "purchase"),
          eq(analyticsEvent.sessionId, session.id),
        ),
      )
      .limit(1);
    if (existing.length > 0) return;

    const variant = (session.metadata?.variant as string) || "v3";
    await db.insert(analyticsEvent).values({
      event: "purchase",
      path: pathForVariant(variant),
      locale: (session.metadata?.locale as string) || null,
      sessionId: session.id,
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
