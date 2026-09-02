import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import {
  CORAN_LANDING_KEY,
  CORAN_LANDING_DEFAULTS,
  mergeCoranLandingContent,
  type CoranLandingContent,
} from "@/lib/coran-landing-shared";

// Re-export the client-safe API so existing `@/lib/coran-landing-content`
// imports (types, constants, formatters, merge) keep working unchanged.
export * from "@/lib/coran-landing-shared";

/** Reads the /coran content, falling back to defaults. Cached per request. */
export const getCoranLandingContent = cache(
  async (): Promise<CoranLandingContent> => {
    try {
      const row = await db.query.appSetting.findFirst({
        where: eq(appSetting.key, CORAN_LANDING_KEY),
      });
      if (!row?.value) return CORAN_LANDING_DEFAULTS;
      return mergeCoranLandingContent(JSON.parse(row.value));
    } catch (e) {
      console.error("[coran-landing] read failed, using defaults:", e);
      return CORAN_LANDING_DEFAULTS;
    }
  },
);
