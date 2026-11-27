"use client";

import { LEAGUE_TIERS, TIER_LABELS, MIN_XP_TO_JOIN } from "@/lib/league-utils";
import { LeagueTierBadge } from "./league-tier-badge";
import type { LeagueTier } from "@/lib/league-utils";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

type Props = {
  weeklyXp: number;
  isPending?: boolean;
  pendingTier?: LeagueTier;
};

const CARD = { borderRadius: 28, boxShadow: "0 0 0 1px #EDEDF3, 0 14px 34px -18px rgba(74,72,212,.35)" } as const;

export const LeagueJoinView = ({ weeklyXp, isPending, pendingTier }: Props) => {
  const t = useT();
  // Back in a league already: any XP this week puts the learner in a group.
  if (isPending) {
    const tier = pendingTier ?? "NIYYA";
    return (
      <div className="bg-white p-5" style={CARD}>
        <div className="flex items-center gap-4">
          <LeagueTierBadge tier={tier} size="md" bare />
          <h2 className="min-w-0 font-heading text-[1.25rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>{tpl(t.league.leagueTitle, { tier: TIER_LABELS[tier] })}</h2>
        </div>
        <p className="mt-3 text-[0.9375rem] leading-normal text-[#555]">{t.league.pendingInstruction}</p>
        <p className="mt-4 text-[0.8125rem] font-medium text-brilliant-muted">{t.league.xpThisWeek}</p>
        <p className="font-heading text-[1.75rem] font-extrabold leading-none text-brilliant-text" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{weeklyXp} XP</p>
      </div>
    );
  }

  // First league: it opens once enough XP is earned in a week.
  const progress = Math.min((weeklyXp / MIN_XP_TO_JOIN) * 100, 100);

  return (
    <div className="flex w-full flex-col">
      <div className="bg-white p-5" style={CARD}>
        <h2 className="font-heading text-[1.25rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em", textWrap: "balance" as never }}>{t.league.joinLeague}</h2>
        <p className="mt-1.5 text-[0.9375rem] leading-normal text-[#555]">{tpl(t.league.joinDesc, { min: MIN_XP_TO_JOIN })}</p>
        <div className="mt-4 flex items-baseline justify-between text-[0.9375rem] font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
          <span className="text-brilliant-text">{weeklyXp} XP</span>
          <span className="text-brilliant-muted">{MIN_XP_TO_JOIN} XP</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#EDEDF3]" role="progressbar" aria-valuemin={0} aria-valuemax={MIN_XP_TO_JOIN} aria-valuenow={Math.min(weeklyXp, MIN_XP_TO_JOIN)}>
          <div className="h-full rounded-full bg-[#6967FB] transition-[width] duration-500" style={{ width: `${Math.max(progress, weeklyXp > 0 ? 4 : 0)}%` }} />
        </div>
      </div>

      {/* What is ahead */}
      <p className="mt-7 text-[0.8125rem] font-semibold text-brilliant-muted">{t.league.the10Leagues}</p>
      <div className="mt-3 grid grid-cols-5 gap-x-2 gap-y-4">
        {LEAGUE_TIERS.map((tier) => (
          <LeagueTierBadge key={tier} tier={tier as LeagueTier} size="sm" />
        ))}
      </div>
    </div>
  );
};
