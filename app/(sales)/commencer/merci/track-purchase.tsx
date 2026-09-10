"use client";

import { useEffect, useRef } from "react";

import { ttqTrack } from "@/lib/analytics/tiktok";

/**
 * Fires TikTok events for a /commencer trial start. event_id = Stripe session
 * id so the pixel event is DEDUPED with the server webhook event (one count).
 * A ref + sessionStorage guard prevents refresh / bfcache re-fires.
 */
export function TrackTrialStart() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id") || undefined;
    const plan = params.get("plan") || "";
    const rawValue = parseFloat(params.get("value") || "");
    const value = Number.isFinite(rawValue) ? rawValue : undefined;
    const key = `ttq_cm_trial_${sessionId || window.location.search}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch { /* still fire */ }
    const contentId = plan === "annual" ? "commencer_annual_trial" : "commencer_weekly_trial";
    ttqTrack("StartTrial", { value, currency: "EUR", content_id: contentId, content_name: "Quranlab Premium (essai 7 jours)", content_category: "subscription" }, sessionId);
    ttqTrack("CompletePayment", { value: 0, currency: "EUR", content_id: contentId, content_category: "subscription" }, sessionId);
  }, []);
  return null;
}
