"use client";

import { createContext, useContext } from "react";

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
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
