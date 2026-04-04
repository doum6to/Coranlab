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
            <span>Bottom {DEMOTE_COUNT} relégués</span>
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
                "flex items-center w-full py-2.5 px-3 rounded-xl transition-colors",
                member.isCurrentUser && "bg-[#f0f0ff] border border-[#6967FB]",
                isPromoted && !member.isCurrentUser && "bg-[#E8F8E8]",
                isDemoted && !member.isCurrentUser && "bg-red-50",
                !isPromoted && !isDemoted && !member.isCurrentUser && "hover:bg-gray-50",
              )}
            >
              {/* Rank */}
              <div className="w-8 flex-shrink-0">
                <span
                  className={cn(
                    "text-sm font-bold",
                    member.rank <= 3 ? "text-[#F59E0B]" : "text-brilliant-muted",
                  )}
                >
                  {member.rank}
                </span>
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
