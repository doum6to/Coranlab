"use client";

import { Clock } from "lucide-react";

import { LANDING_UI } from "@/lib/i18n/landing-ui";
import type { Locale } from "@/lib/i18n/locales";
import { SpotsProgress } from "./spots";
import { useCountdown24, fmtCountdown } from "./use-countdown";

type Props = {
  mode: "spots" | "timer";
  joined: number;
  total: number;
  priceLabel: string;
  compareLabel?: string;
  tone?: "dark" | "light";
  locale: Locale;
};

/**
 * Scarcity element shown under the CTA: either the X/Y spots gauge or a looping
 * 24h countdown — controlled by the admin's `scarcityMode`.
 */
export function OfferScarcity({
  mode,
  joined,
  total,
  priceLabel,
  compareLabel,
  tone = "dark",
  locale,
}: Props) {
  if (mode === "timer") {
    return (
      <OfferTimer
        priceLabel={priceLabel}
        compareLabel={compareLabel}
        tone={tone}
        locale={locale}
      />
    );
  }
  return (
    <SpotsProgress
      tone={tone}
      joined={joined}
      total={total}
      priceLabel={priceLabel}
      compareLabel={compareLabel}
      locale={locale}
    />
  );
}

function OfferTimer({
  priceLabel,
  compareLabel,
  tone,
  locale,
}: {
  priceLabel: string;
  compareLabel?: string;
  tone: "dark" | "light";
  locale: Locale;
}) {
  const ui = LANDING_UI[locale];
  const remaining = useCountdown24();
  const isDark = tone === "dark";

  return (
    <div className="mt-5">
      <div
        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 ${
          isDark
            ? "border-white/15 bg-white/10 text-white"
            : "border-rose-200 bg-rose-50 text-rose-600"
        }`}
      >
        <Clock className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span className="text-xs font-semibold sm:text-sm">{ui.offerEndsIn}</span>
        <span className="font-display text-base font-extrabold tabular-nums tracking-tight sm:text-lg">
          {remaining == null ? "24:00:00" : fmtCountdown(remaining)}
        </span>
      </div>
      <p
        className={`mt-2 text-center text-[11px] ${
          isDark ? "text-white/55" : "text-neutral-500"
        }`}
      >
        <span className="font-semibold">{priceLabel}</span>
        {compareLabel ? (
          <>
            {" "}
            <span className="line-through opacity-60">{compareLabel}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
