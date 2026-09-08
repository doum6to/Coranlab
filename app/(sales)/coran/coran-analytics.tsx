"use client";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/track";
export function CoranAnalytics() {
 const viewed = useRef(false);
 useEffect(() => {
  if (!viewed.current) { track("lp_view", "coran_conversion_v2"); viewed.current = true; }
  const clicked = (event: MouseEvent) => {
   const target = event.target instanceof Element ? event.target.closest("a,button") : null;
   if (target?.getAttribute("href") === "#checkout" || target?.hasAttribute("data-coran-cta")) track("lp_cta_click", "coran_conversion_v2");
   if (target?.hasAttribute("data-coran-extract")) track("lp_gallery_open", "coran_conversion_v2");
  };
  const seen = new Set<string>();
  const observer = new IntersectionObserver((entries) => {
   for (const entry of entries) if (entry.isIntersecting && !seen.has(entry.target.id)) {
    seen.add(entry.target.id);
    track(entry.target.id === "avis" ? "lp_reviews_view" : "lp_checkout_view", "coran_conversion_v2");
   }
  }, { threshold: 0.1 });
  for (const id of ["avis", "checkout"]) { const el = document.getElementById(id); if (el) observer.observe(el); }
  document.addEventListener("click", clicked);
  return () => { document.removeEventListener("click", clicked); observer.disconnect(); };
 }, []);
 return null;
}
