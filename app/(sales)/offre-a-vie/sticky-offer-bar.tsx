"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import type { Locale } from "@/lib/i18n/locales";
import { BuyButton } from "./buy-button";
import { useCountdown24, fmtCountdown } from "./use-countdown";

/**
 * Red sticky bottom bar: urgency text + looping 24h countdown + price + CTA.
 * Hides itself while the pricing section (#offre) is on screen. Shown only when
 * enabled from the admin; text/CTA come from the (editable) landing content.
 */
export function StickyOfferBar({
  text,
  ctaLabel,
  priceLabel,
  priceValue,
  locale,
  variant = "v3",
}: {
  text: string;
  ctaLabel: string;
  priceLabel: string;
  priceValue: number;
  locale: Locale;
  variant?: "v3" | "v4";
}) {
  const [hidden, setHidden] = useState(false);
  const remaining = useCountdown24();

  useEffect(() => {
    const el = document.getElementById("offre");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="bg-gradient-to-r from-[#e11d48] to-[#f43f5e] text-white shadow-[0_-4px_20px_rgba(0,0,0,0.18)]">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <span className="hidden text-sm font-bold sm:inline">{text}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 font-display text-sm font-extrabold tabular-nums sm:text-base">
              <Clock className="h-4 w-4" strokeWidth={2.5} />
              {remaining == null ? "24:00:00" : fmtCountdown(remaining)}
            </span>
            <span className="font-display text-base font-extrabold sm:text-lg">
              {priceLabel}
            </span>
          </div>
          <div className="w-[140px] shrink-0 sm:w-[180px]">
            <BuyButton
              label={ctaLabel}
              priceValue={priceValue}
              locale={locale}
              variant={variant}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
