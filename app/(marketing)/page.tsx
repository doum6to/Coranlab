import type { Metadata } from "next";
import { JsonLd } from "@/components/blog/json-ld";

import { HomeHero } from "./home-hero";

// Fully static — served from the CDN with no server-side auth lookup.
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Quranlab — Apprends 85% des mots du Coran",
  description:
    "Application pour apprendre le vocabulaire du Coran. Maîtrise 85% des mots coraniques avec des leçons interactives et des exercices adaptés.",
  keywords: [
    "apprendre le coran",
    "vocabulaire coranique",
    "apprendre l'arabe coranique",
    "apprentissage coran en ligne",
    "mémoriser le coran",
    "hifz coran",
    "tajwid débutant",
  ],
  openGraph: {
    title: "Quranlab — Apprends 85% des mots du Coran",
    description:
      "Application pour apprendre le vocabulaire du Coran. Maîtrise 85% des mots coraniques avec des leçons interactives.",
    url: "https://www.quranlab.app",
    siteName: "Quranlab",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://www.quranlab.app/og.png",
        width: 1200,
        height: 630,
        alt: "Quranlab — Apprends le vocabulaire du Coran",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quranlab — Apprends 85% des mots du Coran",
    description: "Application pour apprendre le vocabulaire du Coran.",
    images: ["https://www.quranlab.app/og.png"],
  },
  alternates: { canonical: "https://www.quranlab.app" },
};

/**
 * Home page: Koji, the headline, the two ways in (new here → the guided start at /commencer,
 * already a learner → login) and one real exercise to try. The sales pages live on their own
 * URLs (/offre-a-vie, /comprendre-le-coran), fed by ads.
 */
export default function Home() {
  return (
    <>
      <JsonLd type="website" />
      <HomeHero />
    </>
  );
}
