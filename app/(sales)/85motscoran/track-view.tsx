"use client";

import { useEffect, useRef } from "react";

import { ttqTrack } from "@/lib/analytics/tiktok";

/**
 * Fires TikTok `ViewContent` once per visit to `/85motscoran`.
 * `ttq.page()` already fires on every page, but `ViewContent` is the
 * event TikTok uses to optimise "product page viewers" audiences, which
 * is what we want for this sales funnel.
 */
export function TrackView() {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    ttqTrack("ViewContent", {
      value: 9.99,
      currency: "EUR",
      content_id: "course_only",
      content_name: "Le Pack 85% des mots du Coran",
      content_category: "course",
    });
  }, []);

  return null;
}
