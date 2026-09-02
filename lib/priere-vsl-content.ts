import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import {
  PRIERE_VSL_KEY,
  PRIERE_VSL_DEFAULTS,
  mergePriereVslContent,
  type PriereVslContent,
} from "@/lib/priere-vsl-shared";

// Re-export the client-safe API so server imports can use one path.
export * from "@/lib/priere-vsl-shared";

/** Reads the /comprendre-sa-priere content, falling back to defaults. Cached. */
export const getPriereVslContent = cache(async (): Promise<PriereVslContent> => {
  try {
    const row = await db.query.appSetting.findFirst({
      where: eq(appSetting.key, PRIERE_VSL_KEY),
    });
    if (!row?.value) return PRIERE_VSL_DEFAULTS;
    return mergePriereVslContent(JSON.parse(row.value));
  } catch (e) {
    console.error("[priere-vsl] read failed, using defaults:", e);
    return PRIERE_VSL_DEFAULTS;
  }
});
