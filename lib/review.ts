import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { challenges, wordReview } from "@/db/schema";
import { normalizeChallenge } from "@/lib/challenge-normalize";
import { ensureDbLockdown } from "@/lib/db-security";
import { translateContent } from "@/lib/i18n/content-i18n";
import type { Locale } from "@/lib/i18n/locales";
import { addDays, getToday } from "@/lib/streak-utils";

/**
 * Review of the words already learned, spaced out over time.
 *
 * A word enters the review once the learner has practised it in a lesson. Each word sits in a
 * "box": answered right when it was due, it moves up one box and comes back later (tomorrow,
 * then 3 days, a week, two weeks, a month, two months); answered wrong, it goes back to the
 * first box and returns the next day. A session takes the words that are due, the most
 * overdue first, and asks one exercise per word, drawn from the exercises of the lessons the
 * learner has already done.
 */

/** Exercise types that test one word on its own and are quick enough for a review. */
const REVIEW_TYPES = ["QCM", "QCM_INVERSE", "VRAI_FAUX", "ANAGRAM", "DRAG_DROP", "FLASH_RECALL"] as const;
/** Words per session, and the fewest practised words a session needs. */
export const SESSION_SIZE = 10;
export const SESSION_MIN = 4;
/** Days before a word comes back, by box (a word in box 1 is due the next day). */
const INTERVALS = [0, 1, 3, 7, 14, 30, 60];
const TOP_BOX = INTERVALS.length - 1;
/** From this box on a word counts as known. */
const KNOWN_BOX = 4;

