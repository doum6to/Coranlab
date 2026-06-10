"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { OFFER_KEYS } from "@/lib/offer";
import {
  FUNNEL_CONTENT_KEY,
  FUNNEL_CONTENT_KEY_B,
  FUNNEL_DEFAULTS,
  type FunnelContent,
  type FunnelVersion,
} from "@/lib/funnel-content";

const s = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

/** Coerces an incoming content object into the valid stored shape. */
function sanitize(input: FunnelContent): FunnelContent {
  const d = FUNNEL_DEFAULTS;
  const items = (Array.isArray(input.exercise?.items) ? input.exercise.items : [])
    .map((it) => ({
      enabled: !!it?.enabled,
      arabicWord: s(it?.arabicWord),
      translit: s(it?.translit),
      correct: s(it?.correct),
      distractors: (Array.isArray(it?.distractors) ? it.distractors : [])
        .map((x) => s(x))
        .filter((x) => x.trim().length > 0)
        .slice(0, 4),
    }))
    .filter((it) => it.arabicWord.trim() && it.correct.trim())
    .slice(0, 8);

  const clean: FunnelContent = {
    capture: {
      title: s(input.capture?.title, d.capture.title),
      subtitle: s(input.capture?.subtitle, d.capture.subtitle),
      firstNameLabel: s(input.capture?.firstNameLabel, d.capture.firstNameLabel),
      firstNamePlaceholder: s(
        input.capture?.firstNamePlaceholder,
        d.capture.firstNamePlaceholder,
      ),
      emailLabel: s(input.capture?.emailLabel, d.capture.emailLabel),
      emailPlaceholder: s(input.capture?.emailPlaceholder, d.capture.emailPlaceholder),
      cta: s(input.capture?.cta, d.capture.cta),
      reassurance: s(input.capture?.reassurance, d.capture.reassurance),
    },
    intro: {
      greeting: s(input.intro?.greeting, d.intro.greeting),
      subtitle: s(input.intro?.subtitle, d.intro.subtitle),
      cta: s(input.intro?.cta, d.intro.cta),
    },
    question: {
      title: s(input.question?.title, d.question.title),
      options: (Array.isArray(input.question?.options) ? input.question.options : [])
        .map((o) => ({ label: s(o?.label), response: s(o?.response) }))
        .filter((o) => o.label.trim().length > 0)
        .slice(0, 6),
    },
    exercise: {
      prompt: s(input.exercise?.prompt, d.exercise.prompt),
      successText: s(input.exercise?.successText, d.exercise.successText),
      retryText: s(input.exercise?.retryText, d.exercise.retryText),
      cta: s(input.exercise?.cta, d.exercise.cta),
      items: items.length ? items : d.exercise.items,
    },
    offer: {
      kicker: s(input.offer?.kicker, d.offer.kicker),
      title: s(input.offer?.title, d.offer.title),
      subtitle: s(input.offer?.subtitle, d.offer.subtitle),
      priceSuffix: s(input.offer?.priceSuffix, d.offer.priceSuffix),
      features: (Array.isArray(input.offer?.features) ? input.offer.features : [])
        .map((x) => s(x))
        .filter((x) => x.trim().length > 0)
        .slice(0, 12),
      cta: s(input.offer?.cta, d.offer.cta),
      guarantee: s(input.offer?.guarantee, d.offer.guarantee),
    },
  };

  if (clean.question.options.length === 0) clean.question.options = d.question.options;
  // Guarantee at least one enabled exercise so the step is never empty.
  if (!clean.exercise.items.some((i) => i.enabled) && clean.exercise.items[0]) {
    clean.exercise.items[0].enabled = true;
  }
  return clean;
}

/**
 * Persists both funnel versions (A and B) and which one is live. Guarded by the
 * admin session; coerces every field to keep the stored shape valid.
 */
export async function updateFunnelContent(input: {
  a: FunnelContent;
  b: FunnelContent;
  activeVersion: FunnelVersion;
}) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const cleanA = sanitize(input.a);
  const cleanB = sanitize(input.b);
  const activeVersion = input.activeVersion === "b" ? "b" : "a";

  const entries: Array<[string, string]> = [
    [FUNNEL_CONTENT_KEY, JSON.stringify(cleanA)],
    [FUNNEL_CONTENT_KEY_B, JSON.stringify(cleanB)],
    [OFFER_KEYS.funnelVersion, activeVersion],
  ];

  try {
    for (const [key, value] of entries) {
      await db
        .insert(appSetting)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: appSetting.key,
          set: { value, updatedAt: new Date() },
        });
    }
  } catch (e: any) {
    console.error("[funnel] updateFunnelContent failed:", e);
    return { error: "Échec de l'enregistrement du contenu du tunnel." };
  }

  revalidatePath("/offre-a-vie");
  revalidatePath("/offre-a-vie-v4");
  revalidatePath("/admin/premium");
  return { ok: true };
}
