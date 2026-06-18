"use client";

import { Flame, Sparkles, ChevronRight } from "lucide-react";

import { usePremiumModal } from "@/store/use-premium-modal";

const GRADIENT =
  "linear-gradient(135deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)";

type Props = {
  /** Current streak in days (loss-aversion hook when > 0). */
  streak: number;
  /** Overall course progress, 0–100. */
  percent: number;
};

/**
 * Free-user nudge on the home feed: a value reminder ("you've learned X%") and,
 * when a streak is running, a loss-aversion hook ("don't lose your streak").
 * Tapping opens the contextual Premium modal. Shown only to non-Pro users.
 */
export const PremiumNudgeBanner = ({ streak, percent }: Props) => {
  const open = usePremiumModal((s) => s.open);

  const hasStreak = streak > 0;
  const headline = hasStreak
    ? `Série de ${streak} jour${streak > 1 ? "s" : ""} 🔥`
    : "Continue ta progression";
  const sub = hasStreak
    ? "Garde ta série en sécurité et débloque tout avec Premium."
    : `Tu comprends déjà ${percent}% — débloque les 500 mots du Coran.`;

  return (
    <button
      type="button"
      onClick={() => open()}
      className="mx-4 sm:mx-0 mb-4 block w-[calc(100%-2rem)] sm:w-full rounded-2xl p-[2px] text-left transition-transform duration-100 hover:scale-[1.005] active:scale-[0.99]"
      style={{ background: GRADIENT }}
    >
      <div className="flex items-center gap-3 rounded-[14px] bg-white px-4 py-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: GRADIENT }}
        >
          {hasStreak ? (
            <Flame className="h-5 w-5" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold text-brilliant-text">{headline}</div>
          <div className="truncate text-xs text-brilliant-muted">{sub}</div>
          {!hasStreak && (
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(4, percent)}%`, background: GRADIENT }}
              />
            </div>
          )}
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[#0F172A] px-3 py-1.5 text-xs font-bold text-white">
          Premium <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
};
