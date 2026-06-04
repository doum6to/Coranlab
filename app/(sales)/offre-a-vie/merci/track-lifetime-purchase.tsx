"use client";

import { useEffect, useRef } from "react";

import { ttqTrack } from "@/lib/analytics/tiktok";

/**
 * Fires the TikTok `CompletePayment` event once per /offre-a-vie/merci visit
 * (47€ lifetime app access). De-duplicated by a ref + sessionStorage key so
 * refreshes / bfcache don't double-count the conversion.
 */
export function TrackLifetimePurchase({
  sessionId,
  value = 14.97,
}: {
  sessionId?: string;
  value?: number;
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

    ttqTrack("CompletePayment", {
      value,
      currency: "EUR",
      content_id: "app_lifetime",
      content_name: "Quranlab — Accès à vie",
      content_category: "app",
    });
  }, [sessionId, value]);

  return null;
}
