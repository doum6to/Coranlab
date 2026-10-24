"use client";

import { useEffect, useRef } from "react";

import { ttqTrack } from "@/lib/analytics/tiktok";

/**
 * Fires the TikTok purchase event for a /commencer lifetime purchase.
 * event_id = Stripe session id so the pixel event is DEDUPED with the server
 * webhook event (one count). A ref + sessionStorage guard prevents refresh /
 * bfcache re-fires.
 */
export function TrackPurchase() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id") || undefined;
    const rawValue = parseFloat(params.get("value") || "");
    const value = Number.isFinite(rawValue) ? rawValue : undefined;
    const currency = (params.get("cur") || "EUR").toUpperCase();
    const key = `ttq_cm_buy_${sessionId || window.location.search}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch { /* still fire */ }
    ttqTrack("CompletePayment", { value, currency, content_id: "commencer_lifetime", content_name: "Quranlab Premium (accès à vie)", content_category: "course" }, sessionId);
  }, []);
  return null;
}
