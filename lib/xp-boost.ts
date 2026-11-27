import "server-only";
import { eq, sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { xpBoost } from "@/db/schema";
import { ensureDbLockdown } from "@/lib/db-security";

/**
 * Double XP for a short while after the first lesson of the day: a reason to do a second one
 * while the learner is still there. Kept in its own table, created at first use (the app is
 * deployed without a migration step). Every function here fails soft: a problem with the
 * bonus must never cost a learner their progress.
 */
export const BOOST_MINUTES = 15;
export const BOOST_FACTOR = 2;

let ensured = false;
async function ensureTable() {
  if (ensured) return;
  await db.execute(sql`CREATE TABLE IF NOT EXISTS "xp_boost" ("user_id" text PRIMARY KEY, "until" timestamptz NOT NULL);`);
  void ensureDbLockdown();
  ensured = true;
}

/** When the learner's bonus ends (ms since epoch), or null when none is running. */
export async function getBoostUntil(userId: string): Promise<number | null> {
  try {
    await ensureTable();
    const row = await db.query.xpBoost.findFirst({ where: eq(xpBoost.userId, userId) });
    const until = row?.until?.getTime();
    return until && until > Date.now() ? until : null;
  } catch (e) {
    console.error("[xp-boost] unreadable", (e as Error)?.message || e);
    return null;
  }
}

/** Starts the bonus now. Returns when it ends, or null if it could not be started. */
export async function startBoost(userId: string): Promise<number | null> {
  try {
    await ensureTable();
    const until = new Date(Date.now() + BOOST_MINUTES * 60_000);
    await db.insert(xpBoost).values({ userId, until }).onConflictDoUpdate({ target: xpBoost.userId, set: { until } });
    return until.getTime();
  } catch (e) {
    console.error("[xp-boost] not started", (e as Error)?.message || e);
    return null;
  }
}
