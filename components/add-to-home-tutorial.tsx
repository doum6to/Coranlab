"use client";

import { useEffect, useState } from "react";
import { Check, Compass, Link2, Menu, MoreHorizontal, MoreVertical, PlusSquare, X } from "lucide-react";

import { ShinyButton } from "@/components/ui/shiny-button";
import { isNativeApp } from "@/lib/platform";
import { useT } from "@/lib/i18n/use-t";
import type { AppStrings } from "@/lib/i18n/app-dict";

/** Renders `**bold**` segments of a dictionary string as <b>. */
function bold(text: string) {
  return text.split("**").map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
}

const SEEN_KEY = "a2hs-tutorial-v1";

/**
 * Which browser the learner is in: adding a site to the home screen is done differently in
 * each, and not at all from the browser embedded in an app (Instagram, TikTok…), where the
 * page first has to be opened in the phone's real browser.
 */
export type InstallKind =
  | "ios-safari" | "ios-chrome" | "ios-other"
  | "android-chrome" | "android-samsung" | "android-firefox" | "android-inapp";

const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|musical_ly|BytedanceWebview|TikTok|Snapchat|Line\/|Twitter|LinkedInApp|Pinterest|; wv\)/i;

export function detectInstallKind(): InstallKind | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  const nav = navigator as Navigator & { platform?: string };
  // iPadOS reports as a desktop Safari but has a touch screen.
  const ios = /iphone|ipad|ipod/i.test(ua) || (nav.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) {
    if (IN_APP.test(ua)) return "ios-other";
    if (/CriOS/i.test(ua)) return "ios-chrome";
    // Firefox, Edge, Opera and the others: "Add to Home Screen" is only dependable from Safari.
    if (/FxiOS|EdgiOS|OPiOS|OPT\/|DuckDuckGo|Brave/i.test(ua)) return "ios-other";
    return "ios-safari";
  }
  if (/android/i.test(ua)) {
    if (IN_APP.test(ua)) return "android-inapp";
    if (/SamsungBrowser/i.test(ua)) return "android-samsung";
    if (/Firefox/i.test(ua)) return "android-firefox";
    return "android-chrome";
  }
  return null; // computers: nothing to install
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** True when the "install on my phone" help has something to show here. */
export function canShowInstallHelp(): boolean {
  return !isNativeApp() && !isStandalone() && detectInstallKind() !== null;
}

/** The iOS "Share" glyph (square with an upward arrow), drawn to match Safari. */
const IosShareIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M12 15V3m0 0L8 7m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 11H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type StepDef = { icon: React.ReactNode; text: string };

function stepsFor(kind: InstallKind, t: AppStrings["addToHome"]): StepDef[] {
  const i = "h-5 w-5 text-[#6967FB]";
  const share = <IosShareIcon className={i} />;
  const plus = <PlusSquare className={i} strokeWidth={2.2} />;
  const done = <Check className="h-5 w-5 text-[#1F9D4D]" strokeWidth={2.6} />;
  switch (kind) {
    case "ios-safari": return [{ icon: share, text: t.iosSafari1 }, { icon: plus, text: t.iosPick }, { icon: done, text: t.add }];
    case "ios-chrome": return [{ icon: share, text: t.iosChrome1 }, { icon: plus, text: t.iosPick }, { icon: done, text: t.add }];
    case "ios-other": return [{ icon: <Compass className={i} strokeWidth={2.2} />, text: t.iosOpenSafari }, { icon: share, text: t.iosThenShare }, { icon: done, text: t.add }];
    case "android-samsung": return [{ icon: <Menu className={i} strokeWidth={2.2} />, text: t.samsung1 }, { icon: plus, text: t.samsung2 }, { icon: done, text: t.confirm }];
    case "android-firefox": return [{ icon: <MoreVertical className={i} strokeWidth={2.2} />, text: t.firefox1 }, { icon: plus, text: t.firefox2 }, { icon: done, text: t.confirm }];
    case "android-inapp": return [{ icon: <MoreHorizontal className={i} strokeWidth={2.2} />, text: t.androidOpenChrome }, { icon: plus, text: t.androidChrome2 }, { icon: done, text: t.confirm }];
    default: return [{ icon: <MoreVertical className={i} strokeWidth={2.2} />, text: t.androidChrome1 }, { icon: plus, text: t.androidChrome2 }, { icon: done, text: t.confirm }];
  }
}

