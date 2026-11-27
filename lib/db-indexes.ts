import { sql } from "drizzle-orm";

import db from "@/db/drizzle";

/**
 * Indexes of the course tables. They only had their primary keys, so "the exercises of this
 * level" or "this learner's progress" read whole tables: fine with a few rows, seconds once
 * the course and the number of learners grew. Created at server start when missing (the app
 * is deployed without a migration step); each statement stands alone so one failure does not
 * stop the others.
 */
const INDEXES = [
  `CREATE INDEX IF NOT EXISTS "challenge_progress_user_challenge" ON "challenge_progress" ("user_id", "challenge_id")`,
  `CREATE INDEX IF NOT EXISTS "challenge_progress_challenge" ON "challenge_progress" ("challenge_id")`,
  `CREATE INDEX IF NOT EXISTS "challenges_lesson" ON "challenges" ("lesson_id")`,
  `CREATE INDEX IF NOT EXISTS "challenge_options_challenge" ON "challenge_options" ("challenge_id")`,
  `CREATE INDEX IF NOT EXISTS "lessons_unit" ON "lessons" ("unit_id")`,
  `CREATE INDEX IF NOT EXISTS "lessons_list" ON "lessons" ("list_id")`,
];

let ran: Promise<void> | null = null;
/** Runs once per server process; a no-op once the indexes exist. Never throws. */
export function ensureDbIndexes(): Promise<void> {
  if (!ran) {
    ran = (async () => {
      for (const statement of INDEXES) {
        try {
          await db.execute(sql.raw(statement));
        } catch (e) {
          console.error("[db-indexes] not created:", statement.split('"')[1], (e as Error)?.message || e);
        }
      }
    })();
  }
  return ran;
}
