import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { analyticsEvent } from "@/db/schema";

export const runtime = "nodejs";

/** Events we accept (allowlist) — anonymous landing behavior. */
const ALLOWED = new Set([
  "lp_view",
  "lp_scroll_25",
  "lp_scroll_50",
  "lp_scroll_75",
  "lp_scroll_100",
  "lp_gallery_open",
  "lp_reviews_view",
  "lp_cta_click",
  "lp_checkout_start",
  "coran_view",
  "coran_gallery_open",
  "coran_cta_click",
  "coran_reviews_view",
  "coran_checkout_start",
  "coran_checkout_view",
  // Try-before-you-buy funnel steps (/offre-a-vie "Tunnel" variant).
  "funnel_view",
  "funnel_lead",
  "funnel_exercise_done",
  "funnel_offer_view",
  "funnel_checkout_start",
]);

/**
 * Event families of the newer funnels (/commencer + /start steps, post-purchase
 * upsells, boutique, /pack-coran). A strict pattern instead of one entry per
 * event, so a new step or product never gets silently dropped again.
 */
const ALLOWED_PATTERN = /^(cm|commencer|upsell|shop|pack)_[a-z0-9_]{1,34}$/;

const str = (v: unknown, max = 120) =>
  typeof v === "string" ? v.slice(0, max) : null;

/**
 * POST /api/track — records a single anonymous behavior event. Fire-and-forget
 * from the client (sendBeacon). Always returns 200 so it never disrupts the UX;
 * invalid/unknown events and DB errors are silently ignored.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = str(body?.event, 40);
    if (!event || !(ALLOWED.has(event) || ALLOWED_PATTERN.test(event))) {
      return NextResponse.json({ ok: true });
    }
    const insert = db.insert(analyticsEvent).values({
      event,
      path: str(body?.path, 200),
      locale: str(body?.locale, 8),
      sessionId: str(body?.sessionId, 64),
      meta: str(body?.meta, 200),
    }).then(() => undefined, (e: unknown) => { console.error("[track] failed:", e); });
    // Never hold the visitor's connection: a slow database must not delay the page
    // (browsers allow few parallel requests per site, and pending ones queue the rest).
    await Promise.race([insert, new Promise<void>((resolve) => setTimeout(resolve, 1500))]);
  } catch (e) {
    // Swallow — analytics must never break the page or checkout.
    console.error("[track] failed:", e);
  }
  return NextResponse.json({ ok: true });
}
