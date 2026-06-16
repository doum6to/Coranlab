"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  CORAN_LANDING_KEY,
  CORAN_LANDING_DEFAULTS,
  type CoranLandingContent,
  type CoranBlock,
} from "@/lib/coran-landing-content";

const s = (v: unknown, fb = "") => (typeof v === "string" ? v : fb);

function sanitize(input: CoranLandingContent): CoranLandingContent {
  const d = CORAN_LANDING_DEFAULTS;

  const blocks: CoranBlock[] = (Array.isArray(input.body) ? input.body : [])
    .map((b): CoranBlock | null => {
      if (b?.type === "image") {
        const url = s((b as any).url).trim();
        return url ? { type: "image", url } : null;
      }
      if (b?.type === "text") {
        const text = s((b as any).text);
        return text.trim() ? { type: "text", text } : null;
      }
      return null;
    })
    .filter((b): b is CoranBlock => b !== null)
    .slice(0, 60);

  const cur = (["EUR", "USD", "GBP"] as const).includes(input.price?.currency as any)
    ? input.price.currency
    : d.price.currency;
  const toCents = (n: unknown, fb: number) =>
    typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.round(n) : fb;

  return {
    banners: (Array.isArray(input.banners) ? input.banners : [])
      .map((x) => s(x).trim())
      .filter((x) => x.length > 0)
      .slice(0, 8),
    title: s(input.title, d.title),
    subtitle: s(input.subtitle, d.subtitle),
    price: {
      currency: cur,
      amountCents: toCents(input.price?.amountCents, d.price.amountCents),
      compareAtCents: toCents(input.price?.compareAtCents, d.price.compareAtCents),
    },
    showPrice: input.showPrice !== false,
    body: blocks,
    reviewsHeading: s(input.reviewsHeading, d.reviewsHeading),
    reviews: (Array.isArray(input.reviews) ? input.reviews : [])
      .map((r) => ({ name: s(r?.name).trim(), text: s(r?.text).trim() }))
      .filter((r) => r.text.length > 0)
      .slice(0, 30),
    ctaLabel: s(input.ctaLabel, d.ctaLabel),
    guarantee: s(input.guarantee, d.guarantee),
  };
}

/** Persists the /coran content (admin-guarded). */
export async function updateCoranLandingContent(input: CoranLandingContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const clean = sanitize(input);
  try {
    await db
      .insert(appSetting)
      .values({ key: CORAN_LANDING_KEY, value: JSON.stringify(clean), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value: JSON.stringify(clean), updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[coran-landing] update failed:", e);
    return { error: "Échec de l'enregistrement." };
  }

  revalidatePath("/coran");
  revalidatePath("/admin/premium");
  return { ok: true };
}
