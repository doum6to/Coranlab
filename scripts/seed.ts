import { config } from "dotenv";
config({ path: ".env.local" });
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema";
import { vocabularyData, VocabWord } from "./vocabulary-data";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema });

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number, exclude?: T[]): T[] {
  const filtered = exclude ? arr.filter((item) => !exclude.includes(item)) : arr;
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

/** Exercise types used in mixed levels (everything except FLASHCARD). */
const MIXED_TYPES = [
  "QCM",
  "VRAI_FAUX",
  "MATCHING",
  "ANAGRAM",
  "QCM_INVERSE",
  "DRAG_DROP",
  "FLASH_RECALL",
  "CONFIDENCE_BET",
  "OPPOSITE",
  "SPOT_THE_ERROR",
] as const;

type MixedType = (typeof MIXED_TYPES)[number];

let totalChallengesCount = 0;

const main = async () => {
  try {
    console.log("Seeding database...");

    // Clean all tables
    await db.delete(schema.challengeProgress);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challenges);
    await db.delete(schema.lessons);
    await db.delete(schema.units);
    await db.delete(schema.userProgress);
    await db.delete(schema.courses);
    await db.delete(schema.userSubscription);

    console.log("Cleaned existing data.");

    // Create single course
    const [course] = await db
      .insert(schema.courses)
      .values({
        title: "Vocabulaire du Coran",
        imageSrc: "/quran.svg",
      })
      .returning();

    console.log(`Created course: ${course.title} (id: ${course.id})`);

    let globalListId = 0;
    let totalLessons = 0;

    for (let unitIdx = 0; unitIdx < vocabularyData.length; unitIdx++) {
      const unitData = vocabularyData[unitIdx];

      const [unit] = await db
        .insert(schema.units)
        .values({
          courseId: course.id,
          title: unitData.title,
          description: unitData.description,
          order: unitIdx + 1,
        })
        .returning();

      console.log(`  Created unit: ${unit.title}`);

      let lessonOrderInUnit = 0;

      for (let listIdx = 0; listIdx < unitData.lists.length; listIdx++) {
        const list = unitData.lists[listIdx];
        globalListId++;
        const allWords = list.words;

        // ── Split words into chunks of 3-4 for the middle levels ──
        const CHUNK_SIZE = allWords.length <= 6 ? 3 : 4;
        const chunks: VocabWord[][] = [];
        for (let i = 0; i < allWords.length; i += CHUNK_SIZE) {
          chunks.push(allWords.slice(i, i + CHUNK_SIZE));
        }
        // If the last chunk has only 1 word, merge it into the previous one
        if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
          const last = chunks.pop()!;
          chunks[chunks.length - 1] = [...chunks[chunks.length - 1], ...last];
        }

        const totalLevels = 1 + chunks.length + 1; // flashcard + middle + review
        console.log(
          `    List "${list.title}" (${allWords.length} words) → ${totalLevels} levels ` +
            `(1 flashcard + ${chunks.length} practice + 1 review)`
        );

        // ── Level 1: FLASHCARD (all words, unchanged) ──
        lessonOrderInUnit++;
        totalLessons++;
        const [flashcardLesson] = await db
          .insert(schema.lessons)
          .values({
            unitId: unit.id,
            title: `${list.title} - Flashcards`,
            order: lessonOrderInUnit,
            listId: globalListId,
            listTitle: list.title,
            levelOrder: 1,
          })
          .returning();

        await seedFlashcard(flashcardLesson.id, allWords);

        // ── Middle levels: each chunk with MIXED exercise types ──
        for (let ci = 0; ci < chunks.length; ci++) {
          lessonOrderInUnit++;
          totalLessons++;
          const chunkWords = chunks[ci];
          const levelOrder = ci + 2; // starts at 2

          const [lesson] = await db
            .insert(schema.lessons)
            .values({
              unitId: unit.id,
              title: `${list.title} - Pratique ${ci + 1}`,
              order: lessonOrderInUnit,
              listId: globalListId,
              listTitle: list.title,
              levelOrder,
            })
            .returning();

          await seedMixedLevel(lesson.id, chunkWords, allWords);
        }

        // ── Last level: REVIEW with ALL words, mixed types ──
        lessonOrderInUnit++;
        totalLessons++;
        const [reviewLesson] = await db
          .insert(schema.lessons)
          .values({
            unitId: unit.id,
            title: `${list.title} - Révision`,
            order: lessonOrderInUnit,
            listId: globalListId,
            listTitle: list.title,
            levelOrder: 1 + chunks.length + 1,
          })
          .returning();

        await seedMixedLevel(reviewLesson.id, allWords, allWords);
      }
    }

    console.log("\nSeeding finished successfully!");
    console.log(`Total lists: ${globalListId}`);
    console.log(`Total lessons (levels): ${totalLessons}`);
    console.log(`Total challenges: ${totalChallengesCount}`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed the database");
  } finally {
    await pool.end();
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
   * Mixed level — generates challenges of varied exercise types for a
   * subset of words. Each word gets cycled through multiple exercise
   * types so the level never feels repetitive.
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
    // Each word gets 2 exercises max (different types). For large sets
    // (review levels with 10+ words) only 1 per word to keep it short.
    const typesPerWord = levelWords.length >= 10 ? 1 : 2;

    // Build a flat list of (word, exerciseType) pairs. Each pass
    // assigns a different shuffled type pool so a word never gets
    // the same exercise type twice.
    const plan: { word: VocabWord; type: MixedType }[] = [];
    const usedTypes = new Map<string, Set<MixedType>>();

    for (let pass = 0; pass < typesPerWord; pass++) {
      const typePool = shuffle([...MIXED_TYPES]);
      for (let wi = 0; wi < levelWords.length; wi++) {
        const word = levelWords[wi];
        const key = word.arabic;
        if (!usedTypes.has(key)) usedTypes.set(key, new Set());
        const used = usedTypes.get(key)!;

        // Pick a type this word hasn't seen yet
        let type = typePool[(wi + pass) % typePool.length];
        if (used.has(type)) {
          const alt = MIXED_TYPES.find((t) => !used.has(t));
          if (alt) type = alt;
        }
        used.add(type);
        plan.push({ word, type });
      }
    }

    // Spread so no two consecutive challenges share the same type
    // OR the same word.
    const spread = spreadByTypeAndWord(shuffle(plan));

    // Intersperse a MATCHING round after every ~8 challenges
    const MATCH_EVERY = 8;
    let order = 0;

    for (let i = 0; i < spread.length; i++) {
      const { word, type } = spread[i];
      order++;
      await seedSingleChallenge(lessonId, order, type, word, allWords);

      if ((i + 1) % MATCH_EVERY === 0) {
        const matchSubset = shuffle(levelWords).slice(
          0,
          Math.min(5, levelWords.length)
        );
        order++;
        await seedMatchingRound(lessonId, order, matchSubset);
      }
    }

    // Final matching with all level words
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
    const otherWords = allWords.filter((w) => w !== word);
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
    const distractorCount = Math.min(2, allWords.length - 1);
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
        question: "Envoyez le mot dans la bonne boîte",
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
    const oppositePairs: Record<string, string[]> = {
      // Demonstratives
      "Ceci (Masculin)": ["Cela / Celui-là (Masculin)"],
      "Cela / Celui-là (Masculin)": ["Ceci (Masculin)"],
      "Celle-ci (Féminin)": ["Celle-là (Féminin)"],
      "Celle-là (Féminin)": ["Celle-ci (Féminin)"],
      "Ceux-ci / Celles-ci (Pluriel)": ["Ceux-là / Celles-là (Pluriel)"],
      "Ceux-là / Celles-là (Pluriel)": ["Ceux-ci / Celles-ci (Pluriel)"],
      "Celui qui (Masculin)": ["Celle qui (Féminin)"],
      "Celle qui (Féminin)": ["Celui qui (Masculin)"],
      // Negations
      "Oui": ["Absolument pas"],
      "Absolument pas": ["Oui"],
      "Bien sûr / Si": ["Absolument pas"],
      // Interrogatives
      "Est-ce que": ["Oui"],
    };

    const candidates = oppositePairs[word.french];
    if (candidates) {
      for (const c of candidates) {
        const found = allWords.find((w) => w.french === c);
        if (found) return found;
      }
    }
    // Fallback: pick a random different word
    const others = allWords.filter((w) => w.arabic !== word.arabic);
    return others.length > 0 ? others[Math.floor(Math.random() * others.length)] : null;
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
    const otherWords = allWords.filter((w) => w.arabic !== errorWord.arabic);
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
};

main();
