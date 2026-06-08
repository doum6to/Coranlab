"use client";

import { LEAGUE_TIERS, TIER_COLORS, TIER_LABELS, MIN_XP_TO_JOIN } from "@/lib/league-utils";
import { LeagueTierBadge } from "./league-tier-badge";
import type { LeagueTier } from "@/lib/league-utils";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

type Props = {
  weeklyXp: number;
  isPending?: boolean;
  pendingTier?: LeagueTier;
};

export const LeagueJoinView = ({ weeklyXp, isPending, pendingTier }: Props) => {
  const t = useT();
  // Returning player with PENDING status — just needs to earn any XP
  if (isPending) {
    return (
      <div className="w-full flex flex-col items-center gap-6 py-4">
        <LeagueTierBadge tier={pendingTier ?? "NIYYA"} size="lg" />

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-brilliant-text mb-2">
            {tpl(t.league.leagueTitle, { tier: TIER_LABELS[pendingTier ?? "NIYYA"] })}
          </h2>
          <p className="text-sm sm:text-base text-brilliant-muted max-w-sm">
            {t.league.pendingInstruction}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-brilliant-muted">{t.league.xpThisWeek}</p>
          <p className="text-2xl font-bold text-brilliant-text">{weeklyXp} XP</p>
        </div>
      </div>
    );
  }

  // First-time player — needs 100 XP to unlock leagues
  const progress = Math.min((weeklyXp / MIN_XP_TO_JOIN) * 100, 100);

  return (
    <div className="w-full flex flex-col items-center gap-6 py-4">
      {/* Shield illustration */}
      <div className="relative">
        <svg width="80" height="92" viewBox="0 0 44 50" fill="none">
          <path
            d="M22 2L4 10V22C4 34 22 48 22 48C22 48 40 34 40 22V10L22 2Z"
            fill="#9CA3AF"
            opacity={0.15}
          />
          <path
            d="M22 2L4 10V22C4 34 22 48 22 48C22 48 40 34 40 22V10L22 2Z"
            stroke="#9CA3AF"
            strokeWidth={2.5}
            strokeLinejoin="round"
            fill="none"
          />
          <text x="22" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#9CA3AF">?</text>
        </svg>
      </div>

      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-brilliant-text mb-2">
          {t.league.joinLeague}
        </h2>
        <p className="text-sm sm:text-base text-brilliant-muted max-w-sm">
          {tpl(t.league.joinDesc, { min: MIN_XP_TO_JOIN })}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span className="text-brilliant-text">{weeklyXp} XP</span>
          <span className="text-brilliant-muted">{MIN_XP_TO_JOIN} XP</span>
        </div>
        <div className="h-3 bg-[#F0F0F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3CC922] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tier preview */}
      <div className="w-full max-w-sm mt-4">
        <p className="text-xs text-brilliant-muted text-center mb-4">{t.league.the10Leagues}</p>
        <div className="grid grid-cols-5 gap-3">
          {LEAGUE_TIERS.map((tier) => (
            <LeagueTierBadge key={tier} tier={tier as LeagueTier} size="sm" />
          ))}
        </div>
      </div>
    </div>
  );
};
