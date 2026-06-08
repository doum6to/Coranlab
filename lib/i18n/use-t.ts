"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { APP_STRINGS, type AppStrings } from "./app-dict";

/** Returns the translated app strings for the current client locale. */
export function useT(): AppStrings {
  return APP_STRINGS[useLocale()];
}
