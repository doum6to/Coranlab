"use server";

import { and, eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { pushSubscription, reminderPref } from "@/db/schema";
import { ensureReminderTables, getVapid, setEmailReminders } from "@/lib/reminders";
import { auth } from "@/lib/supabase/server";

export type ReminderState = {
  /** Public key the browser subscribes with; empty when the server could not provide one. */
  pushKey: string;
  emailOn: boolean;
  /** Number of browsers of this learner that accepted notifications. */
  devices: number;
};

/** The learner's reminder choices. Also remembers their language, for the wording of reminders. */
export async function getReminderState(locale?: string): Promise<ReminderState | null> {
  const { userId } = await auth();
  if (!userId) return null;
  try {
    await ensureReminderTables();
    const lang = locale === "en" || locale === "es" ? locale : "fr";
    await db.insert(reminderPref).values({ userId, locale: lang }).onConflictDoUpdate({ target: reminderPref.userId, set: { locale: lang } });
    const [pref, subs, keys] = await Promise.all([
      db.query.reminderPref.findFirst({ where: eq(reminderPref.userId, userId) }),
      db.query.pushSubscription.findMany({ where: eq(pushSubscription.userId, userId), columns: { id: true } }),
      getVapid(),
    ]);
    return { pushKey: keys?.publicKey ?? "", emailOn: pref?.emailOn ?? true, devices: subs.length };
  } catch (e) {
    console.error("[reminders] state unavailable", e);
    return null;
  }
}

/** Saves the subscription a browser just created (it replaces any earlier owner of that browser). */
export async function savePushSubscription(sub: { endpoint: string; keys?: { p256dh?: string; auth?: string } }): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const p256dh = sub?.keys?.p256dh;
  const key = sub?.keys?.auth;
  if (!sub?.endpoint || !/^https:\/\//.test(sub.endpoint) || !p256dh || !key) return false;
  await ensureReminderTables();
  await db
    .insert(pushSubscription)
    .values({ userId, endpoint: sub.endpoint, p256dh, auth: key })
    .onConflictDoUpdate({ target: pushSubscription.endpoint, set: { userId, p256dh, auth: key } });
  return true;
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  const { userId } = await auth();
  if (!userId || !endpoint) return;
  await ensureReminderTables();
  await db.delete(pushSubscription).where(and(eq(pushSubscription.userId, userId), eq(pushSubscription.endpoint, endpoint)));
}

export async function setEmailReminder(on: boolean): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;
  await setEmailReminders(userId, !!on);
}
