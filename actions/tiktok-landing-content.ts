"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  TIKTOK_LANDING_KEY,
  TIKTOK_LANDING_DEFAULTS,
  type TikTokLandingContent,
} from "@/lib/tiktok-landing-content";

const s = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

/** Coerces an incoming content object into the valid stored shape. */
function sanitize(input: TikTokLandingContent): TikTokLandingContent {
  const d = TIKTOK_LANDING_DEFAULTS;
  const list = (arr: unknown, max: number): string[] =>
    (Array.isArray(arr) ? arr : [])
      .map((x) => s(x))
      .filter((x) => x.trim().length > 0)
      .slice(0, max);

  const clean: TikTokLandingContent = {
    hero: {
      eyebrow: s(input.hero?.eyebrow, d.hero.eyebrow),
      title: s(input.hero?.title, d.hero.title),
      titleHighlight: s(input.hero?.titleHighlight, d.hero.titleHighlight),
      subtitle: s(input.hero?.subtitle, d.hero.subtitle),
      cta: s(input.hero?.cta, d.hero.cta),
      ctaSub: s(input.hero?.ctaSub, d.hero.ctaSub),
      image: s(input.hero?.image),
      videoUrl: s(input.hero?.videoUrl),
      showPrice: input.hero?.showPrice !== false,
      socialProof: s(input.hero?.socialProof, d.hero.socialProof),
    },
    story: {
      heading: s(input.story?.heading, d.story.heading),
      bubbles: (Array.isArray(input.story?.bubbles) ? input.story.bubbles : [])
        .map((b) => ({
          side: b?.side === "right" ? ("right" as const) : ("left" as const),
          text: s(b?.text),
        }))
        .filter((b) => b.text.trim().length > 0)
        .slice(0, 12),
    },
    method: {
      heading: s(input.method?.heading, d.method.heading),
      cards: (Array.isArray(input.method?.cards) ? input.method.cards : [])
        .map((c) => ({ title: s(c?.title), text: s(c?.text) }))
        .filter((c) => c.title.trim().length > 0)
        .slice(0, 6),
    },
    book: {
      heading: s(input.book?.heading, d.book.heading),
      text: s(input.book?.text, d.book.text),
      image: s(input.book?.image),
      bullets: list(input.book?.bullets, 8),
      excerptsHeading: s(input.book?.excerptsHeading, d.book.excerptsHeading),
      excerpts: list(input.book?.excerpts, 8),
      bonusHeading: s(input.book?.bonusHeading, d.book.bonusHeading),
      bonuses: list(input.book?.bonuses, 8),
    },
    offerCard: {
      eyebrow: s(input.offerCard?.eyebrow, d.offerCard.eyebrow),
      priceSuffix: s(input.offerCard?.priceSuffix, d.offerCard.priceSuffix),
      features: list(input.offerCard?.features, 10),
      cta: s(input.offerCard?.cta, d.offerCard.cta),
      ctaSub: s(input.offerCard?.ctaSub, d.offerCard.ctaSub),
      guarantee: s(input.offerCard?.guarantee, d.offerCard.guarantee),
      testimonials: (Array.isArray(input.offerCard?.testimonials)
        ? input.offerCard.testimonials
        : []
      )
        .map((t) => ({ text: s(t?.text), name: s(t?.name) }))
        .filter((t) => t.text.trim().length > 0)
        .slice(0, 6),
    },
    faq: {
      heading: s(input.faq?.heading, d.faq.heading),
      items: (Array.isArray(input.faq?.items) ? input.faq.items : [])
        .map((it) => ({ q: s(it?.q), a: s(it?.a) }))
        .filter((it) => it.q.trim().length > 0)
        .slice(0, 10),
    },
    finalCta: {
      title: s(input.finalCta?.title, d.finalCta.title),
      subtitle: s(input.finalCta?.subtitle, d.finalCta.subtitle),
      cta: s(input.finalCta?.cta, d.finalCta.cta),
    },
  };

  // Never store fully-empty lists for the sections the page depends on.
  if (clean.story.bubbles.length === 0) clean.story.bubbles = d.story.bubbles;
  if (clean.method.cards.length === 0) clean.method.cards = d.method.cards;
  if (clean.book.bullets.length === 0) clean.book.bullets = d.book.bullets;
  if (clean.offerCard.features.length === 0)
    clean.offerCard.features = d.offerCard.features;
  if (clean.faq.items.length === 0) clean.faq.items = d.faq.items;

  return clean;
}

/** Persists the TikTok landing copy (admin-guarded). */
export async function updateTikTokLandingContent(input: TikTokLandingContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const clean = sanitize(input);

  try {
    await db
      .insert(appSetting)
      .values({
        key: TIKTOK_LANDING_KEY,
        value: JSON.stringify(clean),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value: JSON.stringify(clean), updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[tiktok-landing] update failed:", e);
    return { error: "Échec de l'enregistrement du contenu." };
  }

  revalidatePath("/comprendre-le-coran");
  revalidatePath("/admin/premium");
  return { ok: true };
}
