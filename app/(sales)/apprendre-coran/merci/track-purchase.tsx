"use client";

import { useEffect, useRef } from "react";

import { ttqTrack } from "@/lib/analytics/tiktok";

/**
 * Fires the TikTok `CompletePayment` for the /apprendre-coran subscription.
 *
 * Anti-double-count: the event_id is the Stripe session id (same one the server
 * webhook uses via ttqServerTrack), so TikTok DEDUPLICATES the client (pixel)
 * and server (Events API) events → exactly ONE purchase counted. A ref +
 * sessionStorage guard also prevents refresh / bfcache re-fires.
 */
export function TrackPurchase() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id") || undefined;
    const plan = params.get("plan") || "";
    const rawValue = parseFloat(params.get("value") || "");
    const value = Number.isFinite(rawValue) ? rawValue : undefined;

    const key = `ttq_ac_purchase_${sessionId || window.location.search}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore — still fire */
    }

    const contentId =
      plan === "annual" ? "apprendre_coran_annual" : "apprendre_coran_weekly";

    // event_id (3rd arg) = Stripe session id → deduped with the server event.
    ttqTrack(
      "CompletePayment",
      {
        value,
        currency: "EUR",
        content_id: contentId,
        content_name: "Quranlab Premium (abonnement)",
        content_category: "subscription",
      },
      sessionId,
    );

    // Subscribe: no server counterpart (single source); guarded above.
    ttqTrack(
      "Subscribe",
      { value, currency: "EUR", content_id: contentId, content_category: "subscription" },
      sessionId ? `${sessionId}_sub` : undefined,
    );
  }, []);

  return null;
}
