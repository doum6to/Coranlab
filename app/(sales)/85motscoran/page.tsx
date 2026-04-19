import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Infinity as InfinityIcon, Sparkles } from "lucide-react";

import { LandingMascot } from "@/components/landing-mascot";
import { PricingCards } from "./pricing-cards";
import { Faq } from "./faq";
import { ExerciseCarousel } from "./exercise-carousel";
import { Testimonials } from "./testimonials";
import { TrackView } from "./track-view";
import { PremiumCta } from "./premium-cta";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Quranlab — Comprends 85% du Coran. Essai 7 jours gratuit.",
  description:
    "L'application qui t'enseigne le vocabulaire du Coran par la répétition espacée. 5 minutes par jour. 7 jours offerts, puis 14,97€/mois.",
  keywords: [
    "apprendre les mots du coran",
    "vocabulaire coranique",
    "application coran",
    "essai gratuit coran",
    "85% coran",
    "apprendre l'arabe coranique",
  ],
  openGraph: {
    title: "Quranlab — Comprends 85% du Coran",
    description:
      "Répétition espacée. 5 minutes par jour. Essai 7 jours gratuit.",
    url: "https://www.quranlab.app/85motscoran",
    siteName: "Quranlab",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://www.quranlab.app/hero.png",
        width: 1200,
        height: 630,
        alt: "Quranlab — 85% des mots du Coran",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quranlab — Comprends 85% du Coran",
    description: "Essai 7 jours gratuit.",
    images: ["https://www.quranlab.app/hero.png"],
  },
  alternates: { canonical: "https://www.quranlab.app/85motscoran" },
};

export default function Page85MotsCoran() {
  return (
    <div className="w-full bg-[#FAF8F3] text-neutral-900">
      <TrackView />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HERO                                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Subtle ornamental Arabic calligraphy in background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        >
          <span
            dir="rtl"
            className="font-arabic text-[240px] sm:text-[360px] lg:text-[480px] font-bold text-neutral-900/[0.04] leading-none"
          >
            اقْرَأْ
          </span>
        </div>

        <div className="relative max-w-[1040px] mx-auto px-6 sm:px-8 pt-8 sm:pt-10 pb-16 sm:pb-24">
          <div className="max-w-[720px] mx-auto text-center">
            <Link
              href="/"
              className="flex justify-center"
              aria-label="Accueil Quranlab"
            >
              <Image
                src="/quranlab-logo.svg"
                alt="Quranlab"
                width={180}
                height={72}
                priority
                className="h-14 sm:h-16 w-auto"
              />
            </Link>

            <div className="mt-16 sm:mt-24 inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-medium text-neutral-600 tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6967fb]" />
              Essai 7 jours offerts
            </div>

            <h1 className="mt-7 font-serif text-[48px] sm:text-[68px] lg:text-[84px] leading-[0.95] tracking-tight text-neutral-950">
              Comprends{" "}
              <span className="italic text-[#6967fb]">85% du Coran</span>.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-[520px] mx-auto">
              Cinq minutes par jour. La répétition espacée fait le reste.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              <LandingMascot
                src="/animations/eyes_down.riv"
                animationName="eyes down"
                className="w-[192px] h-[192px] sm:w-[240px] sm:h-[240px]"
              />
              <PremiumCta
                as="link"
                href="/auth/signup?trial=true"
                variant="dark"
              >
                Commencer mon essai gratuit
              </PremiumCta>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  TESTIMONIALS                                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-t border-neutral-200/70 bg-white">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              Avis TikTok vérifiés
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-neutral-950">
              Ils ont commencé avant toi
            </h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  APP PREVIEW : phone mockups carousel                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-t border-neutral-200/70 bg-[#FAF8F3] overflow-hidden">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-8 pt-16 sm:pt-24 pb-8 sm:pb-10">
          <div className="text-center">
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              L&apos;application
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-neutral-950">
              Ce qui se passe à l&apos;intérieur
            </h2>
            <p className="mt-4 text-base text-neutral-600 max-w-[440px] mx-auto">
              Des leçons courtes, des exercices variés, une progression qui
              s&apos;adapte à ton rythme.
            </p>
          </div>
        </div>
        <ExerciseCarousel />
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  METHOD : 3 principles                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-t border-neutral-200/70 bg-white">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              La méthode
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-neutral-950">
              Pourquoi ça marche
            </h2>
          </div>

          <div className="grid gap-px bg-neutral-200/70 border border-neutral-200/70 rounded-2xl overflow-hidden sm:grid-cols-3">
            {[
              {
                icon: <BookOpen className="h-5 w-5" strokeWidth={1.5} />,
                kicker: "Fréquence",
                title: "85% du Coran",
                text: "Les mots qui reviennent le plus, appris d'abord. Couverture maximale dès les premières leçons.",
              },
              {
                icon: <Sparkles className="h-5 w-5" strokeWidth={1.5} />,
                kicker: "Science",
                title: "Répétition espacée",
                text: "Tu revois chaque mot juste avant de l'oublier. L'algorithme s'adapte à ta mémoire.",
              },
              {
                icon: <InfinityIcon className="h-5 w-5" strokeWidth={1.5} />,
                kicker: "Rythme",
                title: "5 minutes par jour",
                text: "Leçons courtes, accessibles partout. La régularité bat l'intensité, chaque fois.",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="bg-white p-8 sm:p-10 flex flex-col"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">
                  {b.icon}
                </div>
                <p className="mt-6 text-[11px] tracking-[0.2em] uppercase text-neutral-500">
                  {b.kicker}
                </p>
                <h3 className="mt-2 font-serif text-xl text-neutral-950">
                  {b.title}
                </h3>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  PRICING                                                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section
        id="offres"
        className="w-full border-t border-neutral-200/70 bg-[#FAF8F3]"
      >
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              Deux offres
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-neutral-950">
              Trouve ta formule
            </h2>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FAQ                                                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-t border-neutral-200/70 bg-white">
        <div className="max-w-[820px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              FAQ
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-neutral-950">
              Questions fréquentes
            </h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FINAL CTA                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-t border-neutral-200/70 bg-[#FAF8F3]">
        <div className="max-w-[720px] mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center">
          <LandingMascot
            src="/animations/eyes_down.riv"
            animationName="eyes down"
            className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] mx-auto"
          />
          <h2 className="mt-6 font-serif text-3xl sm:text-5xl leading-[1.05] text-neutral-950">
            On commence ?
          </h2>
          <p className="mt-5 text-base text-neutral-600">
            Sept jours pour tester, sans condition.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <PremiumCta
              as="link"
              href="/auth/signup?trial=true"
              variant="dark"
            >
              Commencer mon essai gratuit
            </PremiumCta>
            <p className="text-xs text-neutral-500">
              Puis 14,97€/mois · Résiliable en 1 clic
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
