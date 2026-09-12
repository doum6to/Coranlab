import type { Metadata } from "next";

import { RivePreloads } from "@/components/rive-preloads";
import { getCommencerContent } from "@/lib/commencer-content";

import { CommencerOnboarding } from "./onboarding";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Comprends le Coran — Quranlab",
  robots: { index: false, follow: false },
};

export default async function CommencerPage({ searchParams }: { searchParams?: { step?: string } }) {
  const content = await getCommencerContent();
  return (
    <>
      <RivePreloads />
      <CommencerOnboarding content={content} initialStep={searchParams?.step === "paywall" ? "paywall" : undefined} />
    </>
  );
}
