import { redirect } from "next/navigation";

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
import { type LeagueTier } from "@/lib/league-utils";
import { getServerStrings } from "@/lib/i18n/server-t";

const LeaderboardPage = async () => {
  const { t } = getServerStrings();
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
    <div className="mx-auto w-full max-w-md px-4 pb-8 pt-2">
      <h1 className="font-heading text-[1.375rem] font-extrabold text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>{t.leaderboard.title}</h1>

      <div className="mt-4">
        {hasActiveGroup && members.length > 0 ? (
          <LeagueLeaderboard tier={tier} members={members} isTopTier={isTopTier} isBottomTier={isBottomTier} />
        ) : (
          <LeagueJoinView weeklyXp={weeklyXp} isPending={userLeague?.groupId === "PENDING"} pendingTier={(userLeague?.tier ?? "NIYYA") as LeagueTier} />
        )}
      </div>

      {/* Every league, on demand */}
      <div className="mt-6">
        <LeagueTiersList currentTier={hasActiveGroup ? tier : null} />
      </div>
    </div>
  );
};

export default LeaderboardPage;
