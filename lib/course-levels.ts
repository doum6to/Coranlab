import { sql } from "drizzle-orm";

import db from "@/db/drizzle";

/**
 * The levels of a course with the learner's progress on each, counted in the database.
 *
 * The page used to load every exercise of the course (several thousand rows, each with its
 * progress) to count them in JavaScript: seconds of query time once the course grew. Here the
 * database returns one row per level with two numbers.
 */
export type LevelRow = {
  unitId: number;
  unitTitle: string;
  unitDescription: string;
  unitOrder: number;
  /** Null for a unit that has no level yet. */
  lessonId: number | null;
  title: string;
  listId: number;
  listTitle: string | null;
  levelOrder: number;
  challengeCount: number;
  completedChallengeCount: number;
};

export async function loadCourseLevels(userId: string, courseId: number): Promise<LevelRow[]> {
  // An exercise counts as done when it has progress and none of it is unfinished.
  const res = await db.execute(sql`
    SELECT u.id AS unit_id, u.title AS unit_title, u.description AS unit_description, u."order" AS unit_order,
           l.id AS lesson_id, l.title, l.list_id, l.list_title, l.level_order,
           COUNT(c.id)::int AS total,
           COUNT(p.challenge_id)::int AS done
    FROM units u
    LEFT JOIN lessons l ON l.unit_id = u.id
    LEFT JOIN challenges c ON c.lesson_id = l.id
    LEFT JOIN (
      SELECT challenge_id FROM challenge_progress WHERE user_id = ${userId} GROUP BY challenge_id HAVING bool_and(completed)
    ) p ON p.challenge_id = c.id
    WHERE u.course_id = ${courseId}
    GROUP BY u.id, l.id
    ORDER BY u."order", l."order", l.id
  `);
  const rows = ((res as unknown as { rows?: Record<string, unknown>[] }).rows ?? []) as Record<string, unknown>[];
  return rows.map((r) => ({
    unitId: Number(r.unit_id),
    unitTitle: String(r.unit_title),
    unitDescription: String(r.unit_description),
    unitOrder: Number(r.unit_order),
    lessonId: r.lesson_id === null ? null : Number(r.lesson_id),
    title: String(r.title ?? ""),
    listId: Number(r.list_id ?? 0),
    listTitle: (r.list_title as string | null) ?? null,
    levelOrder: Number(r.level_order ?? 1),
    challengeCount: Number(r.total),
    completedChallengeCount: Number(r.done),
  }));
}
