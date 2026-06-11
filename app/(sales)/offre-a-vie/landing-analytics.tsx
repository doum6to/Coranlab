"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics/track";

/**
 * Records anonymous behavior on the product landing: a page view on mount and
 * scroll-depth milestones (25/50/75/100%), each fired once. CTA / gallery /
 * reviews events are fired from their own components.
 */
export function LandingAnalytics() {
  useEffect(() => {
    // Skip if an early inline beacon already recorded the view (e.g. the
    // TikTok landing fires it before hydration so fast-bouncers are counted).
    if (!(window as any).__qlViewSent) {
      track("lp_view");
    }

    const fired = new Set<number>();
    const milestones = [25, 50, 75, 100];

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      const pct = (window.scrollY / scrollable) * 100;
      for (const m of milestones) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          track(`lp_scroll_${m}`);
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Fire once when the reviews section first becomes visible.
    let reviewsObserver: IntersectionObserver | undefined;
    const reviewsEl = document.getElementById("lp-reviews");
    if (reviewsEl && "IntersectionObserver" in window) {
      reviewsObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            track("lp_reviews_view");
            reviewsObserver?.disconnect();
          }
        },
        { threshold: 0.3 },
      );
      reviewsObserver.observe(reviewsEl);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      reviewsObserver?.disconnect();
    };
  }, []);

  return null;
}
