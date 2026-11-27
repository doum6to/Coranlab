"use client";

import { Fragment } from "react";

import { cn } from "@/lib/utils";
import { LeagueTierBadge } from "./league-tier-badge";
import { LeagueCountdown } from "./league-countdown";
import {
  PROMOTE_COUNT,
  DEMOTE_COUNT,
  TIER_LABELS,
  type LeagueTier,
} from "@/lib/league-utils";
import type { LeagueMember } from "@/db/queries";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

const RANK_COLORS: Record<number, { bg: string; shadow: string; text: string }> = {
  1: { bg: "#FFD700", shadow: "#B8960F", text: "#7A5C00" },
  2: { bg: "#C0C0C0", shadow: "#888888", text: "#505050" },
  3: { bg: "#CD7F32", shadow: "#8B5A1B", text: "#FFFFFF" },
};

// Hexagon points for a 30x34 viewBox, centered at (15, 17)
const HEX_PATH = "M15 1L27.5 8.5V23.5L15 31L2.5 23.5V8.5L15 1Z";

const RankBadge = ({ rank }: { rank: number }) => {
  const c = RANK_COLORS[rank];
  const id = `rank-${rank}`;
  return (
    <svg width="30" height="34" viewBox="0 0 30 34" fill="none">
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={HEX_PATH} />
        </clipPath>
        <linearGradient id={`${id}-g1`} x1="10" y1="-10" x2="10" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0.2" stopColor="white" stopOpacity="0.45" />
          <stop offset="0.7" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-g2`} x1="22" y1="-5" x2="22" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0.1" stopColor="white" stopOpacity="0.35" />
          <stop offset="0.55" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Hex shadow */}
      <path d="M15 3L27.5 10.5V25.5L15 33L2.5 25.5V10.5L15 3Z" fill={c.shadow} />
      {/* Hex body */}
      <path d={HEX_PATH} fill={c.bg} />
      {/* Shiny diagonal streaks like ShinyButton */}
      <g clipPath={`url(#${id}-clip)`}>
        <rect
          opacity="0.5"
          x="4"
          y="-12"
          width="12"
          height="40"
          transform="rotate(30 4 -12)"
          fill={`url(#${id}-g1)`}
        />
        <rect
          opacity="0.45"
          x="16"
          y="-8"
          width="6"
          height="40"
          transform="rotate(30 16 -8)"
          fill={`url(#${id}-g2)`}
        />
      </g>
      {/* Number */}
      <text
        x="15"
        y="20.5"
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fill={c.text}
      >
        {rank}
      </text>
    </svg>
  );
};

type Props = {
  tier: LeagueTier;
  members: LeagueMember[];
  isTopTier: boolean;
  isBottomTier: boolean;
};

const CARD = { borderRadius: 28, boxShadow: "0 0 0 1px #EDEDF3, 0 14px 34px -18px rgba(74,72,212,.35)" } as const;

const UP = "#1F9D4D";
const DOWN = "#D93A3A";
const Arrow = ({ up }: { up: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden><path d={up ? "M5 1L9 7H1L5 1Z" : "M5 9L1 3H9L5 9Z"} /></svg>
);

/**
 * The line between two zones of the ranking: who goes up above it, who goes down below it.
 * When the two zones touch (a group split in two halves), one line carries both labels.
 */
function ZoneLine({ up, down }: { up?: string; down?: string }) {
  const label = "flex items-center gap-1.5 text-[0.8125rem] font-semibold";
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      {up ? <span className={label} style={{ color: UP }}><Arrow up />{up}</span> : <span className="h-px flex-1 bg-[#F3C4C4]" aria-hidden />}
      {up && <span className="h-px flex-1" style={{ background: down ? "#E6E6EE" : "#BFE8C9" }} aria-hidden />}
      {down && <span className={label} style={{ color: DOWN }}><Arrow up={false} />{down}</span>}
      {down && !up && <span className="h-px flex-1 bg-[#F3C4C4]" aria-hidden />}
    </li>
  );
}

export const LeagueLeaderboard = ({ tier, members, isTopTier, isBottomTier }: Props) => {
  const t = useT();
  const total = members.length;
  // Rank after which the promotion zone ends, and rank at which relegation starts (0: no such zone).
  const promoEnd = !isTopTier && total > PROMOTE_COUNT ? PROMOTE_COUNT : 0;
  const demoteStart = !isBottomTier && total > DEMOTE_COUNT ? total - DEMOTE_COUNT + 1 : 0;
  const touching = promoEnd > 0 && demoteStart === promoEnd + 1;
  const upLabel = tpl(t.league.topPromoted, { n: PROMOTE_COUNT });
  const downLabel = tpl(t.league.lastDemoted, { n: DEMOTE_COUNT });

  return (
    <div className="flex w-full flex-col">
      {/* The league and how the week ends */}
      <div className="bg-white p-5" style={CARD}>
        <div className="flex items-center gap-4">
          <LeagueTierBadge tier={tier} size="md" bare />
          <div className="min-w-0">
            <h2 className="font-heading text-[1.25rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>{tpl(t.league.leagueTitle, { tier: TIER_LABELS[tier] })}</h2>
            <div className="mt-1"><LeagueCountdown /></div>
          </div>
        </div>
        {!isTopTier && <p className="mt-3 text-[0.9375rem] leading-normal text-[#555]">{tpl(t.league.promoBanner, { n: PROMOTE_COUNT })}</p>}
      </div>

      <ol className="mt-4 flex flex-col">
        {members.map((member) => {
          const you = member.isCurrentUser;
          return (
            <Fragment key={member.userId}>
              {!touching && member.rank === demoteStart && <ZoneLine down={downLabel} />}
              <li className="flex min-h-[56px] items-center gap-3 rounded-2xl px-3 py-1.5" style={you ? { background: "#F0F0FF" } : undefined} aria-current={you ? "true" : undefined}>
                <span className="flex w-8 shrink-0 items-center justify-center">
                  {member.rank <= 3 ? <RankBadge rank={member.rank} /> : <span className="text-[0.9375rem] font-bold text-brilliant-muted" style={{ fontVariantNumeric: "tabular-nums" }}>{member.rank}</span>}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.9375rem] font-bold" style={you ? { background: "#6967FB", color: "#fff" } : { background: "#F1F1F6", color: "#6B6B76" }} aria-hidden>
                  {(member.name.trim()[0] || "?").toUpperCase()}
                </span>
                <span className={cn("min-w-0 flex-1 truncate text-[0.9375rem]", you ? "font-bold text-[#5452E0]" : "font-semibold text-brilliant-text")}>
                  <bdi>{member.name}</bdi>
                  {you && ` ${t.league.you}`}
                </span>
                <span className={cn("shrink-0 text-[0.9375rem] font-semibold", you ? "text-[#5452E0]" : "text-[#6B6B76]")} style={{ fontVariantNumeric: "tabular-nums" }}>{member.weeklyXp} XP</span>
              </li>
              {member.rank === promoEnd && <ZoneLine up={upLabel} down={touching ? downLabel : undefined} />}
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
};
