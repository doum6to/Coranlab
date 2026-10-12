/**
 * Read-time sanitiser for generated exercises. The seed built distractors at
 * random from the same list, which produced several classes of unfair
 * exercises that learners reported as "the right answer is marked wrong":
 *
 *  - a distractor that shares a meaning with the right answer ("Sur" vs
 *    "Au-dessus / Sur", "Si" vs "Si (hypothèse)", a word that appears twice
 *    in the vocabulary such as "Voir" or "Pardonner");
 *  - a TRUE/FALSE "wrong" translation that is in fact a synonym of the word;
 *  - a matching round with two pairs carrying the same French label;
 *  - a "find the wrong pair" round whose supposedly wrong pair is right;
 *  - an "opposite" exercise whose "opposite" is a random word.
 *
 * Everything is repaired on read (web + native API) so no migration is
 * needed; the seed also uses `sameMeaning` for future data.
 */
import { vocabularyData } from "@/scripts/vocabulary-data";
import { OPPOSITES, isOpposite } from "@/lib/opposites";

/* ───────────── meaning comparison ───────────── */

const SYNONYM_GROUPS: string[][] = [
  ["oui", "bien sûr / si"],
  ["comme", "pareil à / comme"],
];

const norm = (s: string) => s.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim().toLowerCase();
const segments = (s: string) =>
  norm(s)
    .split("/")
    .map((x) => x.trim())
    .filter(Boolean);

/** True when two French labels denote the same meaning (or overlap). */
export function sameMeaning(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const na = norm(a), nb = norm(b);
  if (na === nb) return true;
  const sa = segments(a), sb = segments(b);
  if (sa.some((x) => sb.includes(x))) return true;
  return SYNONYM_GROUPS.some((g) => g.includes(na) && g.includes(nb));
}

/* ───────────── vocabulary index (arabic → meanings) ───────────── */

const stripArabic = (s: string) => s.replace(/[ً-ٰٟۖ-ۭـ\s]/g, "");
const MEANINGS: Record<string, string[]> = {};
for (const unit of vocabularyData)
  for (const list of unit.lists)
    for (const w of list.words) (MEANINGS[stripArabic(w.arabic)] ??= []).push(w.french);

/** Every French meaning the vocabulary gives for this Arabic word. */
export function meaningsOf(arabic: string | null | undefined): string[] {
  if (!arabic) return [];
  return MEANINGS[stripArabic(arabic)] ?? [];
}

const isMeaningOf = (arabic: string | null | undefined, label: string | null | undefined) =>
  meaningsOf(arabic).some((m) => sameMeaning(m, label));

/* ───────────── repair ───────────── */

type Ch = { type: string; question: string; arabicWord?: string | null; frenchTranslation: string | null };
type Opt = {
  text: string;
  correct: boolean;
  frenchText: string | null;
  arabicText: string | null;
  pairIndex?: number | null;
};

const QCM_LIKE = new Set(["QCM", "DRAG_DROP", "FLASH_RECALL", "CONFIDENCE_BET"]);
const label = (o: Opt) => o.frenchText ?? o.text;

/** Drops wrong options whose label means the same as the right answer, and duplicates. */
function dropAmbiguousDistractors<O extends Opt>(options: O[], correctLabel: string | null, alsoCorrect: string[] = []): O[] {
  const seen = new Set<string>();
  return options.filter((o) => {
    if (o.correct) return true;
    const l = label(o);
    if (sameMeaning(l, correctLabel) || alsoCorrect.some((c) => sameMeaning(l, c))) return false;
    const key = norm(l);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function repairChallenge<T extends Ch, O extends Opt>(challenge: T, options: O[]): { challenge: T; options: O[] } {
  let ch: T = challenge;
  let opts: O[] = options;

  /* OPPOSITE: random "opposite" → plain QCM on the word's own meaning. */
  if (ch.type === "OPPOSITE") {
    const correct = opts.find((o) => o.correct);
    const meaning = ch.frenchTranslation?.trim();
    if (correct && meaning && !isOpposite(meaning, label(correct))) {
      const old = label(correct);
      opts = opts.map((o) => {
        if (o.correct) return { ...o, text: meaning, frenchText: meaning };
        if (sameMeaning(label(o), meaning)) return { ...o, text: old, frenchText: old };
        return o;
      });
      ch = { ...ch, type: "QCM", question: "Quelle est la traduction de ce mot ?" };
    } else if (correct && meaning) {
      // Genuine opposite: no distractor may be another valid opposite.
      opts = dropAmbiguousDistractors(opts, label(correct), OPPOSITES[meaning] ?? []);
      return { challenge: ch, options: opts };
    }
  }

  /* QCM-like: the right answer must be unambiguous among the options. */
  if (QCM_LIKE.has(ch.type)) {
    const correct = opts.find((o) => o.correct);
    if (correct) {
      // Other meanings of the same Arabic word are also acceptable answers.
      const extra = meaningsOf(ch.arabicWord).filter((m) => !sameMeaning(m, label(correct)));
      opts = dropAmbiguousDistractors(opts, label(correct), extra);
    }
    return { challenge: ch, options: opts };
  }

  /* QCM_INVERSE: pick the Arabic word; distractor Arabic words must not mean the same. */
  if (ch.type === "QCM_INVERSE") {
    const target = ch.frenchTranslation;
    const seen = new Set<string>();
    opts = opts.filter((o) => {
      if (o.correct) return true;
      const ar = o.arabicText ?? o.text;
      if (isMeaningOf(ar, target)) return false;
      const key = stripArabic(ar);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return { challenge: ch, options: opts };
  }

  /* VRAI_FAUX: the truth value must follow the real meaning, synonyms included. */
  if (ch.type === "VRAI_FAUX") {
    const known = meaningsOf(ch.arabicWord);
    if (known.length && ch.frenchTranslation) {
      const truth = isMeaningOf(ch.arabicWord, ch.frenchTranslation);
      opts = opts.map((o) =>
        o.text === "VRAI" ? { ...o, correct: truth } : o.text === "FAUX" ? { ...o, correct: !truth } : o,
      );
    }
    return { challenge: ch, options: opts };
  }

  /* MATCHING / FLASHCARD: no two pairs may share a French label. */
  if (ch.type === "MATCHING" || ch.type === "FLASHCARD") {
    const kept: O[] = [];
    for (const o of opts) {
      if (kept.some((k) => sameMeaning(label(k), label(o)))) continue;
      kept.push(o);
    }
    if (kept.length >= 2 || ch.type === "FLASHCARD") opts = kept;
    return { challenge: ch, options: opts };
  }

  /* SPOT_THE_ERROR: the "wrong" pair must really be wrong. */
  if (ch.type === "SPOT_THE_ERROR") {
    const wrong = opts.find((o) => !o.correct);
    if (wrong && isMeaningOf(wrong.arabicText, wrong.frenchText)) {
      // No real error in this round → turn it into a matching round of the
      // genuine pairs (dedup by meaning, keep pairIndex contiguous).
      const pairs: O[] = [];
      for (const o of opts.filter((x) => x.correct)) {
        if (pairs.some((k) => sameMeaning(label(k), label(o)))) continue;
        pairs.push(o);
      }
      if (pairs.length >= 2) {
        ch = { ...ch, type: "MATCHING", question: "Reliez chaque mot arabe à sa traduction" };
        opts = pairs.map((o, i) => ({ ...o, pairIndex: i }));
      }
    }
    return { challenge: ch, options: opts };
  }

  return { challenge: ch, options: opts };
}
