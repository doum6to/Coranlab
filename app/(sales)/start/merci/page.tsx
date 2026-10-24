import type { Metadata } from "next";

import { LocaleProvider } from "@/components/i18n/locale-provider";
import { CommencerMerciView } from "../../commencer/merci/merci-view";

export const metadata: Metadata = { title: "Access activated — Quranlab", robots: { index: false, follow: false } };

export default function CommencerEnMerci({ searchParams }: { searchParams?: { session_id?: string; upsell?: string; item?: string } }) {
  return (
    <LocaleProvider locale="en">
      <CommencerMerciView searchParams={searchParams} locale="en" />
    </LocaleProvider>
  );
}
