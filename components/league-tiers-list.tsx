"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  LEAGUE_TIERS,
  TIER_LABELS,
  TIER_COLORS,
  type LeagueTier,
} from "@/lib/league-utils";
import { LeagueTierBadge } from "./league-tier-badge";
import { useT } from "@/lib/i18n/use-t";

type Props = {
  currentTier?: LeagueTier | null;
};

export const LeagueTiersList = ({ currentTier }: Props) => {
  const [open, setOpen] = useState(false);
  const t = useT();

  // Reverse so highest tier is first
  const tiers = [...LEAGUE_TIERS].reverse();

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex min-h-[48px] w-full select-none items-center justify-center gap-2 rounded-2xl text-[0.9375rem] font-semibold text-[#5452E0] transition-colors active:bg-[#F7F7FF]"
      >
        {t.leagueMore.seeAllLeagues}
        {open ? (
          <ChevronUp className="h-4 w-4" strokeWidth={2.4} aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4" strokeWidth={2.4} aria-hidden />
        )}
      </button>

      {open && (
        <div className="mt-1 flex flex-col">
          {tiers.map((tier, i) => {
            const isCurrent = currentTier === tier;
            const color = TIER_COLORS[tier];

            return (
              <div
                key={tier}
                className={`flex min-h-[60px] items-center gap-3.5 rounded-2xl px-3 py-2 ${isCurrent ? "bg-[#F0F0FF]" : ""}`}
              >
                {/* Rank number (10 = top, 1 = bottom) */}
                <span className="w-5 shrink-0 text-center text-[0.8125rem] font-bold text-brilliant-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {LEAGUE_TIERS.length - i}
                </span>

                {/* Shield */}
                <div className="shrink-0">
                  <svg width="32" height="37" viewBox="0 0 44 50" fill="none" aria-hidden>
                    <path
                      d="M22 2L4 10V22C4 34 22 48 22 48C22 48 40 34 40 22V10L22 2Z"
                      fill={color}
                      opacity={0.15}
                    />
                    <path
                      d="M22 2L4 10V22C4 34 22 48 22 48C22 48 40 34 40 22V10L22 2Z"
                      stroke={color}
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <text
                      x="22"
                      y="28"
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="bold"
                      fill={color}
                    >
                      {TIER_LABELS[tier].charAt(0)}
                    </text>
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[0.9375rem] font-bold leading-tight" style={{ color }}>
                    {TIER_LABELS[tier]}
                    {isCurrent && (
                      <span className="ml-2 text-[0.8125rem] font-semibold text-[#5452E0]">
                        {t.leagueMore.yourLeague}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-[#6B6B76]">
                    {t.leagueMore[`tier${tier}`]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
