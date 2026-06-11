"use client";

import { useEffect } from "react";

import { ttqTrack } from "@/lib/analytics/tiktok";

/**
 * Fires a single TikTok "ViewContent" pixel event on mount. A frequent
 * upper-funnel signal that lets a Conversions campaign qualify the audience
 * early (before there's enough purchase volume to optimize on CompletePayment).
 */
export function TrackViewContent({
  value,
  currency = "EUR",
}: {
  value: number;
  currency?: string;
}) {
  useEffect(() => {
    ttqTrack("ViewContent", {
      value,
      currency,
      content_id: "app_lifetime",
      content_name: "Quranlab — Accès à vie",
      content_category: "app",
    });
  }, [value, currency]);

  return null;
}
