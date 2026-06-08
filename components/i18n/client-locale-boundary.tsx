"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_LOCALE,
  isLocale,
  localeFromBrowser,
  type Locale,
} from "@/lib/i18n/locales";
import { LocaleProvider } from "./locale-provider";

/**
 * Client-only locale provider that resolves the locale from the cookie (then
 * the browser language) after mount. For root-level, client-rendered UI such
 * as modals that aren't part of the server-rendered tree, so there's no
 * hydration mismatch.
 */
export function ClientLocaleBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("locale="))
      ?.split("=")[1];
    if (isLocale(cookie)) {
      setLocale(cookie);
      return;
    }
    const fromBrowser = localeFromBrowser(navigator.language);
    if (fromBrowser) setLocale(fromBrowser);
  }, []);

  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
