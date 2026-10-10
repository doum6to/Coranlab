import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { PACK_KEY, PACK_DEFAULTS, mergePackContent, type PackContent } from "@/lib/pack-shared";

export * from "@/lib/pack-shared";

/** Reads the /pack-coran content, falling back to defaults. Cached per request. */
export const getPackContent = cache(async (): Promise<PackContent> => {
  try {
    const row = await db.query.appSetting.findFirst({ where: eq(appSetting.key, PACK_KEY) });
    if (!row?.value) return PACK_DEFAULTS;
    return mergePackContent(JSON.parse(row.value));
  } catch (e) {
    console.error("[pack] read failed, using defaults:", e);
    return PACK_DEFAULTS;
  }
});
