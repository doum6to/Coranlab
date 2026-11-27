import * as schema from "../db/schema";
import { OPPOSITES } from "./opposites";
import { sameMeaning } from "./challenge-repair";

/**
 * Builds the levels and exercises of a vocabulary list in the database: a discovery level
 * (flashcards), practice levels of three words mixing every exercise type, and a review.
 * Used by the full seed (scripts/seed.ts) and by the admin action that adds new lists to a
 * course already in use (lib/course-additions.ts): one generator, so every list is built
 * the same way.
 */
export type VocabWord = { french: string; arabic: string };

type Db = any;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number, exclude?: T[]): T[] {
  // Exclude the given items AND any word sharing a meaning with one of them
  // (synonyms / duplicates) so distractors are never also-correct answers.
  const filtered = exclude
    ? arr.filter(
        (item) =>
          !exclude.includes(item) &&
          !exclude.some((e: any) => e?.french && (item as any)?.french && sameMeaning(e.french, (item as any).french)),
      )
    : arr;
  return shuffle(filtered).slice(0, count);
}

function splitArabicLetters(word: string): string[] {
  const letters: string[] = [];
  const diacritics = /[\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08E1\u08E3-\u08FF]/;
  const tatweel = /\u0640/;

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (char === " " || tatweel.test(char)) continue;
    if (diacritics.test(char)) {
      if (letters.length > 0) {
        letters[letters.length - 1] += char;
      }
    } else {
      letters.push(char);
    }
  }
  return letters;
}

/** Exercise types used in mixed levels (everything except FLASHCARD & MATCHING).
 *  MATCHING is added separately as interspersed rounds. */
const SOLO_TYPES = [
  "QCM",
  "VRAI_FAUX",
  "ANAGRAM",
  "QCM_INVERSE",
  "DRAG_DROP",
  "FLASH_RECALL",
  "CONFIDENCE_BET",
  "OPPOSITE",
  "SPOT_THE_ERROR",
] as const;

/** All mixed types including MATCHING (kept for type compatibility). */
const MIXED_TYPES = [...SOLO_TYPES, "MATCHING"] as const;

type MixedType = (typeof MIXED_TYPES)[number];

