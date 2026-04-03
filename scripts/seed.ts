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

const LEVEL_TYPES = [
  "FLASHCARD",
  "QCM",
  "VRAI_FAUX",
  "MATCHING",
  "ANAGRAM",
  "QCM_INVERSE",
  "DRAG_DROP",
] as const;

const LEVEL_NAMES = [
  "Flashcards",
  "QCM",
  "Vrai ou Faux",
  "Correspondance",
  "Anagramme",
  "QCM Inversé",
  "Glisser-Déposer",
];

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
    const [course] = await db.insert(schema.courses).values({
      title: "Vocabulaire du Coran",
      imageSrc: "/quran.svg",
    }).returning();

    console.log(`Created course: ${course.title} (id: ${course.id})`);

    let globalListId = 0;
    let totalLessons = 0;

    for (let unitIdx = 0; unitIdx < vocabularyData.length; unitIdx++) {
      const unitData = vocabularyData[unitIdx];

      const [unit] = await db.insert(schema.units).values({
        courseId: course.id,
        title: unitData.title,
        description: unitData.description,
        order: unitIdx + 1,
      }).returning();

      console.log(`  Created unit: ${unit.title}`);

      let lessonOrderInUnit = 0;

      for (let listIdx = 0; listIdx < unitData.lists.length; listIdx++) {
        const list = unitData.lists[listIdx];
        globalListId++;
        const words = list.words;

        console.log(`    List "${list.title}" (${words.length} words) → 7 levels`);

        // Create 7 lessons (levels) for this list
        for (let levelIdx = 0; levelIdx < 7; levelIdx++) {
          lessonOrderInUnit++;
          totalLessons++;
          const levelType = LEVEL_TYPES[levelIdx];
          const levelName = LEVEL_NAMES[levelIdx];

          const [lesson] = await db.insert(schema.lessons).values({
            unitId: unit.id,
            title: `${list.title} - ${levelName}`,
            order: lessonOrderInUnit,
            listId: globalListId,
            listTitle: list.title,
            levelOrder: levelIdx + 1,
          }).returning();

          // Generate challenges for this level (single type)
          switch (levelType) {
            case "FLASHCARD":
              await seedFlashcard(lesson.id, words);
              break;
            case "QCM":
              await seedQCM(lesson.id, words);
              break;
            case "VRAI_FAUX":
              await seedVraiFaux(lesson.id, words);
              break;
            case "MATCHING":
              await seedMatching(lesson.id, words);
              break;
            case "ANAGRAM":
              await seedAnagram(lesson.id, words);
              break;
            case "QCM_INVERSE":
              await seedQCMInverse(lesson.id, words);
              break;
            case "DRAG_DROP":
              await seedDragDrop(lesson.id, words);
              break;
          }
        }
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

  // === LEVEL SEED FUNCTIONS ===
  // All distractors come ONLY from the same list's words

  async function seedFlashcard(lessonId: number, words: VocabWord[]) {
    // Split words into groups of 3-4, then add matching exercises after each group
    const groupSize = Math.min(4, words.length);
    const groups: VocabWord[][] = [];
    for (let i = 0; i < words.length; i += groupSize) {
      groups.push(words.slice(i, i + groupSize));
    }

    let order = 0;

    for (const group of groups) {
      // Flashcard discovery for this group
      order++;
      totalChallengesCount++;
      const [challenge] = await db.insert(schema.challenges).values({
        lessonId,
        type: "FLASHCARD",
        question: "Découvrez les mots",
        order,
      }).returning();

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

      // Add a matching exercise after each group to reinforce
      if (group.length >= 2) {
        order++;
        totalChallengesCount++;
        const [matchChallenge] = await db.insert(schema.challenges).values({
          lessonId,
          type: "MATCHING",
          question: "Reliez chaque mot arabe à sa traduction",
          order,
        }).returning();

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

    // Final comprehensive matching with all words
    order++;
    totalChallengesCount++;
    const [finalMatch] = await db.insert(schema.challenges).values({
      lessonId,
      type: "MATCHING",
      question: "Reliez chaque mot arabe à sa traduction",
      order,
    }).returning();

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

  async function seedQCM(lessonId: number, words: VocabWord[]) {
    const targetCount = 18;
    for (let i = 0; i < targetCount; i++) {
      totalChallengesCount++;
      const word = words[i % words.length];
      const distractorCount = Math.min(3, words.length - 1);
      const wrongWords = pickRandom(words, distractorCount, [word]).map((w) => w.french);
      const options = shuffle([
        { text: word.french, correct: true, frenchText: word.french },
        ...wrongWords.map((w) => ({ text: w, correct: false, frenchText: w })),
      ]);

      const [challenge] = await db.insert(schema.challenges).values({
        lessonId,
        type: "QCM",
        question: "Quelle est la traduction de ce mot ?",
        order: i + 1,
        arabicWord: word.arabic,
      }).returning();

      await db.insert(schema.challengeOptions).values(
        options.map((opt) => ({
          challengeId: challenge.id,
          text: opt.text,
          correct: opt.correct,
          frenchText: opt.frenchText,
        }))
      );
    }
  }

  async function seedVraiFaux(lessonId: number, words: VocabWord[]) {
    const targetCount = 16;
    for (let i = 0; i < targetCount; i++) {
      totalChallengesCount++;
      const word = words[i % words.length];
      // Alternate: even iterations show correct, odd show incorrect
      const isCorrect = i % 2 === 0;
      const otherWords = words.filter((w) => w !== word);
      const proposedTranslation = isCorrect
        ? word.french
        : otherWords.length > 0
          ? otherWords[Math.floor(Math.random() * otherWords.length)].french
          : word.french;

      const [challenge] = await db.insert(schema.challenges).values({
        lessonId,
        type: "VRAI_FAUX",
        question: "Cette traduction est-elle correcte ?",
        order: i + 1,
        arabicWord: word.arabic,
        frenchTranslation: proposedTranslation,
      }).returning();

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
  }

  async function seedMatching(lessonId: number, words: VocabWord[]) {
    // Create multiple matching rounds with different word subsets
    const pairSize = Math.min(5, words.length);
    const targetRounds = 15;

    for (let round = 0; round < targetRounds; round++) {
      totalChallengesCount++;
      // Shuffle and pick different subsets each round
      const roundWords = shuffle(words).slice(0, pairSize);

      const [challenge] = await db.insert(schema.challenges).values({
        lessonId,
        type: "MATCHING",
        question: "Reliez chaque mot arabe à sa traduction",
        order: round + 1,
      }).returning();

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
  }

  async function seedAnagram(lessonId: number, words: VocabWord[]) {
    const targetCount = 16;
    for (let i = 0; i < targetCount; i++) {
      totalChallengesCount++;
      const word = words[i % words.length];
      const letters = splitArabicLetters(word.arabic);

      const [challenge] = await db.insert(schema.challenges).values({
        lessonId,
        type: "ANAGRAM",
        question: "Reconstituez le mot arabe",
        order: i + 1,
        arabicWord: word.arabic,
        frenchTranslation: word.french,
      }).returning();

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
  }

  async function seedQCMInverse(lessonId: number, words: VocabWord[]) {
    const targetCount = 18;
    for (let i = 0; i < targetCount; i++) {
      totalChallengesCount++;
      const word = words[i % words.length];
      const distractorCount = Math.min(3, words.length - 1);
      const wrongWords = pickRandom(words, distractorCount, [word]).map((w) => w.arabic);
      const options = shuffle([
        { text: word.arabic, correct: true, arabicText: word.arabic },
        ...wrongWords.map((w) => ({ text: w, correct: false, arabicText: w })),
      ]);

      const [challenge] = await db.insert(schema.challenges).values({
        lessonId,
        type: "QCM_INVERSE",
        question: "Trouvez le mot arabe correspondant",
        order: i + 1,
        frenchTranslation: word.french,
      }).returning();

      await db.insert(schema.challengeOptions).values(
        options.map((opt) => ({
          challengeId: challenge.id,
          text: opt.text,
          correct: opt.correct,
          arabicText: opt.arabicText,
        }))
      );
    }
  }

  async function seedDragDrop(lessonId: number, words: VocabWord[]) {
    const targetCount = 16;
    for (let i = 0; i < targetCount; i++) {
      totalChallengesCount++;
      const word = words[i % words.length];
      const distractorCount = Math.min(2, words.length - 1);
      const wrongWords = pickRandom(words, distractorCount, [word]).map((w) => w.french);
      const options = shuffle([
        { text: word.french, correct: true, frenchText: word.french },
        ...wrongWords.map((w) => ({ text: w, correct: false, frenchText: w })),
      ]);

      const [challenge] = await db.insert(schema.challenges).values({
        lessonId,
        type: "DRAG_DROP",
        question: "Envoyez le mot dans la bonne boîte",
        order: i + 1,
        arabicWord: word.arabic,
      }).returning();

      await db.insert(schema.challengeOptions).values(
        options.map((opt) => ({
          challengeId: challenge.id,
          text: opt.text,
          correct: opt.correct,
          frenchText: opt.frenchText,
        }))
      );
    }
  }
};

main();
