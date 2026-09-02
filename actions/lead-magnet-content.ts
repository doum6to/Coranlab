"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  LEAD_MAGNET_KEY,
  LEAD_MAGNET_DEFAULTS,
  type LeadMagnetContent,
} from "@/lib/lead-magnet-content";

const s = (v: unknown, fb = "") => (typeof v === "string" ? v : fb);

function sanitize(input: LeadMagnetContent): LeadMagnetContent {
  const d = LEAD_MAGNET_DEFAULTS;
  return {
    captureHeading: s(input.captureHeading, d.captureHeading).slice(0, 160),
    captureSubtext: s(input.captureSubtext, d.captureSubtext).slice(0, 300),
    captureButton: s(input.captureButton, d.captureButton).slice(0, 80),
    emailSubject: s(input.emailSubject, d.emailSubject).slice(0, 160),
    emailHeading: s(input.emailHeading, d.emailHeading).slice(0, 160),
    emailIntro: s(input.emailIntro, d.emailIntro).slice(0, 2000),
    words: (Array.isArray(input.words) ? input.words : [])
      .map((w) => ({
        arabic: s(w?.arabic).trim().slice(0, 60),
        translit: s(w?.translit).trim().slice(0, 60),
        fr: s(w?.fr).trim().slice(0, 120),
      }))
      .filter((w) => w.arabic || w.translit || w.fr)
      .slice(0, 60),
    ctaLabel: s(input.ctaLabel, d.ctaLabel).slice(0, 120),
    ctaUrl: s(input.ctaUrl, d.ctaUrl).trim().slice(0, 300) || d.ctaUrl,
    nurture: (Array.isArray(input.nurture) ? input.nurture : [])
      .map((n) => ({
        delayDays:
          typeof n?.delayDays === "number" && Number.isFinite(n.delayDays) && n.delayDays >= 0
            ? Math.min(Math.round(n.delayDays), 60)
            : 2,
        subject: s(n?.subject).slice(0, 200),
        bodyHtml: s(n?.bodyHtml).slice(0, 4000),
      }))
      .filter((n) => n.subject.trim() && n.bodyHtml.trim())
      .slice(0, 12),
  };
}

/** Persists the lead-magnet content (admin-guarded). */
export async function updateLeadMagnetContent(input: LeadMagnetContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const clean = sanitize(input);
  try {
    await db
      .insert(appSetting)
      .values({ key: LEAD_MAGNET_KEY, value: JSON.stringify(clean), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value: JSON.stringify(clean), updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[lead-magnet] update failed:", e);
    return { error: "Échec de l'enregistrement." };
  }

  revalidatePath("/comprendre-sa-priere");
  revalidatePath("/coran");
  revalidatePath("/admin/premium");
  return { ok: true };
}
