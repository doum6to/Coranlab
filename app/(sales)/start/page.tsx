import type { Metadata } from "next";

import { headers } from "next/headers";

import { RivePreloads } from "@/components/rive-preloads";
import { currencyForCountry } from "@/lib/geo-currency";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { COMMENCER_EN } from "@/lib/commencer-en";

import { CommencerOnboarding } from "../commencer/onboarding";

// Country detection reads request headers → rendered per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Understand the Qur'an — Quranlab",
  robots: { index: false, follow: false },
};

/** English onboarding + lifetime paywall at /start (static content, no upsells). */
export default function CommencerEnPage({ searchParams }: { searchParams?: { step?: string } }) {
  return (
    <LocaleProvider locale="en">
      <RivePreloads />
      <CommencerOnboarding currency={currencyForCountry(headers().get("x-vercel-ip-country") || headers().get("cf-ipcountry"))} content={COMMENCER_EN} locale="en" initialStep={searchParams?.step === "paywall" ? "paywall" : undefined} />
    </LocaleProvider>
  );
}
