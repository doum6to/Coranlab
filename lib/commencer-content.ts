import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { COMMENCER_KEY, COMMENCER_DEFAULTS, mergeCommencerContent, type CommencerContent } from "@/lib/commencer-shared";

export * from "@/lib/commencer-shared";

/** Reads the /commencer content, falling back to defaults. Cached per request. */
export const getCommencerContent = cache(async (): Promise<CommencerContent> => {
  try {
    const row = await db.query.appSetting.findFirst({ where: eq(appSetting.key, COMMENCER_KEY) });
    if (!row?.value) return COMMENCER_DEFAULTS;
    return mergeCommencerContent(JSON.parse(row.value));
  } catch (e) {
    console.error("[commencer] read failed, using defaults:", e);
    return COMMENCER_DEFAULTS;
  }
});
