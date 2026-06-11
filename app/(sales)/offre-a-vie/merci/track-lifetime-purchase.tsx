"use client";

import { useEffect, useRef } from "react";

import { ttqIdentify, ttqTrack } from "@/lib/analytics/tiktok";

/**
 * Fires the TikTok `CompletePayment` conversion once per visit to the
 * thank-you page (deduped via ref + sessionStorage), with advanced matching
 * on the buyer's email for better attribution.
 */
export function TrackLifetimePurchase({
  sessionId,
  value = 14.97,
  email,
}: {
  sessionId?: string;
  value?: number;
  email?: string | null;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const key = `ttq_app_lifetime_${sessionId || ""}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore — still fire */
    }

    ttqIdentify(email);
    ttqTrack(
      "CompletePayment",
      {
        value,
        currency: "EUR",
        content_id: "app_lifetime",
        content_name: "Quranlab — Accès à vie",
        content_category: "app",
      },
      // Same event_id as the server-side event (Stripe session id) so TikTok
      // merges browser + server into ONE conversion instead of counting two.
      sessionId,
    );
  }, [sessionId, value, email]);

  return null;
}
