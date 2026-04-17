"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { ttqTrack } from "@/lib/analytics/tiktok";

/**
 * Fires the TikTok Pixel `CompletePayment` event exactly once per visit to
 * `/85motscoran/merci`. The `plan` query param is set by the Stripe
 * checkout `success_url` (see `actions/course-checkout.ts`) and tells us
 * which amount to report:
 *   - `course` → 9.99€  (one-time pack)
 *   - `combo`  → 24.96€ (pack 9.99€ + first month 14.97€)
 *
 * The event is guarded by a ref so re-renders don't fire duplicates, and
 * by a sessionStorage key keyed on the full URL so a page refresh or the
 * browser's back/forward cache never double-counts a conversion.
 */
export function TrackPurchase() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (plan !== "course" && plan !== "combo") return;

    // De-dup across refreshes of the same merci URL.
    const storageKey = `ttq_complete_payment_${plan}_${
      typeof window !== "undefined" ? window.location.search : ""
    }`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* ignore — still fire */
    }

    const isCombo = plan === "combo";

    ttqTrack("CompletePayment", {
      value: isCombo ? 24.96 : 9.99,
      currency: "EUR",
      content_id: isCombo ? "course_plus_app" : "course_only",
      content_name: isCombo
        ? "Le Pack + Application"
        : "Le Pack 85% des mots du Coran",
      content_category: "course",
    });

    // For the combo, also report the first subscription start. TikTok
    // optimises differently for subscriptions than one-time payments.
    if (isCombo) {
      ttqTrack("Subscribe", {
        value: 14.97,
        currency: "EUR",
        content_id: "app_monthly",
        content_name: "Abonnement Quranlab mensuel",
        content_category: "subscription",
      });
    }
  }, [plan]);

  return null;
}
