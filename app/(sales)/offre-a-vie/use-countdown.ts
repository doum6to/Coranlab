"use client";

import { useEffect, useState } from "react";

/**
 * Seconds remaining in a looping 24h countdown (resets every day at UTC
 * midnight, so it never reaches a permanent zero). Returns null before mount
 * to avoid a hydration mismatch.
 */
export function useCountdown24(): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const tick = () =>
      setRemaining(86400 - (Math.floor(Date.now() / 1000) % 86400));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return remaining;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Formats a seconds count as HH:MM:SS. */
export function fmtCountdown(s: number): string {
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(
    s % 60,
  )}`;
}
