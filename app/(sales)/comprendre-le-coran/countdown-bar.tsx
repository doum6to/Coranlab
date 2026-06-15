"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Sticky top bar with a 24 h countdown that loops every day: it counts down to
 * the next local midnight, so it always shows time left and resets on its own —
 * honest urgency (a real daily window) rather than a fake frozen timer.
 */
export function CountdownBar() {
  const [left, setLeft] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0); // next midnight
      const diff = Math.max(0, end.getTime() - now.getTime());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setLeft(`${pad(h)}:${pad(m)}:${pad(s)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-[#6967fb] text-white shadow-sm">
      <div className="mx-auto flex max-w-[680px] flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-2 text-center text-[13px] font-semibold sm:text-sm">
        <span aria-hidden>⚡</span>
        <span>Offre de lancement — se termine dans</span>
        <span className="font-bold tabular-nums tracking-wider">
          {left ?? "24:00:00"}
        </span>
      </div>
    </div>
  );
}
