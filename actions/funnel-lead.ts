"use server";

import db from "@/db/drizzle";
import { funnelLead } from "@/db/schema";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

/** Step of the funnel a lead has reached (each implies the previous ones). */
export type FunnelStage = "lead" | "exercise" | "offer" | "checkout";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Records (or updates) a lead captured by the "Funnel" landing variant before
 * any payment/account. Upserts by email and bumps the furthest-step flags so
 * the admin can measure drop-off and run abandoned-funnel follow-ups.
 *
 * Public + best-effort: never throws, and silently no-ops if the funnel_lead
 * table hasn't been created yet (so the funnel keeps working before db:push).
 */
export async function captureFunnelLead(input: {
  email: string;
  firstName?: string;
  locale?: string;
  stage?: FunnelStage;
}): Promise<{ ok: boolean }> {
  const email = (input.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false };

  const firstName = (input.firstName || "").trim().slice(0, 80) || null;
  const locale: Locale = isLocale(input.locale) ? input.locale : DEFAULT_LOCALE;
  const stage = input.stage ?? "lead";

  const flags = {
    reachedExercise: stage === "exercise" || stage === "offer" || stage === "checkout",
    reachedOffer: stage === "offer" || stage === "checkout",
    startedCheckout: stage === "checkout",
  };

  try {
    await db
      .insert(funnelLead)
      .values({
        email,
        firstName,
        locale,
        ...flags,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: funnelLead.email,
        set: {
          // Keep the first name if we already have one and a later call omits it.
          ...(firstName ? { firstName } : {}),
          locale,
          // Flags are monotonic: once true, stay true (use OR via SQL coalesce
          // by only setting true values).
          ...(flags.reachedExercise ? { reachedExercise: true } : {}),
          ...(flags.reachedOffer ? { reachedOffer: true } : {}),
          ...(flags.startedCheckout ? { startedCheckout: true } : {}),
          updatedAt: new Date(),
        },
      });
    return { ok: true };
  } catch (e) {
    console.error("[funnel-lead] capture failed (table missing?):", e);
    return { ok: false };
  }
}
