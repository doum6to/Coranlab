import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";

/** Resolves an email locale from Stripe metadata / session fields (French by default). */
export function emailLocale(...candidates: Array<string | null | undefined>): Locale {
  for (const c of candidates) {
    const base = (c || "").toLowerCase().slice(0, 2);
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

const INTL: Record<Locale, string> = { fr: "fr-FR", en: "en-GB", es: "es-ES" };

export function formatEmailDate(d: Date, locale: Locale): string {
  return d.toLocaleDateString(INTL[locale], { day: "numeric", month: "long", year: "numeric" });
}

/** "14,97 €" in FR/ES, "€14.97" in EN. */
export function formatEmailAmount(cents: number, locale: Locale): string {
  const v = (cents / 100).toFixed(2);
  return locale === "en" ? `€${v}` : `${v.replace(".", ",")} €`;
}
