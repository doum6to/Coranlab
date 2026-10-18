import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { BOOKS_KEY, BOOKS_DEFAULTS, mergeBooksContent, type BooksContent } from "@/lib/books-shared";

export * from "@/lib/books-shared";

/** Reads the Boutique catalogue, falling back to defaults. Cached per request. */
export const getBooksContent = cache(async (): Promise<BooksContent> => {
  try {
    const row = await db.query.appSetting.findFirst({ where: eq(appSetting.key, BOOKS_KEY) });
    if (!row?.value) return BOOKS_DEFAULTS;
    return mergeBooksContent(JSON.parse(row.value));
  } catch (e) {
    console.error("[books] read failed, using defaults:", e);
    return BOOKS_DEFAULTS;
  }
});
