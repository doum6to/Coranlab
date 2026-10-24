import type { Metadata } from "next";

import { CommencerMerciView, type MerciParams } from "./merci-view";

export const metadata: Metadata = { title: "Accès activé — Quranlab", robots: { index: false, follow: false } };

export default async function CommencerMerci({ searchParams }: { searchParams?: MerciParams }) {
  return <CommencerMerciView searchParams={searchParams} locale="fr" />;
}
