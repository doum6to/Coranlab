import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import {
  getUserProgress,
  getUserSubscription,
  getUserLeague,
  getUserWeeklyXp,
  getLeagueGroup,
} from "@/db/queries";
import { LeagueJoinView } from "@/components/league-join-view";
import { LeagueLeaderboard } from "@/components/league-leaderboard";
import { LeagueTiersList } from "@/components/league-tiers-list";
import { LEAGUE_TIERS, type LeagueTier } from "@/lib/league-utils";

const LeaderboardPage = async () => {
  const [userProgress, userLeague, weeklyXp] = await Promise.all([
    getUserProgress(),
    getUserLeague(),
    getUserWeeklyXp(),
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/learn");
  }

  const hasActiveGroup = userLeague && userLeague.groupId !== "PENDING";
  const members = hasActiveGroup ? await getLeagueGroup(userLeague.groupId) : [];

  const tier = (userLeague?.tier ?? "NIYYA") as LeagueTier;
  const isTopTier = tier === "FIRDAUS";
  const isBottomTier = tier === "NIYYA";

  return (
    <div className="flex flex-col px-6">
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <h1 className="text-center font-bold text-brilliant-text text-2xl my-6">
            Classement
          </h1>

          {hasActiveGroup && members.length > 0 ? (
            <LeagueLeaderboard
              tier={tier}
              members={members}
              isTopTier={isTopTier}
              isBottomTier={isBottomTier}
            />
          ) : (
            <LeagueJoinView
              weeklyXp={weeklyXp}
              isPending={userLeague?.groupId === "PENDING"}
              pendingTier={(userLeague?.tier ?? "NIYYA") as LeagueTier}
            />
          )}

          {/* Liste des ligues avec toggle */}
          <LeagueTiersList
            currentTier={hasActiveGroup ? tier : null}
          />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;