export function createCourseSeeder(db: Db) {
  let totalChallengesCount = 0;

  /**
   * Creates every level of one list. `firstOrder` is the order of the last lesson already in
   * the unit; the new lessons follow it. Returns how many lessons were created.
   */
  async function seedList(p: { unitId: number; listId: number; title: string; words: VocabWord[]; firstOrder: number }): Promise<number> {
    const allWords = p.words;
    let order = p.firstOrder;
    const lesson = async (suffix: string, levelOrder: number) => {
      order++;
      const [row] = await db
        .insert(schema.lessons)
        .values({ unitId: p.unitId, title: `${p.title} - ${suffix}`, order, listId: p.listId, listTitle: p.title, levelOrder })
        .returning();
      return row;
    };

    // Practice levels take the words three at a time; a lone last word joins the level before it.
    const CHUNK_SIZE = 3;
    const chunks: VocabWord[][] = [];
    for (let i = 0; i < allWords.length; i += CHUNK_SIZE) chunks.push(allWords.slice(i, i + CHUNK_SIZE));
    if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
      const last = chunks.pop()!;
      chunks[chunks.length - 1] = [...chunks[chunks.length - 1], ...last];
    }

    await seedFlashcard((await lesson("Flashcards", 1)).id, allWords);
    for (let ci = 0; ci < chunks.length; ci++) {
      await seedMixedLevel((await lesson(`Pratique ${ci + 1}`, ci + 2)).id, chunks[ci], allWords);
    }
    await seedMixedLevel((await lesson("Révision", chunks.length + 2)).id, allWords, allWords);
    return order - p.firstOrder;
  }

  // ═══════════════════════════════════════════════════════════
  //  LEVEL SEED FUNCTIONS
  //  All distractors come ONLY from the same list's words
  // ═══════════════════════════════════════════════════════════

  /**
   * Level 1 — FLASHCARD: unchanged from previous logic.
   * Groups words into chunks of 3-4, shows flash cards then a
   * matching exercise for each group, finishes with a comprehensive
   * matching round.
   */
  async function seedFlashcard(lessonId: number, words: VocabWord[]) {
    const groupSize = Math.min(4, words.length);
    const groups: VocabWord[][] = [];
    for (let i = 0; i < words.length; i += groupSize) {
      groups.push(words.slice(i, i + groupSize));
    }

    let order = 0;

    for (const group of groups) {
      // Flashcard discovery
      order++;
      totalChallengesCount++;
      const [challenge] = await db
        .insert(schema.challenges)
        .values({ lessonId, type: "FLASHCARD", question: "Découvrez les mots", order })
        .returning();

      await db.insert(schema.challengeOptions).values(
        group.map((word, idx) => ({
          challengeId: challenge.id,
          text: `${word.arabic} - ${word.french}`,
          correct: true,
          arabicText: word.arabic,
          frenchText: word.french,
          pairIndex: idx,
        }))
      );

      // Matching reinforcement
      if (group.length >= 2) {
        order++;
        totalChallengesCount++;
        const [matchChallenge] = await db
          .insert(schema.challenges)
          .values({
            lessonId,
            type: "MATCHING",
            question: "Reliez chaque mot arabe à sa traduction",
            order,
          })
          .returning();

        await db.insert(schema.challengeOptions).values(
          group.map((word, idx) => ({
            challengeId: matchChallenge.id,
            text: `${word.arabic} = ${word.french}`,
            correct: true,
            arabicText: word.arabic,
            frenchText: word.french,
            pairIndex: idx,
          }))
        );
      }
    }

    // Final comprehensive matching
    order++;
    totalChallengesCount++;
    const [finalMatch] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "MATCHING",
        question: "Reliez chaque mot arabe à sa traduction",
        order,
      })
      .returning();

    const matchWords = words.slice(0, Math.min(6, words.length));
    await db.insert(schema.challengeOptions).values(
      matchWords.map((word, idx) => ({
        challengeId: finalMatch.id,
        text: `${word.arabic} = ${word.french}`,
        correct: true,
        arabicText: word.arabic,
        frenchText: word.french,
        pairIndex: idx,
      }))
    );
  }

  /**
   * Mixed level — generates challenges covering ALL exercise types.
   *
   * Strategy:
   * - 9 solo types (everything except MATCHING) must all appear.
   * - Each word gets a unique set of types (no word+type repetition).
   * - For small chunks (3 words): each word gets 3 types = 9 exercises.
   * - For review levels (many words): each word gets 1 type, types cycle.
   * - A MATCHING round is added at the end.
   *
   * @param lessonId  - the lesson to populate
   * @param levelWords - the words this level is focused on (subset or all)
   * @param allWords  - the full list of words (used for distractors)
   */
  async function seedMixedLevel(
    lessonId: number,
    levelWords: VocabWord[],
    allWords: VocabWord[]
  ) {
    const soloTypes = shuffle([...SOLO_TYPES]);
    const wordCount = levelWords.length;

    // Decide how many types per word so we cover all 9 solo types
    // with minimal repetition.
    // - 3 words → 3 types each = 9 exercises (covers all types exactly)
    // - 4 words → 2-3 types each ≈ 9 exercises
    // - 10+ words (review) → 1 type each, types cycle
    const typesPerWord = Math.max(1, Math.ceil(SOLO_TYPES.length / wordCount));
    // Cap so we don't exceed 9 total types per word
    const cappedTypesPerWord = Math.min(typesPerWord, SOLO_TYPES.length);

    const plan: { word: VocabWord; type: (typeof SOLO_TYPES)[number] }[] = [];
    const usedTypes = new Map<string, Set<string>>();
    let typeIdx = 0;

    // Distribute types round-robin across words
    for (let pass = 0; pass < cappedTypesPerWord; pass++) {
      for (const word of levelWords) {
        if (plan.length >= SOLO_TYPES.length && pass > 0) break;
        const key = word.arabic;
        if (!usedTypes.has(key)) usedTypes.set(key, new Set());
        const used = usedTypes.get(key)!;

        // Pick a type this word hasn't seen yet
        let type = soloTypes[typeIdx % soloTypes.length];
        let attempts = 0;
        while (used.has(type) && attempts < soloTypes.length) {
          typeIdx++;
          type = soloTypes[typeIdx % soloTypes.length];
          attempts++;
        }
        if (!used.has(type)) {
          used.add(type);
          plan.push({ word, type });
          typeIdx++;
        }
      }
    }

    // Ensure all 9 solo types are covered (fill gaps if needed)
    const coveredTypes = new Set(plan.map((p) => p.type));
    for (const type of soloTypes) {
      if (!coveredTypes.has(type)) {
        // Assign to a random word that hasn't used this type
        const candidates = levelWords.filter((w) => {
          const used = usedTypes.get(w.arabic);
          return !used || !used.has(type);
        });
        const word = candidates.length > 0
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : levelWords[Math.floor(Math.random() * levelWords.length)];
        plan.push({ word, type });
      }
    }

    // Spread so no two consecutive challenges share the same type OR word
    const spread = spreadByTypeAndWord(shuffle(plan));

    let order = 0;
    for (const { word, type } of spread) {
      order++;
      await seedSingleChallenge(lessonId, order, type, word, allWords);
    }

    // Final matching round
    order++;
    await seedMatchingRound(
      lessonId,
      order,
      shuffle(levelWords).slice(0, Math.min(6, levelWords.length))
    );
  }

  /** Spread challenges so no two consecutive ones share the same type OR word. */
  function spreadByTypeAndWord(
    items: { word: VocabWord; type: MixedType }[]
  ): { word: VocabWord; type: MixedType }[] {
    const result: { word: VocabWord; type: MixedType }[] = [];
    const remaining = [...items];

    while (remaining.length > 0) {
      const lastType = result.length > 0 ? result[result.length - 1].type : null;
      const lastWord = result.length > 0 ? result[result.length - 1].word.arabic : null;

      // Best: different type AND different word
      let idx = remaining.findIndex(
        (item) => item.type !== lastType && item.word.arabic !== lastWord
      );
      // Fallback: at least different word
      if (idx < 0) {
        idx = remaining.findIndex((item) => item.word.arabic !== lastWord);
      }
      // Fallback: at least different type
      if (idx < 0) {
        idx = remaining.findIndex((item) => item.type !== lastType);
      }
      // Last resort: just take whatever is left
      if (idx < 0) idx = 0;

      result.push(remaining.splice(idx, 1)[0]);
    }
    return result;
  }

  // ─── Single challenge generators (one challenge per call) ───

  async function seedSingleChallenge(
    lessonId: number,
    order: number,
    type: MixedType,
    word: VocabWord,
    allWords: VocabWord[]
  ) {
    switch (type) {
      case "QCM":
        return seedOneQCM(lessonId, order, word, allWords);
      case "VRAI_FAUX":
        return seedOneVraiFaux(lessonId, order, word, allWords);
      case "ANAGRAM":
        return seedOneAnagram(lessonId, order, word);
      case "QCM_INVERSE":
        return seedOneQCMInverse(lessonId, order, word, allWords);
      case "DRAG_DROP":
        return seedOneDragDrop(lessonId, order, word, allWords);
      case "FLASH_RECALL":
        return seedOneFlashRecall(lessonId, order, word, allWords);
      case "CONFIDENCE_BET":
        return seedOneConfidenceBet(lessonId, order, word, allWords);
      case "OPPOSITE":
        return seedOneOpposite(lessonId, order, word, allWords);
      case "SPOT_THE_ERROR":
        return seedOneSpotTheError(lessonId, order, allWords);
      case "MATCHING":
        // For single-challenge matching, use a small subset
        return seedMatchingRound(
          lessonId,
          order,
          shuffle(allWords).slice(0, Math.min(4, allWords.length))
        );
    }
  }

  async function seedOneQCM(
    lessonId: number,
    order: number,
    word: VocabWord,
    allWords: VocabWord[]
  ) {
    totalChallengesCount++;
    const distractorCount = Math.min(3, allWords.length - 1);
    const wrongWords = pickRandom(allWords, distractorCount, [word]).map((w) => w.french);
    const options = shuffle([
      { text: word.french, correct: true, frenchText: word.french },
      ...wrongWords.map((w) => ({ text: w, correct: false, frenchText: w })),
    ]);

    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "QCM",
        question: "Quelle est la traduction de ce mot ?",
        order,
        arabicWord: word.arabic,
      })
      .returning();

    await db.insert(schema.challengeOptions).values(
      options.map((opt) => ({
        challengeId: challenge.id,
        text: opt.text,
        correct: opt.correct,
        frenchText: opt.frenchText,
      }))
    );
  }

  async function seedOneVraiFaux(
    lessonId: number,
    order: number,
    word: VocabWord,
    allWords: VocabWord[]
  ) {
    totalChallengesCount++;
    const isCorrect = Math.random() < 0.5;
    const otherWords = allWords.filter((w) => w !== word && !sameMeaning(w.french, word.french));
    const proposedTranslation = isCorrect
      ? word.french
      : otherWords.length > 0
        ? otherWords[Math.floor(Math.random() * otherWords.length)].french
        : word.french;

    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "VRAI_FAUX",
        question: "Cette traduction est-elle correcte ?",
        order,
        arabicWord: word.arabic,
        frenchTranslation: proposedTranslation,
      })
      .returning();

    const actualCorrect = proposedTranslation === word.french;
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: challenge.id,
        text: "VRAI",
        correct: actualCorrect,
        frenchText: "VRAI",
      },
      {
        challengeId: challenge.id,
        text: "FAUX",
        correct: !actualCorrect,
        frenchText: "FAUX",
      },
    ]);
  }

  async function seedOneAnagram(
    lessonId: number,
    order: number,
    word: VocabWord
  ) {
    totalChallengesCount++;
    const letters = splitArabicLetters(word.arabic);

    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "ANAGRAM",
        question: "Reconstituez le mot arabe",
        order,
        arabicWord: word.arabic,
        frenchTranslation: word.french,
      })
      .returning();

    await db.insert(schema.challengeOptions).values(
      shuffle(letters).map((letter, idx) => ({
        challengeId: challenge.id,
        text: letter,
        correct: true,
        arabicText: letter,
        pairIndex: idx,
      }))
    );
  }

  async function seedOneQCMInverse(
    lessonId: number,
    order: number,
    word: VocabWord,
    allWords: VocabWord[]
  ) {
    totalChallengesCount++;
    const distractorCount = Math.min(3, allWords.length - 1);
    const wrongWords = pickRandom(allWords, distractorCount, [word]).map((w) => w.arabic);
    const options = shuffle([
      { text: word.arabic, correct: true, arabicText: word.arabic },
      ...wrongWords.map((w) => ({ text: w, correct: false, arabicText: w })),
    ]);

    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "QCM_INVERSE",
        question: "Trouvez le mot arabe correspondant",
        order,
        frenchTranslation: word.french,
      })
      .returning();

    await db.insert(schema.challengeOptions).values(
      options.map((opt) => ({
        challengeId: challenge.id,
        text: opt.text,
        correct: opt.correct,
        arabicText: opt.arabicText,
      }))
    );
  }

  async function seedOneDragDrop(
    lessonId: number,
    order: number,
    word: VocabWord,
    allWords: VocabWord[]
  ) {
    totalChallengesCount++;
    const distractorCount = Math.min(3, allWords.length - 1);
    const wrongWords = pickRandom(allWords, distractorCount, [word]).map((w) => w.french);
    const options = shuffle([
      { text: word.french, correct: true, frenchText: word.french },
      ...wrongWords.map((w) => ({ text: w, correct: false, frenchText: w })),
    ]);

    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "DRAG_DROP",
        question: "Choisissez la bonne traduction",
        order,
        arabicWord: word.arabic,
      })
      .returning();

    await db.insert(schema.challengeOptions).values(
      options.map((opt) => ({
        challengeId: challenge.id,
        text: opt.text,
        correct: opt.correct,
        frenchText: opt.frenchText,
      }))
    );
  }

  // ─── FLASH_RECALL: word shown briefly, then pick translation ───
  async function seedOneFlashRecall(
    lessonId: number,
    order: number,
    word: VocabWord,
    allWords: VocabWord[]
  ) {
    totalChallengesCount++;
    const distractorCount = Math.min(3, allWords.length - 1);
    const wrongWords = pickRandom(allWords, distractorCount, [word]).map((w) => w.french);
    const options = shuffle([
      { text: word.french, correct: true, frenchText: word.french },
      ...wrongWords.map((w) => ({ text: w, correct: false, frenchText: w })),
    ]);

    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "FLASH_RECALL",
        question: "Mémorise le mot puis choisis sa traduction",
        order,
        arabicWord: word.arabic,
      })
      .returning();

    await db.insert(schema.challengeOptions).values(
      options.map((opt) => ({
        challengeId: challenge.id,
        text: opt.text,
        correct: opt.correct,
        frenchText: opt.frenchText,
      }))
    );
  }

  // ─── CONFIDENCE_BET: bet on confidence then answer ───
  async function seedOneConfidenceBet(
    lessonId: number,
    order: number,
    word: VocabWord,
    allWords: VocabWord[]
  ) {
    totalChallengesCount++;
    const distractorCount = Math.min(3, allWords.length - 1);
    const wrongWords = pickRandom(allWords, distractorCount, [word]).map((w) => w.french);
    const options = shuffle([
      { text: word.french, correct: true, frenchText: word.french },
      ...wrongWords.map((w) => ({ text: w, correct: false, frenchText: w })),
    ]);

    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "CONFIDENCE_BET",
        question: "Parie sur ta confiance !",
        order,
        arabicWord: word.arabic,
      })
      .returning();

    await db.insert(schema.challengeOptions).values(
      options.map((opt) => ({
        challengeId: challenge.id,
        text: opt.text,
        correct: opt.correct,
        frenchText: opt.frenchText,
      }))
    );
  }

  // ─── OPPOSITE: find the translation of the opposite word ───
  // Pairs words within the same list that form natural opposites
  // (e.g. "ceci" ↔ "cela", "oui" ↔ "non"). If no opposite exists,
  // falls back to a random different word from the list.
  function findOpposite(word: VocabWord, allWords: VocabWord[]): VocabWord | null {
    for (const c of OPPOSITES[word.french] ?? []) {
      const found = allWords.find((w) => w.french === c);
      if (found) return found;
    }
    // No genuine opposite in this list → the caller falls back to a QCM.
    return null;
  }

  async function seedOneOpposite(
    lessonId: number,
    order: number,
    word: VocabWord,
    allWords: VocabWord[]
  ) {
    const opposite = findOpposite(word, allWords);
    if (!opposite) {
      // Fallback to QCM if no opposite found
      return seedOneQCM(lessonId, order, word, allWords);
    }

    totalChallengesCount++;
    const distractorCount = Math.min(3, allWords.length - 1);
    const wrongWords = pickRandom(allWords, distractorCount, [opposite]).map((w) => w.french);
    const options = shuffle([
      { text: opposite.french, correct: true, frenchText: opposite.french },
      ...wrongWords.map((w) => ({ text: w, correct: false, frenchText: w })),
    ]);

    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "OPPOSITE",
        question: "Trouve la traduction du contraire",
        order,
        arabicWord: word.arabic,
        frenchTranslation: word.french,
      })
      .returning();

    await db.insert(schema.challengeOptions).values(
      options.map((opt) => ({
        challengeId: challenge.id,
        text: opt.text,
        correct: opt.correct,
        frenchText: opt.frenchText,
      }))
    );
  }

  // ─── SPOT_THE_ERROR: find the wrong pair among 4-5 ───
  async function seedOneSpotTheError(
    lessonId: number,
    order: number,
    allWords: VocabWord[]
  ) {
    if (allWords.length < 3) {
      // Not enough words, fallback to QCM with the first word
      return seedOneQCM(lessonId, order, allWords[0], allWords);
    }

    totalChallengesCount++;
    const pairCount = Math.min(5, allWords.length);
    const selectedWords = shuffle(allWords).slice(0, pairCount);

    // Pick one word to give a wrong translation
    const errorIdx = Math.floor(Math.random() * selectedWords.length);
    const errorWord = selectedWords[errorIdx];
    const otherWords = allWords.filter(
      (w) => w.arabic !== errorWord.arabic && !sameMeaning(w.french, errorWord.french),
    );
    const wrongTranslation =
      otherWords.length > 0
        ? otherWords[Math.floor(Math.random() * otherWords.length)].french
        : "???";

    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "SPOT_THE_ERROR",
        question: "Trouve la paire incorrecte",
        order,
      })
      .returning();

    await db.insert(schema.challengeOptions).values(
      selectedWords.map((word, idx) => ({
        challengeId: challenge.id,
        text: `${word.arabic} = ${idx === errorIdx ? wrongTranslation : word.french}`,
        correct: idx !== errorIdx, // correct=true means the pair IS correct; the wrong pair has correct=false
        arabicText: word.arabic,
        frenchText: idx === errorIdx ? wrongTranslation : word.french,
        pairIndex: idx,
      }))
    );
  }

  async function seedMatchingRound(
    lessonId: number,
    order: number,
    roundWords: VocabWord[]
  ) {
    totalChallengesCount++;
    const [challenge] = await db
      .insert(schema.challenges)
      .values({
        lessonId,
        type: "MATCHING",
        question: "Reliez chaque mot arabe à sa traduction",
        order,
      })
      .returning();

    await db.insert(schema.challengeOptions).values(
      roundWords.map((word, idx) => ({
        challengeId: challenge.id,
        text: `${word.arabic} = ${word.french}`,
        correct: true,
        arabicText: word.arabic,
        frenchText: word.french,
        pairIndex: idx,
      }))
    );
  }

  return { seedList, challengeCount: () => totalChallengesCount };
}
