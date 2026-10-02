import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";
import { getServerStrings } from "@/lib/i18n/server-t";

/** Localized <title>/description (the root layout only knows French). */
export function generateMetadata(): Metadata {
  const { t } = getServerStrings();
  return { title: t.meta.title, description: t.meta.description };
}

/**
 * Resolves the locale server-side so the onboarding renders in the user's
 * language on first paint (no French flash before the client cookie check).
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getRequestLocale();
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
