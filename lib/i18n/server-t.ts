import "server-only";

import { APP_STRINGS, type AppStrings } from "./app-dict";
import { getRequestLocale } from "./request-locale";
import type { Locale } from "./locales";

/** Translated app strings for a server component, by resolved request locale. */
export function getServerStrings(): { t: AppStrings; locale: Locale } {
  const locale = getRequestLocale();
  return { t: APP_STRINGS[locale], locale };
}
