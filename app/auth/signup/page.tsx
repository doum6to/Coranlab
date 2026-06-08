import { Suspense } from "react";

import { LocaleProvider } from "@/components/i18n/locale-provider";
import { isLocale } from "@/lib/i18n/locales";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { SignUpForm } from "./signup-form";

// Dynamic so the locale (cookie / Accept-Language) is resolved server-side.
export const dynamic = "force-dynamic";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  // A ?lang= override (e.g. coming from the thank-you page) wins over the
  // cookie/Accept-Language so the account-creation language matches the
  // language the user purchased in.
  const locale = isLocale(searchParams.lang)
    ? searchParams.lang
    : getRequestLocale();

  return (
    <LocaleProvider locale={locale}>
      <Suspense fallback={null}>
        <SignUpForm />
      </Suspense>
    </LocaleProvider>
  );
}
