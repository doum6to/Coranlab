import type { Metadata, Viewport } from "next";

import { headers } from "next/headers";

import { RivePreloads } from "@/components/rive-preloads";
import { currencyForCountry } from "@/lib/geo-currency";
import { getCommencerContent } from "@/lib/commencer-content";

import { CommencerOnboarding } from "./onboarding";

// Country detection reads request headers → rendered per request.
export const dynamic = "force-dynamic";

// The funnel is white up to the top edge: the browser bar matches it.
export const viewport: Viewport = { themeColor: "#ffffff", viewportFit: "cover" };

export const metadata: Metadata = {
  title: "Comprends le Coran — Quranlab",
  robots: { index: false, follow: false },
};

export default async function CommencerPage({ searchParams }: { searchParams?: { step?: string } }) {
  const content = await getCommencerContent();
  return (
    <>
      <RivePreloads />
      <CommencerOnboarding currency={currencyForCountry(headers().get("x-vercel-ip-country") || headers().get("cf-ipcountry"))} content={content} initialStep={searchParams?.step} />
    </>
  );
}
