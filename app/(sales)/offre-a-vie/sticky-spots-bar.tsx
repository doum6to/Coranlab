"use client";

import { useEffect, useState } from "react";
import { Clock, Flame } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("fr-FR");
const pad = (n: number) => String(n).padStart(2, "0");
const fmtTime = (s: number) =>
  `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(
    s % 60,
  )}`;

/**
 * Premium floating bar pinned to the bottom: scarcity counter, price, a
 * looping 24h countdown and a CTA to the pricing section. Hides itself while
 * the pricing section (#offre) is on screen.
 */
export function StickySpotsBar({
  joined,
  total,
  priceLabel,
  compareLabel,
  ctaLabel = "J'en profite",
}: {
  joined: number;
  total: number;
  priceLabel: string;
  compareLabel?: string;
  ctaLabel?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const left = Math.max(0, total - joined);

  // Hide while the offer section is visible.
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

  // Looping 24h countdown (resets every day at UTC midnight).
  useEffect(() => {
    const tick = () =>
      setRemaining(86400 - (Math.floor(Date.now() / 1000) % 86400));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4 transition-all duration-300 ${
        hidden
          ? "translate-y-[130%] opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mx-auto flex max-w-[1000px] items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/95 px-3 py-2.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur sm:gap-5 sm:px-6 sm:py-4">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#6967fb] text-white sm:flex">
          <Flame className="h-5 w-5" strokeWidth={2.2} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-white sm:text-base">
            Offre limitée — plus que {fmt(left)} places
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[12px] font-bold tabular-nums text-white">
              <Clock className="h-3.5 w-3.5" strokeWidth={2} />
              {fmtTime(remaining ?? 86400)}
            </span>
            <span className="text-[13px] font-bold text-white sm:text-sm">
              {priceLabel}
              {compareLabel ? (
                <span className="ml-1.5 font-medium text-white/40 line-through">
                  {compareLabel}
                </span>
              ) : null}
            </span>
          </div>
        </div>

        <a
          href="#offre"
          className="shrink-0 rounded-xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-4 py-2.5 text-center font-display text-xs font-bold uppercase tracking-wide text-white transition-all hover:brightness-[1.05] active:translate-y-1 active:border-b-0 sm:px-5 sm:py-3 sm:text-sm"
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
