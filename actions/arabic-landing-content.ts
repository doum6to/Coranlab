"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  ARABIC_LANDING_KEY,
  ARABIC_LANDING_DEFAULTS,
  type ArabicLandingContent,
} from "@/lib/arabic-landing-content";

/**
 * Persists the /lire-larabe landing content (JSON in app_setting) and
 * revalidates the page. Guarded by the admin session.
 */
export async function updateArabicLandingContent(content: ArabicLandingContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const d = ARABIC_LANDING_DEFAULTS;
  const clean: ArabicLandingContent = {
    hero: content.hero ?? d.hero,
    trust: content.trust ?? d.trust,
    testimonials: content.testimonials ?? d.testimonials,
    pricing: content.pricing ?? d.pricing,
    method: content.method ?? d.method,
    program: content.program ?? d.program,
    comparison: content.comparison ?? d.comparison,
    faq: content.faq ?? d.faq,
    sticky: content.sticky ?? d.sticky,
  };

  // Coerce prices to safe integers (cents).
  clean.pricing.priceCents = Math.max(
    0,
    Math.round(Number(clean.pricing.priceCents) || 0),
  );
  clean.pricing.compareAtCents = Math.max(
    0,
    Math.round(Number(clean.pricing.compareAtCents) || 0),
  );

  try {
    const value = JSON.stringify(clean);
    await db
      .insert(appSetting)
      .values({ key: ARABIC_LANDING_KEY, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value, updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[arabic-landing] update failed:", e);
    return {
      error:
        "Échec de l'enregistrement. La table app_setting existe-t-elle ? (ouvre /api/admin/db-setup?token=…)",
    };
  }

  revalidatePath("/lire-larabe");
  revalidatePath("/admin/premium");
  return { ok: true };
}
