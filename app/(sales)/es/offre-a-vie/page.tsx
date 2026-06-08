import type { Metadata } from "next";

import { getOfferSettings } from "@/lib/offer";
import { getLandingContent } from "@/lib/landing-content";
import { ProductLanding } from "../../offre-a-vie/product-landing";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Quranlab — Acceso de por vida a la aplicación. Oferta de lanzamiento.",
  description:
    "Desbloquea toda la aplicación Quranlab de por vida, con un solo pago y sin suscripción. Oferta de lanzamiento con descuento y plazas limitadas.",
  openGraph: {
    title: "Quranlab — Acceso de por vida",
    description:
      "Un solo pago. Toda la aplicación, para siempre. Sin suscripción.",
    url: "https://www.quranlab.app/es/offre-a-vie",
    siteName: "Quranlab",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "https://www.quranlab.app/hero.png",
        width: 1200,
        height: 630,
        alt: "Quranlab — Acceso de por vida",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quranlab — Acceso de por vida",
    description: "Un solo pago. Toda la aplicación, para siempre.",
    images: ["https://www.quranlab.app/hero.png"],
  },
  alternates: {
    canonical: "https://www.quranlab.app/es/offre-a-vie",
    languages: {
      fr: "https://www.quranlab.app/offre-a-vie",
      en: "https://www.quranlab.app/en/offre-a-vie",
      es: "https://www.quranlab.app/es/offre-a-vie",
    },
  },
};

export default async function OffreAVieEsPage() {
  const [offer, content] = await Promise.all([
    getOfferSettings(),
    getLandingContent("es"),
  ]);
  return <ProductLanding content={content} offer={offer} locale="es" />;
}
