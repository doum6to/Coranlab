"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

export function StickyCta({
  label = "Offre limitée — fin dans",
  ctaLabel = "J'apprends à lire l'arabe",
}: {
  label?: string;
  ctaLabel?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  // Hide while the pricing section (#tarifs) is on screen.
  useEffect(() => {
    const el = document.getElementById("tarifs");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setHidden(e.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Looping 24h countdown (resets daily at UTC midnight).
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

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="border-t border-[#e0b34a]/30 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1000px] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#e0b34a]">
              {label}
            </p>
            <p className="font-mono text-lg font-bold tabular-nums text-white">
              {pad(h)}h {pad(m)}m {pad(sec)}s
            </p>
          </div>
          <a
            href="#tarifs"
            className="shrink-0 rounded-xl border-b-4 border-[#a9801f] bg-gradient-to-b from-[#e9c15a] to-[#d9a93c] px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-neutral-900 transition-all hover:brightness-[1.04] active:translate-y-1 active:border-b-0 sm:text-sm"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
