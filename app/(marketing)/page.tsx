import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/blog/json-ld";

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
        url: "https://www.quranlab.app/hero.png",
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
    images: ["https://www.quranlab.app/hero.png"],
  },
  alternates: { canonical: "https://www.quranlab.app" },
};

/**
 * Minimal homepage: a single hero — illustration, title, subtitle and the two
 * entry points (new user → onboarding, returning user → login). The sales
 * pages live on their own URLs (/offre-a-vie, /comprendre-le-coran), fed by
 * ads; the root no longer redirects there.
 */
export default function Home() {
  return (
    <>
      <JsonLd type="website" />

      <section className="mx-auto flex min-h-[calc(100dvh-140px)] w-full max-w-[988px] flex-col items-center justify-center gap-8 px-6 py-12 sm:px-8 lg:flex-row lg:gap-12">
        <div className="relative h-[220px] w-[220px] shrink-0 sm:h-[300px] sm:w-[300px] lg:h-[400px] lg:w-[400px]">
          <Image
            src="/hero.png"
            fill
            alt="Quranlab"
            className="object-contain"
            style={{ mixBlendMode: "multiply" }}
            priority
            sizes="(max-width: 640px) 220px, (max-width: 1024px) 300px, 400px"
          />
        </div>

        <div className="flex flex-col items-center gap-y-6 sm:gap-y-8">
          <h1 className="max-w-[480px] text-center font-heading text-2xl font-bold leading-tight text-brilliant-text sm:text-3xl lg:text-4xl">
            Apprends, pratique et maîtrise 85% des mots du Coran.
          </h1>
          <p className="max-w-[400px] text-center text-sm text-brilliant-muted sm:text-base">
            La méthode fun et efficace pour comprendre ce que tu récites.
          </p>

          <div className="flex w-full max-w-[330px] flex-col items-center gap-y-3">
            <Link
              href="/onboarding"
              className="w-full rounded-2xl bg-[#6967fb] px-5 py-3 text-center text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_0_#4a48d4] transition-transform active:translate-y-1 active:shadow-none"
            >
              Je suis nouveau
            </Link>
            <Link
              href="/auth/login"
              className="w-full rounded-2xl border-2 border-brilliant-border bg-white px-5 py-3 text-center text-sm font-bold uppercase tracking-wide text-brilliant-text transition-colors hover:bg-neutral-50"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
