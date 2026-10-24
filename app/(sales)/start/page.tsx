import type { Metadata } from "next";

import { RivePreloads } from "@/components/rive-preloads";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { COMMENCER_EN } from "@/lib/commencer-en";

import { CommencerOnboarding } from "../commencer/onboarding";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Understand the Qur'an — Quranlab",
  robots: { index: false, follow: false },
};

/** English onboarding + lifetime paywall at /start (static content, no upsells). */
export default function CommencerEnPage({ searchParams }: { searchParams?: { step?: string } }) {
  return (
    <LocaleProvider locale="en">
      <RivePreloads />
      <CommencerOnboarding content={COMMENCER_EN} locale="en" initialStep={searchParams?.step === "paywall" ? "paywall" : undefined} />
    </LocaleProvider>
  );
}
