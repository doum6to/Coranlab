import type { Metadata } from "next";

import { getOfferSettings } from "@/lib/offer";
import { getLandingContent } from "@/lib/landing-content";
import { ProductLanding } from "../../offre-a-vie/product-landing";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Quranlab — Understand 85% of the Qur'an",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.quranlab.app/en/offre-a-vie-v4" },
};

export default async function OffreAVieV4EnPage() {
  const [offer, content] = await Promise.all([
    getOfferSettings(),
    getLandingContent("en", "v4"),
  ]);
  return <ProductLanding content={content} offer={offer} locale="en" variant="v4" />;
}