type InstallEvent = Event & { prompt: () => void; userChoice: Promise<unknown> };

/**
 * The install help itself: the icon as it will sit on the home screen, three steps written for
 * the learner's browser, and, where the browser allows it (Chrome on Android), a button that
 * installs in one tap.
 */
export function InstallSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [kind, setKind] = useState<InstallKind | null>(null);
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setKind(detectInstallKind());
    const onBeforeInstall = (e: Event) => { e.preventDefault(); setPrompt(e as InstallEvent); };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("beforeinstallprompt", onBeforeInstall); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  if (!kind) return null;
  const steps = stepsFor(kind, t.addToHome);
  const needsOtherBrowser = kind === "ios-other" || kind === "android-inapp";

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    try { await prompt.userChoice; } catch {}
    onClose();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/learn`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="install-title">
      <button aria-label={t.ui.close} onClick={onClose} className="absolute inset-0 bg-black/50 duration-200 animate-in fade-in" />

      <div className="relative w-full max-w-md rounded-t-[28px] bg-white px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 duration-300 animate-in slide-in-from-bottom sm:rounded-[28px]">
        <button onClick={onClose} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-[#8A8A93] transition-colors hover:bg-neutral-100" aria-label={t.ui.close}>
          <X className="h-5 w-5" aria-hidden />
        </button>

        {/* The icon as it will look on the home screen */}
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="" width={72} height={72} className="h-[72px] w-[72px]" style={{ borderRadius: 17, boxShadow: "0 8px 20px -8px rgba(74,72,212,.55)" }} />
          <p className="mt-1.5 text-xs font-medium text-brilliant-text">Quranlab</p>
          <h2 id="install-title" className="mt-4 font-heading text-[1.375rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em", textWrap: "balance" as never }}>{t.addToHome.title}</h2>
          <p className="mt-1.5 max-w-[19rem] text-[0.9375rem] leading-snug text-[#555]" style={{ textWrap: "pretty" as never }}>{t.addToHome.body}</p>
        </div>

        <ol className="mt-5 flex flex-col gap-2.5">
          {steps.map((s, n) => (
            <li key={n} className="flex items-center gap-3 rounded-2xl bg-[#F7F7FB] px-3.5 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white" style={{ boxShadow: "0 0 0 1px #ECECF2" }}>{s.icon}</span>
              <p className="min-w-0 flex-1 text-[0.9375rem] leading-snug text-brilliant-text">{bold(s.text)}</p>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-col gap-2">
          {kind === "android-chrome" && prompt && (
            <ShinyButton variant="green" onClick={install} className="text-base"><span className="block py-1">{t.addToHome.install}</span></ShinyButton>
          )}
          {needsOtherBrowser && (
            <button type="button" onClick={copy} className="flex h-[52px] select-none items-center justify-center gap-2 rounded-2xl border-2 border-[#E0E0E0] bg-white text-base font-bold text-brilliant-text shadow-[0_4px_0_0_#D4D4D4] transition-[transform,box-shadow] duration-100 active:translate-y-[4px] active:shadow-none">
              {copied ? <Check className="h-5 w-5 text-[#1F9D4D]" strokeWidth={2.6} aria-hidden /> : <Link2 className="h-5 w-5" strokeWidth={2.2} aria-hidden />}
              <span aria-live="polite">{copied ? t.addToHome.copied : t.addToHome.copyLink}</span>
            </button>
          )}
          <button type="button" onClick={onClose} className="h-12 rounded-2xl text-[0.9375rem] font-semibold text-[#6B6B76] transition-colors hover:bg-neutral-50">
            {kind === "android-chrome" && prompt ? t.ui.later : t.ui.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Shows the install help once, on the home page, after a learner's first steps. Phone only,
 * skipped when the site is already installed or runs inside the native app. It stays
 * available afterwards from the profile.
 */
export const AddToHomeTutorial = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!canShowInstallHelp()) return;
    try { if (localStorage.getItem(SEEN_KEY)) return; } catch { return; }
    const timer = window.setTimeout(() => setShow(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;
  return <InstallSheet onClose={() => { try { localStorage.setItem(SEEN_KEY, "1"); } catch {} setShow(false); }} />;
};
