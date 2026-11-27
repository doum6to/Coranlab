"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, Check, Mail, X } from "lucide-react";

import { getReminderState, removePushSubscription, savePushSubscription, setEmailReminder, type ReminderState } from "@/actions/reminders";
import { InstallSheet, detectInstallKind, isStandalone } from "@/components/add-to-home-tutorial";
import { useLocale } from "@/components/i18n/locale-provider";
import { useT } from "@/lib/i18n/use-t";
import { isNativeApp } from "@/lib/platform";

/**
 * Daily reminders, seen from the learner: a card on the home page that offers them once they
 * have a streak to keep, and a sheet in the profile to change one's mind. On iPhone a site can
 * only notify once it is installed on the home screen, so the card leads there first.
 */

type Support = "ok" | "needs-install" | "none";

function pushSupport(): Support {
  if (typeof window === "undefined" || isNativeApp()) return "none";
  if ("serviceWorker" in navigator && "PushManager" in window && "Notification" in window) return "ok";
  const kind = detectInstallKind();
  return kind?.startsWith("ios") && !isStandalone() ? "needs-install" : "none";
}

/** The key as the browser wants it. */
function keyBytes(base64: string): Uint8Array {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

type Outcome = "on" | "denied" | "failed";

/** Asks the permission (must follow a tap), subscribes this browser and saves the subscription. */
async function enablePush(pushKey: string): Promise<Outcome> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return permission === "denied" ? "denied" : "failed";
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const sub = (await registration.pushManager.getSubscription()) ?? (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(pushKey) }));
    const saved = await savePushSubscription(sub.toJSON() as { endpoint: string; keys?: { p256dh?: string; auth?: string } });
    return saved ? "on" : "failed";
  } catch {
    return "failed";
  }
}

async function disablePush(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const sub = await registration?.pushManager.getSubscription();
    if (sub) {
      await removePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
  } catch {}
}

/** Whether THIS browser currently holds a subscription. */
async function subscribedHere(): Promise<boolean> {
  try {
    if (Notification.permission !== "granted") return false;
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    return !!(await registration?.pushManager.getSubscription());
  } catch {
    return false;
  }
}

/** Fixed values in place of the real state: lets the screens be looked at without an account. */
export type ReminderPreview = { support: Support; here?: boolean; problem?: "denied" | "failed" | null; emailOn?: boolean };

function useReminders(preview?: ReminderPreview) {
  const locale = useLocale();
  const [state, setState] = useState<ReminderState | null>(null);
  const [support, setSupport] = useState<Support>("none");
  const [here, setHere] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<"denied" | "failed" | null>(null);

  useEffect(() => {
    if (preview) {
      setSupport(preview.support);
      setHere(!!preview.here);
      setProblem(preview.problem ?? null);
      setState({ pushKey: "preview", emailOn: preview.emailOn ?? true, devices: preview.here ? 1 : 0 });
      return;
    }
    const s = pushSupport();
    setSupport(s);
    if (s === "ok") { void subscribedHere().then(setHere); if (Notification.permission === "denied") setProblem("denied"); }
    void getReminderState(locale).then(setState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const turnOn = useCallback(async () => {
    if (!state?.pushKey || busy) return;
    setBusy(true);
    setProblem(null);
    const outcome = await enablePush(state.pushKey);
    setBusy(false);
    if (outcome === "on") setHere(true);
    else setProblem(outcome);
  }, [state, busy]);

  const turnOff = useCallback(async () => {
    setBusy(true);
    await disablePush();
    setBusy(false);
    setHere(false);
  }, []);

  return { state, setState, support, here, busy, problem, turnOn, turnOff };
}

const SNOOZE_KEY = "reminder-card-later";
const SNOOZE_DAYS = 7;

/** Home page: offered once there is a streak to keep, until accepted. "Later" hides it for a week. */
export function ReminderCard({ streak, preview }: { streak: number; preview?: ReminderPreview }) {
  const t = useT();
  const { state, support, here, busy, problem, turnOn } = useReminders(preview);
  const [snoozed, setSnoozed] = useState(true);
  const [install, setInstall] = useState(false);

  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      setSnoozed(until > Date.now());
    } catch { setSnoozed(false); }
  }, []);

  if (streak < 1 || snoozed || !state?.pushKey || support === "none" || here) return null;

  const later = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000)); } catch {}
    setSnoozed(true);
  };

  return (
    <div className="relative mt-4 px-4 py-4" style={{ borderRadius: 24, boxShadow: "inset 0 0 0 1.5px #E3E2FF" }}>
      <button type="button" onClick={later} aria-label={t.ui.later} className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full text-[#A3A3B2] transition-colors hover:bg-neutral-100">
        <X className="h-[18px] w-[18px]" aria-hidden />
      </button>
      <div className="flex items-start gap-3.5 pr-8">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F0F0FF] text-[#6967FB]"><BellRing className="h-[22px] w-[22px]" strokeWidth={2.2} aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-[1.0625rem] font-bold leading-tight text-brilliant-text">{t.reminders.title}</p>
          <p className="mt-1 text-[0.9375rem] leading-snug text-[#555]">{support === "needs-install" ? t.reminders.needsInstall : t.reminders.body}</p>
        </div>
      </div>
      {problem && <p className="mt-3 text-[0.875rem] leading-snug text-[#B42323]" role="alert">{problem === "denied" ? t.reminders.denied : t.reminders.failed}</p>}
      {problem !== "denied" && (
        <button
          type="button"
          disabled={busy}
          onClick={support === "needs-install" ? () => setInstall(true) : turnOn}
          className="mt-3.5 h-12 w-full select-none rounded-2xl bg-[#6967FB] text-[0.9375rem] font-bold text-white shadow-[0_4px_0_0_#4A48D4] transition-[transform,box-shadow,opacity] duration-100 active:translate-y-[4px] active:shadow-none disabled:opacity-60"
        >
          {support === "needs-install" ? t.reminders.installCta : t.reminders.enable}
        </button>
      )}
      {install && <InstallSheet onClose={() => setInstall(false)} />}
    </div>
  );
}

