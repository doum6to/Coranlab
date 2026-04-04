"use server";

import { and, eq, sql, count } from "drizzle-orm";
import db from "@/db/drizzle";
import { leagues, weeklyXp } from "@/db/schema";
import {
  GROUP_SIZE,
  MIN_XP_TO_JOIN,
  LEAGUE_TIERS,
  getPreviousWeekStart,
  type LeagueTier,
} from "@/lib/league-utils";
import { generateBotId, generateBotXp, pickBotName } from "@/lib/league-bots";

export async function maybeJoinLeague(userId: string, weekStart: string) {
  // Check if already in a real group this week
  const existing = await db.query.leagues.findFirst({
    where: and(
      eq(leagues.userId, userId),
      eq(leagues.weekStart, weekStart),
    ),
  });

  if (existing && existing.groupId !== "PENDING") return;

  const isReturningPlayer = !!existing; // Has PENDING entry from cron

  // 100 XP threshold only for first-time players (never been in a league)
  if (!isReturningPlayer) {
    const prevWeek = getPreviousWeekStart(weekStart);
    const prevEntry = await db.query.leagues.findFirst({
      where: and(
        eq(leagues.userId, userId),
        eq(leagues.weekStart, prevWeek),
      ),
    });

    if (!prevEntry) {
      // True first-timer — need 100 XP to unlock leagues
      const xpRow = await db.query.weeklyXp.findFirst({
        where: and(
          eq(weeklyXp.userId, userId),
          eq(weeklyXp.weekStart, weekStart),
        ),
      });
      if (!xpRow || xpRow.xp < MIN_XP_TO_JOIN) return;
    }
  }

  // Determine tier
  let tier: LeagueTier = "NIYYA";
  if (isReturningPlayer) {
    // Has a PENDING entry from cron (promotion/demotion already calculated)
    tier = existing.tier as LeagueTier;
  } else {
    // Check previous week
    const prevWeek = getPreviousWeekStart(weekStart);
    const prevEntry = await db.query.leagues.findFirst({
      where: and(
        eq(leagues.userId, userId),
        eq(leagues.weekStart, prevWeek),
      ),
    });
    if (prevEntry) {
      tier = prevEntry.tier as LeagueTier;
    }
  }

  // Find or create group
  const groupId = await findOrCreateGroup(tier, weekStart);

  if (existing) {
    // Update PENDING entry
    await db.update(leagues).set({ groupId }).where(eq(leagues.id, existing.id));
  } else {
    await db.insert(leagues).values({
      userId,
      groupId,
      tier,
      weekStart,
      isBot: false,
    });
  }

  // Fill remaining slots with bots
  await fillGroupWithBots(groupId, tier, weekStart);
}

async function findOrCreateGroup(tier: LeagueTier, weekStart: string): Promise<string> {
  // Find groups for this tier+week that have room
  const groups = await db
    .select({
      groupId: leagues.groupId,
      realCount: count(),
    })
    .from(leagues)
    .where(
      and(
        eq(leagues.tier, tier),
        eq(leagues.weekStart, weekStart),
        eq(leagues.isBot, false),
      )
    )
    .groupBy(leagues.groupId);

  // Find one with fewer than GROUP_SIZE real users
  for (const g of groups) {
    if (g.realCount < GROUP_SIZE) {
      return g.groupId;
    }
  }

  // Create new group
  const seq = groups.length + 1;
  return `${tier}-${weekStart}-${String(seq).padStart(3, "0")}`;
}

async function fillGroupWithBots(groupId: string, tier: LeagueTier, weekStart: string) {
  // Count current members
  const members = await db
    .select({ cnt: count() })
    .from(leagues)
    .where(eq(leagues.groupId, groupId));

  const currentCount = members[0]?.cnt ?? 0;
  const botsNeeded = GROUP_SIZE - currentCount;

  if (botsNeeded <= 0) return;

  // Get existing bot names in this group to avoid duplicates
  const existingBots = await db
    .select({ botName: leagues.botName })
    .from(leagues)
    .where(and(eq(leagues.groupId, groupId), eq(leagues.isBot, true)));

  const usedNames = new Set(existingBots.map((b) => b.botName).filter(Boolean) as string[]);

  const botLeagueRows: typeof leagues.$inferInsert[] = [];
  const botXpRows: typeof weeklyXp.$inferInsert[] = [];

  for (let i = 0; i < botsNeeded; i++) {
    const botId = generateBotId();
    const name = pickBotName(usedNames);
    usedNames.add(name);
    const xp = generateBotXp(tier);

    botLeagueRows.push({
      userId: botId,
      groupId,
      tier,
      weekStart,
      isBot: true,
      botName: name,
      botImageSrc: "/mascot.svg",
    });

    botXpRows.push({
      userId: botId,
      weekStart,
      xp,
    });
  }

  if (botLeagueRows.length > 0) {
    await Promise.all([
      db.insert(leagues).values(botLeagueRows),
      db.insert(weeklyXp).values(botXpRows),
    ]);
  }
}
