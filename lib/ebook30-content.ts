import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import {
  EBOOK30_KEY,
  EBOOK30_DEFAULTS,
  mergeEbook30Content,
  type Ebook30Content,
} from "@/lib/ebook30-shared";

export * from "@/lib/ebook30-shared";

/** Reads the /coran-30-jours content, falling back to defaults. Cached. */
export const getEbook30Content = cache(async (): Promise<Ebook30Content> => {
  try {
    const row = await db.query.appSetting.findFirst({
      where: eq(appSetting.key, EBOOK30_KEY),
    });
    if (!row?.value) return EBOOK30_DEFAULTS;
    return mergeEbook30Content(JSON.parse(row.value));
  } catch (e) {
    console.error("[ebook30] read failed, using defaults:", e);
    return EBOOK30_DEFAULTS;
  }
});