/** Profile: the two reminders and their switches. */
export function ReminderSheet({ onClose, preview }: { onClose: () => void; preview?: ReminderPreview }) {
  const t = useT();
  const { state, setState, support, here, busy, problem, turnOn, turnOff } = useReminders(preview);
  const [install, setInstall] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const emailOn = state?.emailOn ?? true;
  const toggleEmail = () => {
    if (!state) return;
    setState({ ...state, emailOn: !emailOn });
    void setEmailReminder(!emailOn);
  };
  const showPhone = !!state?.pushKey && support !== "none";

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="reminders-title">
      <button aria-label={t.ui.close} onClick={onClose} className="absolute inset-0 bg-black/50 duration-200 animate-in fade-in" />
      <div className="relative w-full max-w-md rounded-t-[28px] bg-white px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 duration-300 animate-in slide-in-from-bottom sm:rounded-[28px]">
        <button onClick={onClose} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-[#8A8A93] transition-colors hover:bg-neutral-100" aria-label={t.ui.close}>
          <X className="h-5 w-5" aria-hidden />
        </button>
        <h2 id="reminders-title" className="font-heading text-[1.375rem] font-extrabold text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>{t.reminders.row}</h2>

        <ul className="mt-4">
          {showPhone && (
            <li className="flex items-center gap-3.5 py-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0F0FF] text-[#6967FB]"><BellRing className="h-5 w-5" strokeWidth={2.2} aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[1rem] font-semibold leading-tight text-brilliant-text">{t.reminders.phone}</p>
                <p className="mt-0.5 text-[0.875rem] leading-snug text-[#6B6B76]">{support === "needs-install" ? t.reminders.needsInstall : t.reminders.phoneHint}</p>
                {problem && <p className="mt-1 text-[0.875rem] leading-snug text-[#B42323]" role="alert">{problem === "denied" ? t.reminders.denied : t.reminders.failed}</p>}
              </div>
              {support === "needs-install" ? (
                <button type="button" onClick={() => setInstall(true)} className="h-11 shrink-0 rounded-full bg-[#6967FB] px-4 text-[0.875rem] font-bold text-white">{t.reminders.installCta}</button>
              ) : here ? (
                <button type="button" onClick={turnOff} disabled={busy} className="flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.875rem] font-bold text-[#15803D] disabled:opacity-60" aria-label={t.reminders.turnOff}>
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden />{t.reminders.on}
                </button>
              ) : problem === "denied" ? null : (
                <button type="button" onClick={turnOn} disabled={busy} className="h-11 shrink-0 rounded-full bg-[#6967FB] px-4 text-[0.875rem] font-bold text-white disabled:opacity-60">{t.reminders.enable}</button>
              )}
            </li>
          )}
          <li className={`flex items-center gap-3.5 py-3.5 ${showPhone ? "border-t border-[#EFEFF3]" : ""}`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0F0FF] text-[#6967FB]"><Mail className="h-5 w-5" strokeWidth={2.2} aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <p id="reminder-email-label" className="text-[1rem] font-semibold leading-tight text-brilliant-text">{t.reminders.email}</p>
              <p className="mt-0.5 text-[0.875rem] leading-snug text-[#6B6B76]">{t.reminders.emailHint}</p>
            </div>
            <button type="button" role="switch" aria-checked={emailOn} aria-labelledby="reminder-email-label" disabled={!state} onClick={toggleEmail} className="relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50" style={{ background: emailOn ? "#6967FB" : "#D4D4DC" }}>
              <span className="absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left] duration-200" style={{ left: emailOn ? 24 : 4 }} />
            </button>
          </li>
        </ul>
      </div>
      {install && <InstallSheet onClose={() => setInstall(false)} />}
    </div>
  );
}

/**
 * End of the first lesson of the day: the moment a reminder for tomorrow makes sense. Shown
 * only where this browser can be notified and is not yet; one tap, then a confirmation.
 */
export function TomorrowReminder({ preview }: { preview?: ReminderPreview }) {
  const t = useT();
  const { state, support, here, busy, problem, turnOn } = useReminders(preview);
  const [asked, setAsked] = useState(false);
  if (support !== "ok" || !state?.pushKey || problem === "denied") return null;
  if (here) {
    return asked ? (
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.9375rem] font-semibold text-[#1F9D4D] animate-in fade-in"><Check className="h-[18px] w-[18px]" strokeWidth={3} aria-hidden />{t.reward.reminderOn}</p>
    ) : null;
  }
  return (
    <>
      <button
        type="button"
        onClick={() => { setAsked(true); void turnOn(); }}
        disabled={busy}
        className="mt-3 flex min-h-[48px] w-full select-none items-center justify-center gap-2 rounded-2xl text-[0.9375rem] font-bold text-[#5452E0] transition-[transform,background-color] duration-150 active:scale-[0.98] active:bg-[#F0F0FF] disabled:opacity-60"
        style={{ boxShadow: "inset 0 0 0 2px #C8C7F0" }}
      >
        <BellRing className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
        {t.reward.remindMe}
      </button>
      {problem === "failed" && <p className="mt-2 text-center text-[0.8125rem] text-[#B42323]" role="alert">{t.reminders.failed}</p>}
    </>
  );
}