let ensured = false;
/** Creates the table when it is missing (the app is deployed without a migration step). */
async function ensureReviewTable() {
  if (ensured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "word_review" (
      "user_id" text NOT NULL,
      "word" text NOT NULL,
      "box" integer NOT NULL DEFAULT 0,
      "due" text NOT NULL,
      "seen" integer NOT NULL DEFAULT 0,
      "wrong" integer NOT NULL DEFAULT 0,
      "updated_at" timestamp NOT NULL DEFAULT now(),
      PRIMARY KEY ("user_id", "word")
    );
  `);
  void ensureDbLockdown();
  ensured = true;
}

export type ReviewWord = {
  arabic: string;
  /** Meaning, in the learner's language. */
  meaning: string;
  listId: number;
  listTitle: string;
  /** 0: discovered, not practised yet. 1: being learned. 2: holding. 3: known. */
  strength: 0 | 1 | 2 | 3;
  /** Practised in a lesson, so it can be asked in a review. */
  practised: boolean;
  due: boolean;
};

export type ReviewOverview = {
  words: ReviewWord[];
  practised: number;
  due: number;
  known: number;
  /** When nothing is due: the day the next words come back, and how many. */
  next: { date: string; count: number } | null;
};

type Row = Record<string, unknown>;
const rowsOf = (res: unknown): Row[] => ((res as { rows?: Row[] })?.rows ?? (res as Row[]) ?? []) as Row[];
const keyOf = (s: unknown) => String(s ?? "").trim();

/** The exercises the learner has done that can serve in a review, with the word each one tests. */
async function reviewableChallenges(userId: string, onlyIds?: number[]): Promise<{ id: number; type: string; word: string }[]> {
  if (onlyIds && !onlyIds.length) return [];
  const types = sql.join(REVIEW_TYPES.map((t) => sql`${t}`), sql`, `);
  const only = onlyIds ? sql`AND c.id IN (${sql.join(onlyIds.map((id) => sql`${id}`), sql`, `)})` : sql``;
  const res = await db.execute(sql`
    SELECT DISTINCT c.id, c.type::text AS type,
           COALESCE(c.arabic_word, (SELECT o.arabic_text FROM challenge_options o WHERE o.challenge_id = c.id AND o.correct LIMIT 1)) AS word
    FROM challenge_progress p
    JOIN challenges c ON c.id = p.challenge_id
    WHERE p.user_id = ${userId} AND p.completed AND c.type::text IN (${types}) ${only}
  `);
  return rowsOf(res).map((r) => ({ id: Number(r.id), type: String(r.type), word: keyOf(r.word) })).filter((r) => r.word);
}

type State = { box: number; due: string };

async function loadState(userId: string): Promise<Map<string, State>> {
  await ensureReviewTable();
  const rows = await db.query.wordReview.findMany({ where: eq(wordReview.userId, userId), columns: { word: true, box: true, due: true } });
  return new Map(rows.map((r) => [r.word, { box: r.box, due: r.due }]));
}

/**
 * Everything the review page shows: the words the learner has met (in the order of the
 * course), where each one stands, and how many are due today. `lockedLists` are the lists the
 * learner cannot open (Premium): their words stay out.
 */
export async function getReviewOverview(userId: string, locale: Locale, isLocked: (listId: number) => Promise<boolean>): Promise<ReviewOverview> {
  const [discovered, reviewable, state] = await Promise.all([
    db.execute(sql`
      SELECT o.arabic_text AS arabic, o.french_text AS french, l.list_id, l.list_title
      FROM challenge_progress p
      JOIN challenges c ON c.id = p.challenge_id AND c.type::text = 'FLASHCARD'
      JOIN challenge_options o ON o.challenge_id = c.id
      JOIN lessons l ON l.id = c.lesson_id
      JOIN units u ON u.id = l.unit_id
      WHERE p.user_id = ${userId} AND p.completed AND o.arabic_text IS NOT NULL AND o.french_text IS NOT NULL
      ORDER BY u."order", l."order", c."order", o.pair_index
    `),
    reviewableChallenges(userId),
    loadState(userId),
  ]);
  const practisedWords = new Set(reviewable.map((r) => r.word));
  const today = getToday();

  const locked = new Map<number, boolean>();
  const words: ReviewWord[] = [];
  const seen = new Set<string>();
  for (const r of rowsOf(discovered)) {
    const arabic = keyOf(r.arabic);
    if (!arabic || seen.has(arabic)) continue;
    const listId = Number(r.list_id);
    if (!locked.has(listId)) locked.set(listId, await isLocked(listId));
    if (locked.get(listId)) continue;
    seen.add(arabic);
    const practised = practisedWords.has(arabic);
    const st = state.get(arabic);
    const box = st?.box ?? 0;
    words.push({
      arabic,
      meaning: translateContent(String(r.french), locale),
      listId,
      listTitle: translateContent(String(r.list_title ?? ""), locale),
      strength: !practised ? 0 : box >= KNOWN_BOX ? 3 : box >= 2 ? 2 : 1,
      practised,
      due: practised && (!st || st.due <= today),
    });
  }

  const due = words.filter((w) => w.due).length;
  let next: ReviewOverview["next"] = null;
  if (!due) {
    const upcoming = words.map((w) => state.get(w.arabic)?.due).filter((d): d is string => !!d && d > today).sort();
    if (upcoming.length) next = { date: upcoming[0], count: upcoming.filter((d) => d === upcoming[0]).length };
  }
  return { words, practised: words.filter((w) => w.practised).length, due, known: words.filter((w) => w.strength === 3).length, next };
}

/** How many words will be due on `day` (words never reviewed count: they are due at once). Fails soft. */
export async function countDueOn(userId: string, day: string): Promise<number> {
  try {
    const [reviewable, state] = await Promise.all([reviewableChallenges(userId), loadState(userId)]);
    const words = new Set(reviewable.map((r) => r.word));
    let due = 0;
    words.forEach((w) => { const st = state.get(w); if (!st || st.due <= day) due++; });
    return due;
  } catch (e) {
    console.error("[review] due count unavailable", (e as Error)?.message || e);
    return 0;
  }
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The exercises of a session: one per word, the words that are due first (most overdue first,
 * then those never reviewed, in the order they were learned), topped up with the weakest of
 * the others so a session always has its ten words. Null when the learner has not practised
 * enough words yet.
 */
export async function buildReviewSession(userId: string, locale: Locale, isLocked: (listId: number) => Promise<boolean>) {
  const [overview, reviewable, state] = await Promise.all([getReviewOverview(userId, locale, isLocked), reviewableChallenges(userId), loadState(userId)]);
  const pool = overview.words.filter((w) => w.practised);
  if (pool.length < SESSION_MIN) return null;

  const rank = new Map(pool.map((w, i) => [w.arabic, i]));
  const dueWords = pool.filter((w) => w.due).sort((a, b) => {
    const da = state.get(a.arabic)?.due ?? "9999";
    const db_ = state.get(b.arabic)?.due ?? "9999";
    return da === db_ ? rank.get(a.arabic)! - rank.get(b.arabic)! : da < db_ ? -1 : 1;
  });
  const others = pool.filter((w) => !w.due).sort((a, b) => {
    const sa = state.get(a.arabic)!;
    const sb = state.get(b.arabic)!;
    return sa.box === sb.box ? (sa.due < sb.due ? -1 : 1) : sa.box - sb.box;
  });
  const chosen = shuffle([...dueWords, ...others].slice(0, SESSION_SIZE));

  // One exercise per word, avoiding the same type twice in a row when the word allows it.
  const byWord = new Map<string, { id: number; type: string }[]>();
  for (const r of reviewable) byWord.set(r.word, [...(byWord.get(r.word) ?? []), r]);
  const picks: { id: number; word: string }[] = [];
  let lastType = "";
  for (const w of chosen) {
    const options = shuffle(byWord.get(w.arabic) ?? []);
    const pick = options.find((o) => o.type !== lastType) ?? options[0];
    if (!pick) continue;
    lastType = pick.type;
    picks.push({ id: pick.id, word: w.arabic });
  }
  if (picks.length < SESSION_MIN) return null;

  const rows = await db.query.challenges.findMany({ where: inArray(challenges.id, picks.map((p) => p.id)), with: { challengeOptions: true } });
  const byId = new Map(rows.map((r) => [r.id, r]));
  const list = picks.flatMap((p) => {
    const raw = byId.get(p.id);
    // Every exercise of a review has been done before: it is worth a revision's XP.
    return raw ? [{ ...normalizeChallenge(raw, locale), completed: true }] : [];
  });
  return { challenges: list, due: overview.due };
}

/**
 * Records how the words of a session were answered at the first try. Only exercises the
 * learner has really done are accepted, and each word moves once per call.
 */
export async function recordReviewAnswers(userId: string, answers: { id: number; right: boolean }[], today: string): Promise<void> {
  const clean = answers.filter((a) => Number.isInteger(a?.id)).slice(0, 50);
  if (!clean.length) return;
  await ensureReviewTable();
  const known = await reviewableChallenges(userId, Array.from(new Set(clean.map((a) => a.id))));
  const wordOf = new Map(known.map((k) => [k.id, k.word]));
  // A word asked twice counts as missed if it was missed once.
  const verdict = new Map<string, boolean>();
  for (const a of clean) {
    const word = wordOf.get(a.id);
    if (word) verdict.set(word, (verdict.get(word) ?? true) && !!a.right);
  }
  if (!verdict.size) return;

  const existing = await db.query.wordReview.findMany({ where: and(eq(wordReview.userId, userId), inArray(wordReview.word, Array.from(verdict.keys()))) });
  const current = new Map(existing.map((r) => [r.word, r]));
  for (const [word, right] of Array.from(verdict.entries())) {
    const row = current.get(word);
    let box = row?.box ?? 0;
    let due = row?.due ?? today;
    if (!right) {
      box = 1;
      due = addDays(today, 1);
    } else if (!row || row.due <= today) {
      box = Math.min(box + 1, TOP_BOX);
      due = addDays(today, INTERVALS[box]);
    }
    // Right but not due yet (a top-up word): it keeps its place and its date.
    const set = { box, due, seen: (row?.seen ?? 0) + 1, wrong: (row?.wrong ?? 0) + (right ? 0 : 1), updatedAt: new Date() };
    await db.insert(wordReview).values({ userId, word, ...set }).onConflictDoUpdate({ target: [wordReview.userId, wordReview.word], set });
  }
}
