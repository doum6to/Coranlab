import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import {
  getUserProgress,
  getUserSubscription,
  getUserLeague,
  getUserWeeklyXp,
  getLeagueGroup,
} from "@/db/queries";
import { LeagueJoinView } from "@/components/league-join-view";
import { LeagueLeaderboard } from "@/components/league-leaderboard";
import { LEAGUE_TIERS, type LeagueTier } from "@/lib/league-utils";

const LeaderboardPage = async () => {
  const [userProgress, userSubscription, userLeague, weeklyXp] = await Promise.all([
    getUserProgress(),
    getUserSubscription(),
    getUserLeague(),
    getUserWeeklyXp(),
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/learn");
  }

  const isPro = !!userSubscription?.isActive;

  // Fetch group members if user is in an active league
  const hasActiveGroup = userLeague && userLeague.groupId !== "PENDING";
  const members = hasActiveGroup ? await getLeagueGroup(userLeague.groupId) : [];

  const tier = (userLeague?.tier ?? "NIYYA") as LeagueTier;
  const isTopTier = tier === "FIRDAUS";
  const isBottomTier = tier === "NIYYA";

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          keys={userProgress.keys}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {!isPro && <Promo />}
        <Quests points={userProgress.points} />
      </StickyWrapper>
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
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;
