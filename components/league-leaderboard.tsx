"use client";

import { cn } from "@/lib/utils";
import { LeagueTierBadge } from "./league-tier-badge";
import { LeagueCountdown } from "./league-countdown";
import {
  PROMOTE_COUNT,
  DEMOTE_COUNT,
  TIER_LABELS,
  TIER_COLORS,
  type LeagueTier,
} from "@/lib/league-utils";
import type { LeagueMember } from "@/db/queries";

const RANK_COLORS: Record<number, { bg: string; shadow: string; text: string }> = {
  1: { bg: "#FFD700", shadow: "#B8960F", text: "#7A5C00" },
  2: { bg: "#C0C0C0", shadow: "#888888", text: "#505050" },
  3: { bg: "#CD7F32", shadow: "#8B5A1B", text: "#FFFFFF" },
};

// Hexagon points for a 30x34 viewBox, centered at (15, 17)
const HEX_PATH = "M15 1L27.5 8.5V23.5L15 31L2.5 23.5V8.5L15 1Z";
const HEX_CLIP = "hex-clip";

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

export const LeagueLeaderboard = ({ tier, members, isTopTier, isBottomTier }: Props) => {
  const totalMembers = members.length;
  const color = TIER_COLORS[tier];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LeagueTierBadge tier={tier} size="md" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-brilliant-text">
              Ligue {TIER_LABELS[tier]}
            </h2>
            <LeagueCountdown />
          </div>
        </div>
      </div>

      {/* Promotion info banner */}
      {!isTopTier && (
        <div className="rounded-xl bg-[#E8F8E8] border border-[#3CC922]/30 px-3 py-2 text-xs sm:text-sm text-[#1F7A1F] font-medium flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 10 10" fill="#3CC922">
            <path d="M5 1L9 7H1L5 1Z" />
          </svg>
          <span>Les <b>{PROMOTE_COUNT} premiers</b> montent à la ligue supérieure !</span>
        </div>
      )}

      {/* Zone labels */}
      <div className="flex items-center gap-4 text-xs text-brilliant-muted px-2">
        {!isTopTier && (
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#3CC922]" />
            <span>Top {PROMOTE_COUNT} promus</span>
          </div>
        )}
        {!isBottomTier && (
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F43F5E]" />
            <span>{DEMOTE_COUNT} derniers relégués</span>
          </div>
        )}
      </div>

      {/* Member list */}
      <div className="flex flex-col">
        {members.map((member) => {
          const isPromoted = !isTopTier && member.rank <= PROMOTE_COUNT;
          const isDemoted = !isBottomTier && member.rank > totalMembers - DEMOTE_COUNT;

          return (
            <div
              key={member.userId}
              className={cn(
                "flex items-center w-full py-2.5 px-3 rounded-xl transition-colors hover:bg-gray-50",
              )}
            >
              {/* Rank */}
              <div className="w-8 flex-shrink-0 flex items-center justify-center">
                {member.rank <= 3 ? (
                  <RankBadge rank={member.rank} />
                ) : (
                  <span className="text-sm font-bold text-brilliant-muted">
                    {member.rank}
                  </span>
                )}
              </div>

              {/* Zone indicator */}
              <div className="w-3 flex-shrink-0 mr-2">
                {isPromoted && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="#3CC922">
                    <path d="M5 1L9 7H1L5 1Z" />
                  </svg>
                )}
                {isDemoted && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="#F43F5E">
                    <path d="M5 9L1 3H9L5 9Z" />
                  </svg>
                )}
              </div>

              {/* Name */}
              <p className={cn(
                "flex-1 text-sm truncate",
                member.isCurrentUser ? "font-bold text-[#6967FB]" : "font-medium text-brilliant-text",
              )}>
                {member.name}
                {member.isCurrentUser && " (toi)"}
              </p>

              {/* XP */}
              <p className={cn(
                "text-sm font-semibold flex-shrink-0",
                member.isCurrentUser ? "text-[#6967FB]" : "text-brilliant-muted",
              )}>
                {member.weeklyXp} XP
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
