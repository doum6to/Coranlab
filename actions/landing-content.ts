"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  contentKey,
  localeBase,
  type LandingContent,
  type LandingVariantKey,
} from "@/lib/landing-content";
import { DEFAULT_LOCALE, isLocale, offerPath, type Locale } from "@/lib/i18n/locales";

/**
 * Persists the full landing content document for a locale + variant (stored as
 * JSON in app_setting under a per-locale/per-variant key) and revalidates that
 * page so the change shows at once. Guarded by the admin session.
 */
export async function updateLandingContent(
  content: LandingContent,
  locale: Locale = DEFAULT_LOCALE,
  variant: LandingVariantKey = "v3",
) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  if (!isLocale(locale)) locale = DEFAULT_LOCALE;
  if (variant !== "v4") variant = "v3";

  const base = localeBase(locale);

  // Keep only the known top-level keys to avoid storing junk; missing fields
  // fall back to the locale's base (defaults + built-in translations).
  const clean: LandingContent = {
    hero: content.hero ?? base.hero,
    trust: content.trust ?? base.trust,
    rows: content.rows ?? base.rows,
    valueStack: content.valueStack ?? base.valueStack,
    priceAnchor: content.priceAnchor ?? base.priceAnchor,
    offer: content.offer ?? base.offer,
    reviews: content.reviews ?? base.reviews,
    faq: content.faq ?? base.faq,
    finalCta: content.finalCta ?? base.finalCta,
    story: content.story ?? base.story,
    letter: content.letter ?? base.letter,
    product: content.product ?? base.product,
    hidden: Array.isArray(content.hidden) ? content.hidden : base.hidden,
  };

  try {
    const value = JSON.stringify(clean);
    const key = contentKey(locale, variant);
    await db
      .insert(appSetting)
      .values({ key, value, updatedAt: new Date() })
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

  const path = offerPath(locale);
  revalidatePath(variant === "v4" ? `${path}-v4` : path);
  revalidatePath("/admin/premium");
  return { ok: true };
}
