/**
 * Lightweight locale primitives shared by server and client (no server-only
 * imports). Covers the sales landing today; the learning app can reuse the
 * same `Locale` type later.
 */
export const LOCALES = ["fr", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_NAMES: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
};

/** Cookie storing the user's explicit language preference (client + server). */
export const LOCALE_COOKIE_NAME = "locale";

export function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** Path to the product landing for a given locale (FR stays at the root). */
export function offerPath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/offre-a-vie" : `/${locale}/offre-a-vie`;
}

/** Maps a browser language tag (e.g. "en-US") to a supported locale, if any. */
export function localeFromBrowser(
  lang: string | null | undefined,
): Locale | null {
  if (!lang) return null;
  const base = lang.toLowerCase().slice(0, 2);
  return isLocale(base) ? base : null;
}

/** Simple `{var}` interpolation for localized templates. */
export function tpl(
  s: string,
  vars: Record<string, string | number>,
): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
