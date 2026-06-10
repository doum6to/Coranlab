"use server";

import { sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { funnelLead } from "@/db/schema";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

/** Step of the funnel a lead has reached (each implies the previous ones). */
export type FunnelStage = "lead" | "exercise" | "offer" | "checkout";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Creates the funnel_lead table on the fly (idempotent) so capture self-heals. */
async function ensureFunnelLeadTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "funnel_lead" (
      "id" serial PRIMARY KEY,
      "email" text NOT NULL,
      "first_name" text,
      "locale" text,
      "focus_choice" text,
      "reached_exercise" boolean NOT NULL DEFAULT false,
      "reached_offer" boolean NOT NULL DEFAULT false,
      "started_checkout" boolean NOT NULL DEFAULT false,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    ALTER TABLE "funnel_lead" ADD COLUMN IF NOT EXISTS "focus_choice" text;
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "funnel_lead_email" ON "funnel_lead" ("email");
  `);
}

/**
 * Records (or updates) a lead captured by the "Funnel" landing variant before
 * any payment/account. Upserts by email and bumps the furthest-step flags so
 * the admin can measure drop-off and run abandoned-funnel follow-ups.
 *
 * Public + best-effort: never throws. Self-healing — if the funnel_lead table
 * doesn't exist yet, it creates it and retries once (no db:push needed).
 */
export async function captureFunnelLead(input: {
  email: string;
  firstName?: string;
  locale?: string;
  stage?: FunnelStage;
  /** The personalization answer the visitor picked (their "why"). */
  focusChoice?: string;
}): Promise<{ ok: boolean }> {
  const email = (input.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false };

  const firstName = (input.firstName || "").trim().slice(0, 80) || null;
  const locale: Locale = isLocale(input.locale) ? input.locale : DEFAULT_LOCALE;
  const stage = input.stage ?? "lead";
  const focusChoice = (input.focusChoice || "").trim().slice(0, 200) || null;

  const flags = {
    reachedExercise: stage === "exercise" || stage === "offer" || stage === "checkout",
    reachedOffer: stage === "offer" || stage === "checkout",
    startedCheckout: stage === "checkout",
  };

  const doUpsert = () =>
    db
      .insert(funnelLead)
      .values({
        email,
        firstName,
        locale,
        focusChoice,
        ...flags,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: funnelLead.email,
        set: {
          // Keep the first name if we already have one and a later call omits it.
          ...(firstName ? { firstName } : {}),
          ...(focusChoice ? { focusChoice } : {}),
          locale,
          // Flags are monotonic: once true, stay true (only set true values).
          ...(flags.reachedExercise ? { reachedExercise: true } : {}),
          ...(flags.reachedOffer ? { reachedOffer: true } : {}),
          ...(flags.startedCheckout ? { startedCheckout: true } : {}),
          updatedAt: new Date(),
        },
      });

  try {
    await doUpsert();
    return { ok: true };
  } catch (e) {
    // Most likely the table (or focus_choice column) doesn't exist yet — create
    // it once and retry so leads start recording without any manual setup.
    try {
      await ensureFunnelLeadTable();
      await doUpsert();
      return { ok: true };
    } catch (e2) {
      console.error("[funnel-lead] capture failed after self-heal:", e2);
      return { ok: false };
    }
  }
}
