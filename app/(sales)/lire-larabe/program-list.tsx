"use client";

import { useState } from "react";

const GOLD = "#e0b34a";

/**
 * The 21-chapter list. On mobile it's clipped to a readable height with a
 * "Voir tout" button (saves endless scrolling); on desktop the full list shows.
 * All chapters stay in the DOM (just visually clipped) so they're indexable.
 */
export function ProgramList({ chapters }: { chapters: string[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className={`relative mt-8 overflow-hidden rounded-2xl border border-white/10 sm:max-h-none ${
          expanded ? "max-h-none" : "max-h-[440px]"
        }`}
      >
        <div className="divide-y divide-white/10">
          {chapters.map((ch, i) => (
            <div
              key={ch + i}
              className="flex items-center gap-4 px-4 py-3.5 sm:px-6"
            >
              <span
                className="w-7 shrink-0 text-sm font-bold tabular-nums"
                style={{ color: GOLD }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-white/85">{ch}</span>
            </div>
          ))}
        </div>
        {!expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-950 to-transparent sm:hidden" />
        )}
      </div>

      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mx-auto mt-4 block rounded-xl border px-5 py-2.5 text-sm font-bold sm:hidden"
          style={{ borderColor: `${GOLD}66`, color: GOLD }}
        >
          Voir les {chapters.length} chapitres
        </button>
      )}
    </>
  );
}
