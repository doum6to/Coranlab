"use client";

import { createContext, useContext, useEffect } from "react";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** Makes the resolved request locale available to client components. */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  // Keep <html lang> in sync with the active locale. The root layout can't
  // read cookies without opting every page out of static rendering, so the
  // nearest provider (app / lesson / auth layouts) patches it client-side.
  // Screen readers, browser translation prompts and analytics read it.
  useEffect(() => {
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
