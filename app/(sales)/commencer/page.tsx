import type { Metadata } from "next";

import { headers } from "next/headers";

import { RivePreloads } from "@/components/rive-preloads";
import { currencyForCountry } from "@/lib/geo-currency";
import { getCommencerContent } from "@/lib/commencer-content";

import { CommencerOnboarding } from "./onboarding";

// Country detection reads request headers → rendered per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comprends le Coran — Quranlab",
  robots: { index: false, follow: false },
};

export default async function CommencerPage({ searchParams }: { searchParams?: { step?: string } }) {
  const content = await getCommencerContent();
  return (
    <>
      <RivePreloads />
      <CommencerOnboarding currency={currencyForCountry(headers().get("x-vercel-ip-country") || headers().get("cf-ipcountry"))} content={content} initialStep={searchParams?.step === "paywall" ? "paywall" : undefined} />
    </>
  );
}
