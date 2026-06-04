"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  LANDING_CONTENT_KEY,
  LANDING_DEFAULTS,
  type LandingContent,
} from "@/lib/landing-content";

/**
 * Persists the full landing content document (stored as JSON in app_setting)
 * and revalidates the landing page so the change shows at once. Guarded by
 * the admin session.
 */
export async function updateLandingContent(content: LandingContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  // Keep only the known top-level keys to avoid storing junk.
  const clean: LandingContent = {
    hero: content.hero ?? LANDING_DEFAULTS.hero,
    trust: content.trust ?? LANDING_DEFAULTS.trust,
    rows: content.rows ?? LANDING_DEFAULTS.rows,
    priceAnchor: content.priceAnchor ?? LANDING_DEFAULTS.priceAnchor,
    offer: content.offer ?? LANDING_DEFAULTS.offer,
    reviews: content.reviews ?? LANDING_DEFAULTS.reviews,
    faq: content.faq ?? LANDING_DEFAULTS.faq,
    finalCta: content.finalCta ?? LANDING_DEFAULTS.finalCta,
  };

  try {
    const value = JSON.stringify(clean);
    await db
      .insert(appSetting)
      .values({ key: LANDING_CONTENT_KEY, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value, updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[landing] updateLandingContent failed:", e);
    return {
      error:
        "Échec de l'enregistrement. La table app_setting existe-t-elle ? (ouvre /api/admin/db-setup?token=…)",
    };
  }

  revalidatePath("/offre-a-vie");
  revalidatePath("/admin/premium");
  return { ok: true };
}
