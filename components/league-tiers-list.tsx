"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  LEAGUE_TIERS,
  TIER_LABELS,
  TIER_COLORS,
  TIER_DESCRIPTIONS,
  type LeagueTier,
} from "@/lib/league-utils";
import { LeagueTierBadge } from "./league-tier-badge";

type Props = {
  currentTier?: LeagueTier | null;
};

export const LeagueTiersList = ({ currentTier }: Props) => {
  const [open, setOpen] = useState(false);

  // Reverse so highest tier is first
  const tiers = [...LEAGUE_TIERS].reverse();

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-brilliant-muted hover:text-brilliant-text transition cursor-pointer"
      >
        Voir toutes les ligues
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="mt-2 rounded-2xl border border-brilliant-border bg-white overflow-hidden">
          {tiers.map((tier, i) => {
            const isCurrent = currentTier === tier;
            const color = TIER_COLORS[tier];
            const isLast = i === tiers.length - 1;

            return (
              <div
                key={tier}
                className={`flex items-center gap-4 px-4 py-3 ${
                  !isLast ? "border-b border-brilliant-border" : ""
                } ${isCurrent ? "bg-[#F5F3FF]" : ""}`}
              >
                {/* Rank number (10 = top, 1 = bottom) */}
                <span className="text-xs font-bold text-brilliant-muted w-5 text-center shrink-0">
                  {LEAGUE_TIERS.length - i}
                </span>

                {/* Shield */}
                <div className="shrink-0">
                  <svg width="32" height="37" viewBox="0 0 44 50" fill="none">
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
                  <p className="text-sm font-bold" style={{ color }}>
                    {TIER_LABELS[tier]}
                    {isCurrent && (
                      <span className="ml-2 text-xs font-semibold text-[#6967FB]">
                        (ta ligue)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-brilliant-muted">
                    {TIER_DESCRIPTIONS[tier]}
                  </p>
                </div>

                {/* Arrow indicator for current */}
                {isCurrent && (
                  <div className="shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#6967FB]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
