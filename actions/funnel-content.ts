"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  FUNNEL_CONTENT_KEY,
  FUNNEL_DEFAULTS,
  type FunnelContent,
} from "@/lib/funnel-content";

const s = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

/**
 * Persists the admin-editable funnel copy as a JSON blob in app_setting.
 * Guarded by the admin session; coerces every field to keep the stored shape
 * valid even if the client sends something odd.
 */
export async function updateFunnelContent(input: FunnelContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const d = FUNNEL_DEFAULTS;
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
      arabicWord: s(input.exercise?.arabicWord, d.exercise.arabicWord),
      correct: s(input.exercise?.correct, d.exercise.correct),
      distractors: (Array.isArray(input.exercise?.distractors)
        ? input.exercise.distractors
        : []
      )
        .map((x) => s(x))
        .filter((x) => x.trim().length > 0)
        .slice(0, 4),
      successText: s(input.exercise?.successText, d.exercise.successText),
      retryText: s(input.exercise?.retryText, d.exercise.retryText),
      cta: s(input.exercise?.cta, d.exercise.cta),
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

  // Ensure the exercise always has at least one wrong option.
  if (clean.exercise.distractors.length === 0) {
    clean.exercise.distractors = d.exercise.distractors;
  }
  if (clean.question.options.length === 0) {
    clean.question.options = d.question.options;
  }

  try {
    await db
      .insert(appSetting)
      .values({
        key: FUNNEL_CONTENT_KEY,
        value: JSON.stringify(clean),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value: JSON.stringify(clean), updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[funnel] updateFunnelContent failed:", e);
    return { error: "Échec de l'enregistrement du contenu du tunnel." };
  }

  revalidatePath("/offre-a-vie");
  revalidatePath("/admin/premium");
  return { ok: true };
}
