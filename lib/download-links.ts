import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

/**
 * Admin-editable destinations for the smart download link (/telecharger).
 * TikTok never sees a raw store link — it only ever sees quranlab.app/telecharger,
 * which redirects here per device. Empty store URL → falls back to `fallbackUrl`.
 */
export type DownloadLinks = {
  appStoreUrl: string;
  playStoreUrl: string;
  /** Where desktop visitors (and unset stores) land. Relative or absolute. */
  fallbackUrl: string;
};

export const DOWNLOAD_LINKS_KEY = "download_links";

export const DOWNLOAD_LINKS_DEFAULTS: DownloadLinks = {
  appStoreUrl: "",
  playStoreUrl: "",
  fallbackUrl: "/comprendre-sa-priere",
};

function merge(stored: Partial<DownloadLinks> | null): DownloadLinks {
  const d = DOWNLOAD_LINKS_DEFAULTS;
  if (!stored) return d;
  const s = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
  return {
    appStoreUrl: s(stored.appStoreUrl, d.appStoreUrl),
    playStoreUrl: s(stored.playStoreUrl, d.playStoreUrl),
    fallbackUrl: s(stored.fallbackUrl, d.fallbackUrl) || d.fallbackUrl,
  };
}

/** Reads the download links, falling back to defaults. Cached per request. */
export const getDownloadLinks = cache(async (): Promise<DownloadLinks> => {
  try {
    const row = await db.query.appSetting.findFirst({
      where: eq(appSetting.key, DOWNLOAD_LINKS_KEY),
    });
    if (!row?.value) return DOWNLOAD_LINKS_DEFAULTS;
    return merge(JSON.parse(row.value));
  } catch (e) {
    console.error("[download-links] read failed, using defaults:", e);
    return DOWNLOAD_LINKS_DEFAULTS;
  }
});
