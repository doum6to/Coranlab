"use client";

import { APP_STRINGS } from "@/lib/i18n/app-dict";
import { DEFAULT_LOCALE, isLocale, localeFromBrowser } from "@/lib/i18n/locales";

// Root error boundary renders outside every provider: resolve the locale
// from the cookie / browser directly.
function resolveLocale() {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("locale="))
    ?.split("=")[1];
  if (isLocale(cookie)) return cookie;
  return localeFromBrowser(navigator.language) ?? DEFAULT_LOCALE;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = APP_STRINGS[resolveLocale()];
  return (
    <html lang={resolveLocale()}>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h2 className="text-xl font-bold text-neutral-800">
            {t.errors.title}
          </h2>
          <p className="text-neutral-500 text-sm">
            {error.message}
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#6967fb] text-white rounded-xl font-bold hover:bg-[#6967fb]/90 transition"
          >
            {t.errors.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
