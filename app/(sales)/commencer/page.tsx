import type { Metadata } from "next";

import { getCommencerContent } from "@/lib/commencer-content";
import { DA_FONT_CSS } from "@/lib/da-tokens";

import { CommencerOnboarding } from "./onboarding";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Comprends le Coran — Quranlab",
  robots: { index: false, follow: false },
};

/**
 * /commencer — Takallam-style onboarding funnel (paper DA). Content is
 * admin-editable (see lib/commencer-shared.ts); `?step=paywall` reopens the
 * paywall directly (Stripe cancel_url).
 */
export default async function CommencerPage({ searchParams }: { searchParams?: { step?: string } }) {
  const content = await getCommencerContent();
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DA_FONT_CSS }} />
      <CommencerOnboarding content={content} initialStep={searchParams?.step === "paywall" ? "paywall" : undefined} />
    </>
  );
}
