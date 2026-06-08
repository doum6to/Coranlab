"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, Globe } from "lucide-react";

import {
  LOCALES,
  LOCALE_NAMES,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@/lib/i18n/locales";
import { useLocale } from "@/components/i18n/locale-provider";

/** Language picker that writes the preference cookie and refreshes the page. */
export const LanguageSelector = () => {
  const current = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (locale: Locale) => {
    if (locale === current) return;
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div className="divide-y divide-brilliant-border">
      {LOCALES.map((locale) => (
        <button
          key={locale}
          onClick={() => choose(locale)}
          disabled={pending}
          className="w-full px-5 py-4 flex items-center gap-x-3 transition hover:bg-gray-50 disabled:opacity-60"
        >
          <Globe className="h-5 w-5 text-brilliant-muted shrink-0" />
          <span className="flex-1 text-left text-sm font-semibold text-brilliant-text">
            {LOCALE_NAMES[locale]}
          </span>
          {locale === current && (
            <Check className="h-4 w-4 text-[#6967fb] shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
};
