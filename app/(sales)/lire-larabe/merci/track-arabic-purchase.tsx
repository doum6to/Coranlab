"use client";

import { useEffect, useRef } from "react";

import { ttqIdentify, ttqTrack } from "@/lib/analytics/tiktok";

/**
 * Fires the TikTok `CompletePayment` conversion once per visit to the
 * thank-you page (deduped via ref + sessionStorage), with advanced matching
 * on the buyer's email for better attribution.
 */
export function TrackArabicPurchase({
  sessionId,
  value = 27,
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

    const key = `ttq_arabic_course_${sessionId || ""}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore — still fire */
    }

    ttqIdentify(email);
    ttqTrack("CompletePayment", {
      value,
      currency: "EUR",
      content_id: "arabic_course",
      content_name: "Lire l'arabe en 7h",
      content_category: "course",
    });
  }, [sessionId, value, email]);

  return null;
}
