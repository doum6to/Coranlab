"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("fr-FR");

/**
 * Premium floating bar pinned to the bottom of the viewport. Shows the
 * scarcity counter + a CTA to the pricing section, and hides itself while
 * the pricing section (#offre) is on screen (no point nudging there).
 */
export function StickySpotsBar({
  joined,
  total,
  priceLabel,
  compareLabel,
}: {
  joined: number;
  total: number;
  priceLabel: string;
  compareLabel?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const pct = total > 0 ? Math.min(100, Math.round((joined / total) * 100)) : 0;
  const left = Math.max(0, total - joined);

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
      className={`fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4 transition-all duration-300 ${
        hidden
          ? "translate-y-[130%] opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mx-auto flex max-w-[1000px] items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/95 px-4 py-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur sm:gap-5 sm:px-6 sm:py-4">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#6967fb] text-white sm:flex">
          <Flame className="h-5 w-5" strokeWidth={2.2} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-white sm:text-base">
            Offre limitée — plus que {fmt(left)} places à vie
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#a6a5ff]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-[11px] font-medium text-white/60">
              {fmt(joined)}/{fmt(total)}
            </span>
          </div>
        </div>

        <div className="hidden text-right sm:block">
          <p className="font-display text-lg font-bold leading-none text-white">
            {priceLabel}
          </p>
          {compareLabel ? (
            <p className="text-[11px] text-white/40 line-through">
              {compareLabel}
            </p>
          ) : null}
        </div>

        <a
          href="#offre"
          className="shrink-0 rounded-xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-white transition-all hover:brightness-[1.05] active:translate-y-1 active:border-b-0"
        >
          J&apos;en profite
        </a>
      </div>
    </div>
  );
}
