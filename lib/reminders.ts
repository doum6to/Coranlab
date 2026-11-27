import "server-only";
import crypto from "crypto";
import { eq, inArray, sql } from "drizzle-orm";
import webpush from "web-push";

import db from "@/db/drizzle";
import { pushSubscription, reminderPref, userProgress } from "@/db/schema";
import { ensureDbLockdown } from "@/lib/db-security";
import { getResend } from "@/lib/email/resend";
import { buildEmail, buttonHtml, escapeHtml, fineHtml } from "@/lib/email/templates/_shell";
import { daysBetween, getToday } from "@/lib/streak-utils";

/**
 * Daily reminders: a notification on the phone and, more sparingly, an e-mail, for learners
 * who have not done their lesson. Sent once a day by /api/cron/reminders.
 *
 *  - Notifications go to every browser the learner accepted them in, for up to a week after
 *    their last lesson, then stop.
 *  - E-mails are rarer: the day the streak is at stake, then on the 3rd and the 7th day
 *    without a lesson, and nothing after. Each carries a one-click opt-out.
 */

const BASE = () => process.env.NEXT_PUBLIC_APP_URL || "https://www.quranlab.app";
const SECRET = process.env.LEAD_UNSUB_SECRET || process.env.CRON_SECRET || "quranlab-reminders";

export type ReminderLocale = "fr" | "en" | "es";
const asLocale = (l: string | null | undefined): ReminderLocale => (l === "en" || l === "es" ? l : "fr");

let ensured = false;
/** Creates the two tables when they are missing (the app is deployed without a migration step). */
export async function ensureReminderTables() {
  if (ensured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "reminder_pref" (
      "user_id" text PRIMARY KEY,
      "email_on" boolean NOT NULL DEFAULT true,
      "locale" text,
      "last_email_date" text,
      "last_push_date" text,
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "push_subscription" (
      "id" serial PRIMARY KEY,
      "user_id" text NOT NULL,
      "endpoint" text NOT NULL UNIQUE,
      "p256dh" text NOT NULL,
      "auth" text NOT NULL,
      "created_at" timestamp NOT NULL DEFAULT now()
    );
  `);
  // New tables get the same protection as the others (no access through the Supabase API).
  void ensureDbLockdown();
  ensured = true;
}

/* ------------------------------------------------------------------ */
/* Notifications on the phone (Web Push)                                */

type Vapid = { publicKey: string; privateKey: string };
const validVapid = (v: unknown): v is Vapid =>
  !!v && typeof (v as Vapid).publicKey === "string" && typeof (v as Vapid).privateKey === "string" && (v as Vapid).publicKey.length > 60 && (v as Vapid).privateKey.length > 30;

/**
 * The table is created with the Supabase API already shut out of it (row level security on, no
 * policy, no grant), in the same statement batch, so the key is never readable from outside.
 */
const SECRET_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS public.app_secret (
  "name" text PRIMARY KEY,
  "value" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);
ALTER TABLE public.app_secret ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON public.app_secret FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON public.app_secret FROM authenticated';
  END IF;
END $$;
`;

let vapid: Promise<Vapid | null> | null = null;
/**
 * The key pair that signs notifications. Taken from the environment when it is set there
 * (NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY); otherwise the app creates one the first
 * time it is needed and keeps it in the database, so nothing has to be configured by hand.
 * The pair must never change afterwards: browsers that subscribed with it would stop receiving.
 */
export function getVapid(): Promise<Vapid | null> {
  if (!vapid) {
    vapid = loadVapid().catch((e) => {
      console.error("[reminders] notification keys unavailable", e?.message || e);
      vapid = null; // try again on the next call
      return null;
    });
  }
  return vapid;
}

async function loadVapid(): Promise<Vapid | null> {
  const env = { publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "", privateKey: process.env.VAPID_PRIVATE_KEY || "" };
  if (validVapid(env)) return env;

  await db.execute(sql.raw(SECRET_TABLE_SQL));
  // Two servers starting together: the first row written wins, both read the same one back.
  const fresh = webpush.generateVAPIDKeys();
  await db.execute(sql`INSERT INTO public.app_secret ("name", "value") VALUES ('vapid', ${JSON.stringify({ publicKey: fresh.publicKey, privateKey: fresh.privateKey })}) ON CONFLICT ("name") DO NOTHING`);
  const res = (await db.execute(sql`SELECT "value" FROM public.app_secret WHERE "name" = 'vapid'`)) as unknown as { rows?: { value: string }[] };
  const stored = JSON.parse(res.rows?.[0]?.value ?? "null");
  return validVapid(stored) ? stored : null;
}

/** Sends one notification to every browser of a learner. Dead subscriptions are removed. */
export async function pushToUser(userId: string, payload: { title: string; body: string; url?: string }): Promise<number> {
  const keys = await getVapid();
  if (!keys) return 0;
  const vapidDetails = { subject: process.env.VAPID_SUBJECT || "mailto:contact@quranlab.app", publicKey: keys.publicKey, privateKey: keys.privateKey };
  const subs = await db.query.pushSubscription.findMany({ where: eq(pushSubscription.userId, userId) });
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 60 * 60 * 6, vapidDetails });
      sent++;
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      // 404 / 410: the browser dropped this subscription (app removed, permission withdrawn).
      if (status === 404 || status === 410) await db.delete(pushSubscription).where(eq(pushSubscription.id, s.id));
      else console.error("[reminders] push failed", status);
    }
  }
  return sent;
}

