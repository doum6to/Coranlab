import "server-only";
import { sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { getToday } from "@/lib/streak-utils";

/**
 * How many learners come back. Everything is counted from `streak_activity`, which holds one
 * row per learner and per day with a finished lesson (website and iPhone app alike).
 *
 * A learner's day 0 is the day of their first finished lesson. Three questions, each asked
 * only of learners who have had the time to answer it:
 *  - J1: did they do a lesson the very next day?
 *  - J7: did they do one during their second week (days 7 to 13)?
 *  - J30: did they do one during their fifth week (days 30 to 36)?
 * Fixed windows, so a group from last month and a group from last year are comparable.
 */
export type Rate = { eligible: number; back: number };
export type RetentionWeek = { week: string; size: number; d1: Rate; d7: Rate; d30: Rate };
export type RetentionReport = {
  today: string;
  /** First day recorded: nothing before it can be measured. */
  since: string | null;
  learners: number;
  active: { today: number; week: number; month: number };
  overall: { d1: Rate; d7: Rate; d30: Rate };
  /** The same, for learners whose first lesson is 90 days old at most. */
  recent: { d1: Rate; d7: Rate; d30: Rate };
  /** Groups by week of first lesson, most recent first. */
  weeks: RetentionWeek[];
  /** Accounts created in the last 30 days, and how many of them finished a lesson. Null when unreadable. */
  activation: { signups: number; started: number } | null;
};

type Row = Record<string, unknown>;
const rowsOf = (res: unknown): Row[] => ((res as { rows?: Row[] })?.rows ?? []) as Row[];
const n = (v: unknown) => Number(v ?? 0);

/** The three rates of a set of learners. `filter` narrows the set (a SQL condition on `f`). */
const RATES = (today: string) => sql`
  COUNT(*) FILTER (WHERE f.d0 <= ${today}::date - 1)::int AS e1,
  COUNT(*) FILTER (WHERE f.d0 <= ${today}::date - 1 AND f.b1)::int AS b1,
  COUNT(*) FILTER (WHERE f.d0 <= ${today}::date - 13)::int AS e7,
  COUNT(*) FILTER (WHERE f.d0 <= ${today}::date - 13 AND f.b7)::int AS b7,
  COUNT(*) FILTER (WHERE f.d0 <= ${today}::date - 36)::int AS e30,
  COUNT(*) FILTER (WHERE f.d0 <= ${today}::date - 36 AND f.b30)::int AS b30
`;
/** One row per learner: day 0, and whether they were back in each window. */
const LEARNERS = sql`
  WITH first AS (SELECT user_id, MIN(date::date) AS d0 FROM streak_activity GROUP BY user_id),
  f AS (
    SELECT first.user_id, first.d0,
           BOOL_OR(a.date::date - first.d0 = 1) AS b1,
           BOOL_OR(a.date::date - first.d0 BETWEEN 7 AND 13) AS b7,
           BOOL_OR(a.date::date - first.d0 BETWEEN 30 AND 36) AS b30
    FROM first JOIN streak_activity a ON a.user_id = first.user_id
    GROUP BY first.user_id, first.d0
  )
`;
const rates = (r: Row | undefined) => ({
  d1: { eligible: n(r?.e1), back: n(r?.b1) },
  d7: { eligible: n(r?.e7), back: n(r?.b7) },
  d30: { eligible: n(r?.e30), back: n(r?.b30) },
});

export async function getRetentionReport(): Promise<RetentionReport> {
  const today = getToday();
  const [totals, recent, weeks, active] = await Promise.all([
    db.execute(sql`${LEARNERS} SELECT COUNT(*)::int AS learners, MIN(f.d0)::text AS since, ${RATES(today)} FROM f`),
    db.execute(sql`${LEARNERS} SELECT ${RATES(today)} FROM f WHERE f.d0 >= ${today}::date - 90`),
    db.execute(sql`${LEARNERS} SELECT to_char(date_trunc('week', f.d0), 'YYYY-MM-DD') AS week, COUNT(*)::int AS size, ${RATES(today)} FROM f WHERE f.d0 >= ${today}::date - 83 GROUP BY 1 ORDER BY 1 DESC`),
    db.execute(sql`
      SELECT COUNT(DISTINCT user_id) FILTER (WHERE date::date = ${today}::date)::int AS today,
             COUNT(DISTINCT user_id) FILTER (WHERE date::date > ${today}::date - 7)::int AS week,
             COUNT(DISTINCT user_id) FILTER (WHERE date::date > ${today}::date - 30)::int AS month
      FROM streak_activity WHERE date::date > ${today}::date - 30
    `),
  ]);

  // Accounts live in Supabase Auth; reading them may be refused on some setups.
  let activation: RetentionReport["activation"] = null;
  try {
    const res = await db.execute(sql`
      SELECT COUNT(*)::int AS signups,
             COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM streak_activity a WHERE a.user_id = u.id::text))::int AS started
      FROM auth.users u WHERE u.created_at >= ${today}::date - 30
    `);
    const r = rowsOf(res)[0];
    activation = { signups: n(r?.signups), started: n(r?.started) };
  } catch (e) {
    console.error("[retention] accounts unreadable", (e as Error)?.message || e);
  }

  const t = rowsOf(totals)[0];
  const a = rowsOf(active)[0];
  return {
    today,
    since: (t?.since as string | null) ?? null,
    learners: n(t?.learners),
    active: { today: n(a?.today), week: n(a?.week), month: n(a?.month) },
    overall: rates(t),
    recent: rates(rowsOf(recent)[0]),
    weeks: rowsOf(weeks).map((r) => ({ week: String(r.week), size: n(r.size), ...rates(r) })),
    activation,
  };
}
