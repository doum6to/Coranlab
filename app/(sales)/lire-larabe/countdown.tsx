"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Looping 24h countdown shown in the pricing section. Resets daily at UTC
 * midnight (same cadence as the bottom sticky bar) so it always reads as a
 * live, time-limited offer.
 */
export function Countdown({ label }: { label?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () =>
      setRemaining(86400 - (Math.floor(Date.now() / 1000) % 86400));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const s = remaining ?? 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  const blocks: { v: number; l: string }[] = [
    { v: h, l: "Heures" },
    { v: m, l: "Min" },
    { v: sec, l: "Sec" },
  ];

  return (
    <div className="flex flex-col items-center">
      {label && (
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e0b34a]">
          ⏳ {label}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2 sm:gap-3">
        {blocks.map((b, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <div className="flex min-w-[56px] flex-col items-center rounded-xl border border-[#e0b34a]/30 bg-white/[0.05] px-3 py-2 sm:min-w-[68px]">
              <span className="font-mono text-2xl font-extrabold tabular-nums text-white sm:text-3xl">
                {pad(b.v)}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-white/40">
                {b.l}
              </span>
            </div>
            {i < blocks.length - 1 && (
              <span className="text-xl font-bold text-[#e0b34a]/60">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
