"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import {
  localeFromBrowser,
  offerPath,
  type Locale,
} from "@/lib/i18n/locales";
import { BANNER_UI } from "@/lib/i18n/landing-ui";

const DISMISS_KEY = "locale-suggest-dismissed";

/**
 * If the visitor's browser language differs from the page's language and we
 * support it, offer a one-tap switch. Dismissal is remembered for the session.
 */
export function LocaleSuggestionBanner({ current }: { current: Locale }) {
  const [suggest, setSuggest] = useState<Locale | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }
    const langs =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language];
    for (const lang of langs) {
      const loc = localeFromBrowser(lang);
      if (!loc) continue;
      // First clear preference wins: matches the page → no banner.
      if (loc === current) return;
      setSuggest(loc);
      return;
    }
  }, [current]);

  if (!suggest) return null;
  const t = BANNER_UI[suggest];

  return (
    <div className="bg-neutral-950 text-white">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <span className="text-sm">{t.text}</span>
        <div className="flex items-center gap-2">
          <Link
            href={offerPath(suggest)}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-950 hover:bg-neutral-100"
          >
            {t.cta}
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              try {
                sessionStorage.setItem(DISMISS_KEY, "1");
              } catch {
                /* ignore */
              }
              setSuggest(null);
            }}
            className="text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
