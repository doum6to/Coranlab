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
    // Pick how many exercises per word — more types for fewer words so
    // the level doesn't feel too short.
    const typesPerWord = levelWords.length <= 4 ? 4 : 3;

    // Build a flat list of (word, exerciseType) pairs, cycling through
    // exercise types so consecutive challenges differ in type.
    const plan: { word: VocabWord; type: MixedType }[] = [];

    for (let pass = 0; pass < typesPerWord; pass++) {
      const typePool = shuffle([...MIXED_TYPES]);
      for (let wi = 0; wi < levelWords.length; wi++) {
        plan.push({
          word: levelWords[wi],
          type: typePool[(wi + pass) % typePool.length],
        });
      }
    }

    // Shuffle so that same-word challenges are spread out, but ensure
    // no two consecutive challenges share the same type.
    const shuffled = spreadByType(shuffle(plan));

    // Intersperse a MATCHING round after every ~6 challenges
    const MATCH_EVERY = 6;
    let order = 0;

    for (let i = 0; i < shuffled.length; i++) {
      const { word, type } = shuffled[i];
      order++;
      await seedSingleChallenge(lessonId, order, type, word, allWords);

      // Insert a matching round periodically
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

  /** Spread challenges so no two consecutive ones share the same type. */
  function spreadByType(
    items: { word: VocabWord; type: MixedType }[]
  ): { word: VocabWord; type: MixedType }[] {
    const result: { word: VocabWord; type: MixedType }[] = [];
    const remaining = [...items];

    while (remaining.length > 0) {
      const lastType = result.length > 0 ? result[result.length - 1].type : null;
      const idx = remaining.findIndex((item) => item.type !== lastType);
      if (idx >= 0) {
        result.push(remaining.splice(idx, 1)[0]);
      } else {
        // No choice, just take the first one
        result.push(remaining.shift()!);
      }
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
