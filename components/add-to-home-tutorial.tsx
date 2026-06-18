"use client";

import { useEffect, useState } from "react";
import { MoreVertical, PlusSquare, Check, X } from "lucide-react";

import { isNativeApp } from "@/lib/platform";

const SEEN_KEY = "a2hs-tutorial-v1";

type Platform = "ios" | "android" | null;

/** The iOS "Share" glyph (square with an upward arrow), drawn to match Safari. */
const IosShareIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M12 15V3m0 0L8 7m4-4l4 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 11H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2h-1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+ reports as desktop Safari but is touch-capable.
    ((navigator as any).platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/android/i.test(ua)) return "android";
  return null;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

/**
 * One-time "Add to Home Screen" coach shown on the home page after a user's
 * first onboarding, to make the web app feel like a native app. Phone only,
 * skipped if already installed (standalone) or inside the real native app.
 */
export const AddToHomeTutorial = () => {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  // Android Chrome lets us trigger the real install prompt.
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isNativeApp() || isStandalone()) return;
    if (localStorage.getItem(SEEN_KEY)) return;

    const p = detectPlatform();
    if (!p) return; // desktop / unknown → no point

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    setPlatform(p);
    const timer = setTimeout(() => setShow(true), 700);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setShow(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } catch {}
    setDeferredPrompt(null);
    dismiss();
  };

  if (!show || !platform) return null;

  const steps =
    platform === "ios"
      ? [
          {
            icon: <IosShareIcon className="h-5 w-5 text-[#6967FB]" />,
            text: (
              <>
                Touche le bouton <b>Partager</b> dans la barre de Safari.
              </>
            ),
          },
          {
            icon: <PlusSquare className="h-5 w-5 text-[#6967FB]" />,
            text: (
              <>
                Choisis <b>« Sur l&apos;écran d&apos;accueil »</b>.
              </>
            ),
          },
          {
            icon: <Check className="h-5 w-5 text-emerald-500" />,
            text: (
              <>
                Touche <b>« Ajouter »</b> — c&apos;est installé&nbsp;!
              </>
            ),
          },
        ]
      : [
          {
            icon: <MoreVertical className="h-5 w-5 text-[#6967FB]" />,
            text: (
              <>
                Ouvre le menu <b>⋮</b> en haut à droite de Chrome.
              </>
            ),
          },
          {
            icon: <PlusSquare className="h-5 w-5 text-[#6967FB]" />,
            text: (
              <>
                Touche <b>« Ajouter à l&apos;écran d&apos;accueil »</b>.
              </>
            ),
          },
          {
            icon: <Check className="h-5 w-5 text-emerald-500" />,
            text: <>Confirme — l&apos;icône apparaît sur ton téléphone&nbsp;!</>,
          },
        ];

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <button
        aria-label="Fermer"
        onClick={dismiss}
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
      />

      {/* Sheet */}
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:rounded-3xl">
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/quranlab-logo.png"
            alt="Quranlab"
            className="h-16 w-16 rounded-2xl object-contain shadow-sm"
          />
          <h2 className="mt-3 font-heading text-lg font-extrabold text-brilliant-text">
            Installe Quranlab sur ton téléphone
          </h2>
          <p className="mt-1 text-sm text-brilliant-muted">
            Ajoute-la à ton écran d&apos;accueil pour l&apos;ouvrir comme une vraie
            application, en plein écran.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-5 space-y-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                {s.icon}
              </div>
              <p className="text-sm text-brilliant-text">{s.text}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          {platform === "android" && deferredPrompt && (
            <button
              onClick={install}
              className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#6967FB", boxShadow: "0 4px 0 0 #4a48d4" }}
            >
              Ajouter à l&apos;écran d&apos;accueil
            </button>
          )}
          <button
            onClick={dismiss}
            className="w-full rounded-2xl py-3 text-sm font-semibold text-brilliant-muted hover:bg-neutral-50"
          >
            {platform === "android" && deferredPrompt ? "Plus tard" : "J'ai compris"}
          </button>
        </div>
      </div>
    </div>
  );
};
