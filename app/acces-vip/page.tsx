import { getVipSettings } from "@/lib/vip";
import { VipForm } from "./vip-form";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getServerStrings } from "@/lib/i18n/server-t";
import type { Metadata } from "next";

// Dynamic: the access code arrives via ?c= and access must never be cached.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const { t } = getServerStrings();
  return { title: t.vip.metaTitle, robots: { index: false, follow: false } };
}

export default async function AccesVipPage({
  searchParams,
}: {
  searchParams: { c?: string };
}) {
  const settings = await getVipSettings();
  const code = (searchParams.c || "").trim();
  const valid = !!code && code.toLowerCase() === settings.code.toLowerCase();

  return (
    <LocaleProvider locale={getRequestLocale()}>
      <VipForm intro={settings.intro} code={code} valid={valid} />
    </LocaleProvider>
  );
}
