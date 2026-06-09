import type { Metadata } from "next";

import { getOfferSettings } from "@/lib/offer";
import { getLandingContent } from "@/lib/landing-content";
import { ProductLanding } from "../offre-a-vie/product-landing";

export const revalidate = 60;

// A/B variant of the product landing (V4) — its own admin-editable content.
export const metadata: Metadata = {
  title: "Quranlab — Comprendre 85% du Coran",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.quranlab.app/offre-a-vie-v4" },
};

export default async function OffreAVieV4Page() {
  const [offer, content] = await Promise.all([
    getOfferSettings(),
    getLandingContent("fr", "v4"),
  ]);
  return <ProductLanding content={content} offer={offer} locale="fr" variant="v4" />;
}
