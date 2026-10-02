import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";
import { getServerStrings } from "@/lib/i18n/server-t";

/** Localized <title>/description (the root layout only knows French). */
export function generateMetadata(): Metadata {
  const { t } = getServerStrings();
  return { title: t.meta.title, description: t.meta.description };
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const locale = getRequestLocale();
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
};

export default AuthLayout;
