import { getVipSettings } from "@/lib/vip";
import { VipForm } from "./vip-form";

// Dynamic: the access code arrives via ?c= and access must never be cached.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Activer mon accès — Quranlab",
  robots: { index: false, follow: false },
};

export default async function AccesVipPage({
  searchParams,
}: {
  searchParams: { c?: string };
}) {
  const settings = await getVipSettings();
  const code = (searchParams.c || "").trim();
  const valid = !!code && code.toLowerCase() === settings.code.toLowerCase();

  return <VipForm intro={settings.intro} code={code} valid={valid} />;
}
