import "server-only";
import { eq, inArray, max, sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { lessons, units } from "@/db/schema";
import { createCourseSeeder } from "@/lib/course-seeder";
import { vocabularyData } from "@/scripts/vocabulary-data";
import { ADDED_LISTS } from "@/scripts/vocabulary-additions";

/**
 * Adds the lists of scripts/vocabulary-additions.ts to a course already in use, without
 * touching what exists: no lesson, exercise or learner progress is modified or deleted.
 *
 * Each list is created in its own transaction (all of it or nothing), and a list already
 * there is skipped, so the operation can be interrupted and run again safely. A run stops by
 * itself before the server's time limit; the admin page calls it again until nothing is left.
 * Once every list is in, the range written on each part is corrected.
 */

/** What each part of the course covers once complete (the reference booklet's own figures). */
export const UNIT_RANGES = ["0% à 41% du Coran", "41% à 60% du Coran", "60% à 85% du Coran"];

async function courseUnits() {
  const titles = vocabularyData.map((u) => u.title);
  const rows = await db.select().from(units).where(inArray(units.title, titles));
  // One row per part, in course order.
  return titles.map((t) => rows.find((r) => r.title === t) ?? null);
}

async function existingListTitles(unitIds: number[]): Promise<Set<string>> {
  if (!unitIds.length) return new Set();
  const rows = await db.selectDistinct({ title: lessons.listTitle }).from(lessons).where(inArray(lessons.unitId, unitIds));
  return new Set(rows.map((r) => r.title).filter((t): t is string => !!t));
}

export type AdditionsStatus = { total: number; done: number; missing: string[]; rangesFixed: boolean; ready: boolean };

export async function additionsStatus(): Promise<AdditionsStatus> {
  const us = await courseUnits();
  const ready = us.every(Boolean);
  const have = await existingListTitles(us.filter(Boolean).map((u) => u!.id));
  const missing = ADDED_LISTS.filter((l) => !have.has(l.title)).map((l) => l.title);
  return {
    total: ADDED_LISTS.length,
    done: ADDED_LISTS.length - missing.length,
    missing,
    rangesFixed: ready && us.every((u, i) => u!.description === UNIT_RANGES[i]),
    ready,
  };
}

/** Adds as many missing lists as fit in `budgetMs`, then reports what is left. */
export async function addNextLists(budgetMs = 30_000): Promise<{ added: string[]; remaining: number; rangesFixed: boolean }> {
  const started = Date.now();
  const us = await courseUnits();
  if (!us.every(Boolean)) throw new Error("Course parts not found in the database.");
  const added: string[] = [];

  for (const list of ADDED_LISTS) {
    if (Date.now() - started > budgetMs) break;
    const unit = us[list.unit]!;
    const created = await db.transaction(async (tx) => {
      // One writer at a time: two clicks, or two admins, must not create the same list twice.
      await tx.execute(sql`select pg_advisory_xact_lock(72727401)`);
      const already = await tx.select({ id: lessons.id }).from(lessons).where(sql`${lessons.unitId} = ${unit.id} and ${lessons.listTitle} = ${list.title}`).limit(1);
      if (already.length) return false;
      const [{ lastList }] = await tx.select({ lastList: max(lessons.listId) }).from(lessons);
      const [{ lastOrder }] = await tx.select({ lastOrder: max(lessons.order) }).from(lessons).where(eq(lessons.unitId, unit.id));
      await createCourseSeeder(tx).seedList({ unitId: unit.id, listId: (lastList ?? 0) + 1, title: list.title, words: list.words, firstOrder: lastOrder ?? 0 });
      return true;
    });
    if (created) added.push(list.title);
  }

  const status = await additionsStatus();
  let rangesFixed = status.rangesFixed;
  if (status.missing.length === 0 && !rangesFixed) {
    for (let i = 0; i < us.length; i++) await db.update(units).set({ description: UNIT_RANGES[i] }).where(eq(units.id, us[i]!.id));
    rangesFixed = true;
  }
  return { added, remaining: status.missing.length, rangesFixed };
}
