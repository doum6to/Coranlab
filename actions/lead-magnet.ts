"use server";

import { sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { funnelLead, analyticsEvent } from "@/db/schema";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { getLeadMagnetContent } from "@/lib/lead-magnet-content";
import { sendLeadMagnetEmail } from "@/lib/email/send-lead-emails";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 86_400_000;

/**
 * Ensures funnel_lead exists AND carries the nurture columns. Idempotent and
 * self-healing so lead capture + the drip cron work without a manual db:push.
 */
export async function ensureLeadTable() {
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
  await db.execute(sql`ALTER TABLE "funnel_lead" ADD COLUMN IF NOT EXISTS "source" text;`);
  await db.execute(
    sql`ALTER TABLE "funnel_lead" ADD COLUMN IF NOT EXISTS "nurture_step" integer NOT NULL DEFAULT 0;`,
  );
  await db.execute(
    sql`ALTER TABLE "funnel_lead" ADD COLUMN IF NOT EXISTS "nurture_next_at" timestamp;`,
  );
  await db.execute(
    sql`ALTER TABLE "funnel_lead" ADD COLUMN IF NOT EXISTS "lead_magnet_sent_at" timestamp;`,
  );
  await db.execute(
    sql`ALTER TABLE "funnel_lead" ADD COLUMN IF NOT EXISTS "unsubscribed" boolean NOT NULL DEFAULT false;`,
  );
  await db.execute(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS "funnel_lead_email" ON "funnel_lead" ("email");`,
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "funnel_lead_nurture_next" ON "funnel_lead" ("nurture_next_at");`,
  );
}

/**
 * Public: a visitor submits their email to get the free "20 words" lead magnet.
 * Sends the magnet email immediately and schedules the first nurture email.
 * Best-effort and never throws (a DB/email hiccup must not break the widget).
 */
export async function subscribeLeadMagnet(input: {
  email: string;
  firstName?: string;
  locale?: string;
  source?: string;
}): Promise<{ ok: boolean }> {
  const email = (input.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false };

  const firstName = (input.firstName || "").trim().slice(0, 80) || null;
  const locale: Locale = isLocale(input.locale) ? input.locale : DEFAULT_LOCALE;
  const source = (input.source || "lead-magnet").trim().slice(0, 60);

  const content = await getLeadMagnetContent();
  const firstDelay = content.nurture[0]?.delayDays ?? 2;
  const now = new Date();
  const nurtureNextAt = new Date(now.getTime() + firstDelay * DAY_MS);

  const doUpsert = () =>
    db
      .insert(funnelLead)
      .values({
        email,
        firstName,
        locale,
        source,
        reachedOffer: true,
        nurtureStep: 0,
        nurtureNextAt,
        leadMagnetSentAt: now,
        unsubscribed: false,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: funnelLead.email,
        set: {
          ...(firstName ? { firstName } : {}),
          locale,
          source,
          // Re-arm the sequence from the start on a re-subscribe.
          nurtureStep: 0,
          nurtureNextAt,
          leadMagnetSentAt: now,
          unsubscribed: false,
          updatedAt: now,
        },
      });

  // Record analytics (table always exists) for the admin dashboard.
  try {
    await db.insert(analyticsEvent).values({
      event: "lead_magnet_subscribe",
      path: `/${source}`,
      locale,
      sessionId: null,
      meta: JSON.stringify({ email, firstName, source }),
    });
  } catch (e) {
    console.error("[lead-magnet] analytics insert failed:", e);
  }

  // Upsert the lead, self-healing the schema if needed.
  try {
    await doUpsert();
  } catch {
    try {
      await ensureLeadTable();
      await doUpsert();
    } catch (e2) {
      console.error("[lead-magnet] upsert failed after self-heal:", e2);
    }
  }

  // Send the free words immediately (best effort).
  await sendLeadMagnetEmail(email, content);

  return { ok: true };
}