/* ------------------------------------------------------------------ */
/* Opt-out link of the e-mails                                          */

const sign = (userId: string) => crypto.createHmac("sha256", SECRET).update(`reminder:${userId}`).digest("hex").slice(0, 32);
export function verifyReminderToken(userId: string, token: string): boolean {
  if (!userId || !token) return false;
  const a = Buffer.from(sign(userId));
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const optOutUrl = (userId: string) => `${BASE()}/api/reminders/unsubscribe?u=${encodeURIComponent(userId)}&t=${sign(userId)}`;

/* ------------------------------------------------------------------ */
/* Wording                                                              */

type Copy = { subject: string; body: string; cta: string; push: string; fine: string; optOut: string };

/** `days`: days since the last lesson (1 = the streak is at stake today). `streak`: its length. */
function copyFor(locale: ReminderLocale, days: number, streak: number): Copy {
  const n = Math.max(streak, 1);
  if (locale === "en") {
    const base = { cta: "Do my lesson", fine: "You receive this email because you have a Quranlab account.", optOut: "Stop these reminders" };
    if (days <= 1) return { ...base, subject: n > 1 ? `Your ${n}-day streak holds until tonight` : "Your streak started yesterday", body: "One lesson today and it carries on. It takes two or three minutes.", push: n > 1 ? `Your ${n}-day streak holds until tonight. One lesson?` : "Your streak started yesterday. One lesson to keep it?" };
    if (days < 7) return { ...base, subject: "Pick up where you stopped?", body: "The words you learned are still there. One short lesson is enough to get going again.", push: "Two minutes to pick your lesson back up?" };
    return { ...base, subject: "Koji is keeping your place", body: "It has been a week. Your progress is untouched: come back whenever you like. This is the last reminder we send.", push: "Your progress is waiting for you. One short lesson?" };
  }
  if (locale === "es") {
    const base = { cta: "Hacer mi lección", fine: "Recibes este correo porque tienes una cuenta en Quranlab.", optOut: "No recibir más estos recordatorios" };
    if (days <= 1) return { ...base, subject: n > 1 ? `Tu racha de ${n} días aguanta hasta esta noche` : "Tu racha empezó ayer", body: "Una lección hoy y sigue adelante. Son dos o tres minutos.", push: n > 1 ? `Tu racha de ${n} días aguanta hasta esta noche. ¿Una lección?` : "Tu racha empezó ayer. ¿Una lección para mantenerla?" };
    if (days < 7) return { ...base, subject: "¿Retomamos donde lo dejaste?", body: "Las palabras que aprendiste siguen ahí. Una lección corta basta para volver a empezar.", push: "¿Dos minutos para retomar tu lección?" };
    return { ...base, subject: "Koji te guarda el sitio", body: "Ha pasado una semana. Tu progreso está intacto: vuelve cuando quieras. Es el último recordatorio que te enviamos.", push: "Tu progreso te espera. ¿Una lección corta?" };
  }
  const base = { cta: "Faire ma leçon", fine: "Tu reçois cet e-mail parce que tu as un compte Quranlab.", optOut: "Ne plus recevoir ces rappels" };
  if (days <= 1) return { ...base, subject: n > 1 ? `Ta série de ${n} jours tient jusqu'à ce soir` : "Ta série a commencé hier", body: "Une leçon aujourd'hui et elle continue. Compte deux ou trois minutes.", push: n > 1 ? `Ta série de ${n} jours tient jusqu'à ce soir. Une leçon ?` : "Ta série a commencé hier. Une leçon pour la garder ?" };
  if (days < 7) return { ...base, subject: "On reprend là où tu t'es arrêté ?", body: "Les mots que tu as appris sont toujours là. Une leçon courte suffit pour repartir.", push: "Deux minutes pour reprendre ta leçon ?" };
  return { ...base, subject: "Koji garde ta place", body: "Ça fait une semaine. Ta progression est intacte : reviens quand tu veux. C'est le dernier rappel qu'on t'envoie.", push: "Ta progression t'attend. Une leçon courte ?" };
}

function emailHtml(copy: Copy, userId: string, locale: ReminderLocale): string {
  const body = [
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;color:#333333;line-height:1.65;margin:0 0 12px">${escapeHtml(copy.body)}</div>`,
    buttonHtml({ href: `${BASE()}/learn`, label: copy.cta, variant: "dark" }),
    fineHtml(`${escapeHtml(copy.fine)}<br/><a href="${escapeHtml(optOutUrl(userId))}" style="color:#999999">${escapeHtml(copy.optOut)}</a>`),
  ].join("\n");
  return buildEmail({ preview: copy.body, heading: copy.subject, bodyHtml: body, locale });
}

/* ------------------------------------------------------------------ */
/* The daily run                                                        */

/** Days without a lesson on which an e-mail goes out. Notifications go out every day up to the last one. */
const EMAIL_DAYS = [1, 3, 7];
const LAST_DAY = 7;
const BATCH = 400;

export async function runDailyReminders(): Promise<{ learners: number; emails: number; pushes: number }> {
  await ensureReminderTables();
  const today = getToday();

  // Learners with at least one lesson behind them, whose last one is 1 to 7 days old.
  const rows = await db
    .select({ userId: userProgress.userId, streak: userProgress.streak, last: userProgress.lastStreakDate })
    .from(userProgress)
    .where(sql`${userProgress.lastStreakDate} IS NOT NULL AND ${userProgress.lastStreakDate} < ${today}`)
    .limit(5000);
  const due = rows
    .map((r) => ({ ...r, days: daysBetween(r.last!, today) }))
    .filter((r) => r.days >= 1 && r.days <= LAST_DAY)
    .slice(0, BATCH);
  if (!due.length) return { learners: 0, emails: 0, pushes: 0 };

  const ids = due.map((r) => r.userId);
  const prefs = new Map((await db.query.reminderPref.findMany({ where: inArray(reminderPref.userId, ids) })).map((p) => [p.userId, p]));

  // E-mail addresses live in Supabase Auth.
  const emails = new Map<string, string>();
  const wantEmail = due.filter((r) => EMAIL_DAYS.includes(r.days) && (prefs.get(r.userId)?.emailOn ?? true) && prefs.get(r.userId)?.lastEmailDate !== today);
  if (wantEmail.length && process.env.RESEND_API_KEY) {
    try {
      const res = (await db.execute(sql`select id::text as id, email from auth.users where id::text in (${sql.join(wantEmail.map((r) => sql`${r.userId}`), sql`, `)})`)) as unknown as { rows?: { id: string; email: string | null }[] };
      for (const u of res.rows ?? []) if (u.email) emails.set(u.id, u.email);
    } catch (e) {
      console.error("[reminders] could not read e-mail addresses", e);
    }
  }

  let sentEmails = 0;
  let sentPushes = 0;
  const from = process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";
  for (const r of due) {
    const pref = prefs.get(r.userId);
    const locale = asLocale(pref?.locale);
    const copy = copyFor(locale, r.days, r.streak);
    const patch: { lastEmailDate?: string; lastPushDate?: string } = {};

    if (pref?.lastPushDate !== today) {
      const n = await pushToUser(r.userId, { title: "Quranlab", body: copy.push, url: "/learn" });
      if (n > 0) { sentPushes += n; patch.lastPushDate = today; }
    }

    const to = emails.get(r.userId);
    if (to) {
      try {
        const res = await getResend().emails.send({
          from,
          to,
          subject: copy.subject,
          html: emailHtml(copy, r.userId, locale),
          headers: { "List-Unsubscribe": `<${optOutUrl(r.userId)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        });
        if (!res.error) { sentEmails++; patch.lastEmailDate = today; }
        else console.error("[reminders] e-mail refused", res.error.message);
      } catch (e) {
        console.error("[reminders] e-mail failed", e);
      }
    }

    if (patch.lastEmailDate || patch.lastPushDate) {
      await db
        .insert(reminderPref)
        .values({ userId: r.userId, ...patch })
        .onConflictDoUpdate({ target: reminderPref.userId, set: { ...patch, updatedAt: new Date() } });
    }
  }
  return { learners: due.length, emails: sentEmails, pushes: sentPushes };
}

/** Turns the e-mail reminders off for a learner (opt-out link, profile switch). */
export async function setEmailReminders(userId: string, on: boolean) {
  await ensureReminderTables();
  await db.insert(reminderPref).values({ userId, emailOn: on }).onConflictDoUpdate({ target: reminderPref.userId, set: { emailOn: on, updatedAt: new Date() } });
}

