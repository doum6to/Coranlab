"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  DOWNLOAD_LINKS_KEY,
  DOWNLOAD_LINKS_DEFAULTS,
  type DownloadLinks,
} from "@/lib/download-links";

/** Accepts only http(s) URLs, or a site-relative path for the fallback. */
function cleanUrl(v: unknown, { allowRelative = false } = {}): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "";
  if (allowRelative && s.startsWith("/")) return s.slice(0, 500);
  return /^https?:\/\//i.test(s) ? s.slice(0, 500) : "";
}

/** Persists the download links (admin-guarded). */
export async function updateDownloadLinks(input: DownloadLinks) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const clean: DownloadLinks = {
    appStoreUrl: cleanUrl(input.appStoreUrl),
    playStoreUrl: cleanUrl(input.playStoreUrl),
    fallbackUrl: cleanUrl(input.fallbackUrl, { allowRelative: true }) || DOWNLOAD_LINKS_DEFAULTS.fallbackUrl,
  };

  try {
    await db
      .insert(appSetting)
      .values({ key: DOWNLOAD_LINKS_KEY, value: JSON.stringify(clean), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value: JSON.stringify(clean), updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[download-links] update failed:", e);
    return { error: "Échec de l'enregistrement." };
  }

  revalidatePath("/telecharger");
  revalidatePath("/admin/premium");
  return { ok: true };
}
