import { NextResponse } from "next/server";
import { and, eq, count } from "drizzle-orm";
import db from "@/db/drizzle";
import { leagues, weeklyXp } from "@/db/schema";
import {
  getCurrentWeekStart,
  getPreviousWeekStart,
  LEAGUE_TIERS,
  PROMOTE_COUNT,
  DEMOTE_COUNT,
  getPromotedTier,
  getDemotedTier,
  type LeagueTier,
} from "@/lib/league-utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentWeekStart = getCurrentWeekStart();
  const completedWeekStart = getPreviousWeekStart(currentWeekStart);

  // Get all league entries for the completed week
  const allEntries = await db
    .select()
    .from(leagues)
    .where(eq(leagues.weekStart, completedWeekStart));

  if (allEntries.length === 0) {
    return NextResponse.json({ message: "No leagues to process" });
  }

  // Group entries by groupId
  const groups = new Map<string, typeof allEntries>();
  for (const entry of allEntries) {
    const group = groups.get(entry.groupId) || [];
    group.push(entry);
    groups.set(entry.groupId, group);
  }

  // Get weekly XP for the completed week
  const allXp = await db
    .select()
    .from(weeklyXp)
    .where(eq(weeklyXp.weekStart, completedWeekStart));

  const xpMap = new Map<string, number>();
  for (const row of allXp) {
    xpMap.set(row.userId, row.xp);
  }

  // Process each group
  const newEntries: typeof leagues.$inferInsert[] = [];

  for (const [groupId, members] of Array.from(groups.entries())) {
    // Only process real users
    const realMembers = members.filter((m) => !m.isBot);
    if (realMembers.length === 0) continue;

    const tier = realMembers[0].tier as LeagueTier;

    // Sort real members by XP (descending)
    realMembers.sort((a, b) => (xpMap.get(b.userId) ?? 0) - (xpMap.get(a.userId) ?? 0));

    for (let i = 0; i < realMembers.length; i++) {
      const member = realMembers[i];
      let newTier: LeagueTier = tier;

      if (i < PROMOTE_COUNT) {
        newTier = getPromotedTier(tier);
      } else if (i >= realMembers.length - DEMOTE_COUNT) {
        newTier = getDemotedTier(tier);
      }

      newEntries.push({
        userId: member.userId,
        groupId: "PENDING",
        tier: newTier,
        weekStart: currentWeekStart,
        isBot: false,
      });
    }
  }

  // Insert new week entries in batch
  if (newEntries.length > 0) {
    // Insert in batches of 100 to avoid query size limits
    for (let i = 0; i < newEntries.length; i += 100) {
      const batch = newEntries.slice(i, i + 100);
      await db.insert(leagues).values(batch);
    }
  }

  return NextResponse.json({
    message: `Processed ${groups.size} groups, ${newEntries.length} users carried over`,
    completedWeek: completedWeekStart,
    newWeek: currentWeekStart,
  });
}
