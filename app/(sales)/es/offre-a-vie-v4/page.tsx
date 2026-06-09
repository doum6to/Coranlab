import type { Metadata } from "next";

import { getOfferSettings } from "@/lib/offer";
import { getLandingContent } from "@/lib/landing-content";
import { ProductLanding } from "../../offre-a-vie/product-landing";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Quranlab — Comprende el 85% del Corán",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.quranlab.app/es/offre-a-vie-v4" },
};

export default async function OffreAVieV4EsPage() {
  const [offer, content] = await Promise.all([
    getOfferSettings(),
    getLandingContent("es", "v4"),
  ]);
  return <ProductLanding content={content} offer={offer} locale="es" variant="v4" />;
}
