import "server-only";
import { cookies, headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  isLocale,
  localeFromBrowser,
  type Locale,
} from "./locales";

/** Cookie that stores the user's explicit language preference for the app. */
export const LOCALE_COOKIE = "locale";

/**
 * Resolves the locale for the current request: explicit cookie preference
 * first, otherwise the best match from the Accept-Language header, otherwise
 * the default (French).
 */
export function getRequestLocale(): Locale {
  const cookieValue = cookies().get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieValue)) return cookieValue;

  const acceptLanguage = headers().get("accept-language");
  if (acceptLanguage) {
    for (const part of acceptLanguage.split(",")) {
      const tag = part.split(";")[0]?.trim();
      const loc = localeFromBrowser(tag);
      if (loc) return loc;
    }
  }
  return DEFAULT_LOCALE;
}

/** Whether the user has set an explicit language preference cookie. */
export function hasLocaleCookie(): boolean {
  return isLocale(cookies().get(LOCALE_COOKIE)?.value);
}
