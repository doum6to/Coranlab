import type { Metadata } from "next";

import { getOfferSettings } from "@/lib/offer";
import { getLandingContent } from "@/lib/landing-content";
import { ProductLanding } from "../../offre-a-vie/product-landing";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Quranlab — Lifetime access to the app. Launch offer.",
  description:
    "Unlock the whole Quranlab app for life, in a single payment and with no subscription. Discounted launch offer, limited spots.",
  openGraph: {
    title: "Quranlab — Lifetime access",
    description:
      "One payment. The whole app, forever. No subscription.",
    url: "https://www.quranlab.app/en/offre-a-vie",
    siteName: "Quranlab",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.quranlab.app/hero.png",
        width: 1200,
        height: 630,
        alt: "Quranlab — Lifetime access",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quranlab — Lifetime access",
    description: "One payment. The whole app, forever.",
    images: ["https://www.quranlab.app/hero.png"],
  },
  alternates: {
    canonical: "https://www.quranlab.app/en/offre-a-vie",
    languages: {
      fr: "https://www.quranlab.app/offre-a-vie",
      en: "https://www.quranlab.app/en/offre-a-vie",
      es: "https://www.quranlab.app/es/offre-a-vie",
    },
  },
};

export default async function OffreAVieEnPage() {
  const [offer, content] = await Promise.all([
    getOfferSettings(),
    getLandingContent("en"),
  ]);
  return <ProductLanding content={content} offer={offer} locale="en" />;
}
