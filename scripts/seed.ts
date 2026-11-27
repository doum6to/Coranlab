import { config } from "dotenv";
config({ path: ".env.local" });
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema";
import { createCourseSeeder } from "../lib/course-seeder";
import { vocabularyData } from "./vocabulary-data";

/**
 * Rebuilds the whole course FROM SCRATCH: it deletes every course table, the learners'
 * progress included. For a development database only. To add lists to a course already in
 * use, see lib/course-additions.ts (admin page, "Contenu du cours").
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema });

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

    const [course] = await db
      .insert(schema.courses)
      .values({ title: "Vocabulaire du Coran", imageSrc: "/quran.svg" })
      .returning();

    console.log(`Created course: ${course.title} (id: ${course.id})`);

    const seeder = createCourseSeeder(db);
    let globalListId = 0;
    let totalLessons = 0;

    for (let unitIdx = 0; unitIdx < vocabularyData.length; unitIdx++) {
      const unitData = vocabularyData[unitIdx];
      const [unit] = await db
        .insert(schema.units)
        .values({ courseId: course.id, title: unitData.title, description: unitData.description, order: unitIdx + 1 })
        .returning();
      console.log(`  Created unit: ${unit.title}`);

      let lessonOrderInUnit = 0;
      for (const list of unitData.lists) {
        globalListId++;
        const created = await seeder.seedList({ unitId: unit.id, listId: globalListId, title: list.title, words: list.words, firstOrder: lessonOrderInUnit });
        console.log(`    List "${list.title}" (${list.words.length} words) → ${created} levels`);
        lessonOrderInUnit += created;
        totalLessons += created;
      }
    }

    console.log("\nSeeding finished successfully!");
    console.log(`Total lists: ${globalListId}`);
    console.log(`Total lessons (levels): ${totalLessons}`);
    console.log(`Total challenges: ${seeder.challengeCount()}`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed the database");
  } finally {
    await pool.end();
  }
};

main();
