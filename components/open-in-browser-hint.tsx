"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

/** Detects TikTok / Instagram / Facebook / Snapchat in-app browsers (webviews). */
function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /TikTok|musical_ly|Bytedance|BytedanceWebview|Instagram|FBAN|FBAV|FB_IAB|Snapchat|Line\//i.test(
    ua,
  );
}

/**
 * Top-right hint nudging in-app-browser users (mainly TikTok) to open the page
 * in their real browser — where the checkout (Stripe / Apple Pay) works
 * reliably. Shows ONLY inside in-app browsers, with a looping arrow pointing at
 * the native "•••" menu in the top-right corner. Dismissible.
 */
export function OpenInBrowserHint({
  accent = "#E9C46A",
  label = "Ouvrir dans le navigateur",
}: {
  accent?: string;
  label?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInAppBrowser()) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed right-3 top-3 z-[200] flex flex-col items-end gap-1.5">
      <style>{`
        @keyframes oib-arrow{0%,100%{transform:translate(0,0);opacity:.65}50%{transform:translate(6px,-6px);opacity:1}}
        @keyframes oib-pop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>

      {/* Arrow pointing up-right toward the "•••" menu */}
      <ArrowUpRight
        className="h-9 w-9 drop-shadow"
        strokeWidth={2.75}
        style={{ color: accent, animation: "oib-arrow 1s ease-in-out infinite" }}
        aria-hidden
      />

      {/* Pill */}
      <div
        className="flex items-center gap-2 rounded-full border py-1.5 pl-3.5 pr-1.5 shadow-lg"
        style={{
          background: "rgba(10,33,25,0.95)",
          borderColor: `${accent}66`,
          animation: "oib-pop .25s ease-out",
        }}
      >
        <span className="text-[13px] font-semibold leading-tight text-white">{label}</span>
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label="Fermer"
          className="grid h-6 w-6 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
