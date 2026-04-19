import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Infinity as InfinityIcon,
  Smartphone,
  Zap,
} from "lucide-react";

import { LandingMascot } from "../landing-mascot";
import { PricingCards } from "./pricing-cards";
import { Faq } from "./faq";
import { ExerciseCarousel } from "./exercise-carousel";
import { Testimonials } from "./testimonials";
import { TrackView } from "./track-view";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Apprends 85% des mots du Coran : essaie l'app 7 jours gratuit | Quranlab",
  description:
    "L'application qui t'apprend les mots les plus fréquents du Coran via la répétition espacée. Essai 7 jours offerts, puis 14,97€/mois. Résiliable en 1 clic.",
  keywords: [
    "apprendre les mots du coran",
    "vocabulaire coranique",
    "application coran",
    "essai gratuit coran",
    "85% coran",
    "apprendre l'arabe coranique",
  ],
  openGraph: {
    title: "Apprends 85% des mots du Coran — essaie l'app 7 jours gratuit",
    description:
      "Répétition espacée, leçons courtes, exercices variés. Essai offert puis 14,97€/mois.",
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
    title: "Apprends 85% des mots du Coran — 7 jours gratuits",
    description:
      "Application Quranlab, essai offert. Résiliable en 1 clic.",
    images: ["https://www.quranlab.app/hero.png"],
  },
  alternates: { canonical: "https://www.quranlab.app/85motscoran" },
};

export default function Page85MotsCoran() {
  return (
    <>
      <TrackView />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HERO                                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-[988px] mx-auto w-full flex flex-col lg:flex-row items-center justify-center px-6 sm:px-8 py-12 sm:py-16 lg:py-20 gap-8 lg:gap-12">
        <div className="relative w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] lg:w-[400px] lg:h-[400px] shrink-0 order-1 lg:order-2">
          <Image
            src="/hero.png"
            fill
            alt="Quranlab"
            className="object-contain"
            style={{ mixBlendMode: "multiply" }}
            priority
            sizes="(max-width: 640px) 200px, (max-width: 1024px) 280px, 400px"
          />
        </div>
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-y-5 sm:gap-y-6 order-2 lg:order-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6967fb]/10 px-3 py-1 text-xs font-bold text-[#6967fb] uppercase tracking-wide">
            <Zap className="h-3 w-3" />
            Essai 7 jours offerts
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brilliant-text leading-tight font-heading max-w-[540px]">
            Comprends <span className="text-[#6967fb]">85% du Coran</span>.
          </h1>
          <p className="text-brilliant-muted text-base sm:text-lg max-w-[420px] leading-relaxed">
            5 min par jour. La répétition espacée fait le reste.
          </p>

          <div className="flex flex-col items-center lg:items-start gap-1.5 w-full sm:w-auto">
            <Link
              href="/auth/signup?trial=true"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#6967fb] px-8 py-4 text-sm sm:text-base font-bold text-white uppercase tracking-wide shadow-[0_4px_0_0_#5250d4] transition hover:scale-[1.02] active:scale-[0.98] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[3px]"
            >
              7 jours gratuits
            </Link>
            <p className="text-[11px] text-brilliant-muted">
              Puis 14,97€/mois · Résiliable en 1 clic
            </p>
          </div>

          <a
            href="#offres"
            className="text-xs text-brilliant-muted underline-offset-4 hover:underline"
          >
            Ou juste les PDFs à 9,99€
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  TESTIMONIALS — real TikTok reviews                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-y border-brilliant-border bg-brilliant-surface">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
              Avis TikTok
            </h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  APP PREVIEW : exercise carousel (phone mockups)                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-white overflow-hidden">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-8 pt-16 sm:pt-20 pb-8 sm:pb-10">
          <div className="flex flex-col items-center text-center">
            <LandingMascot
              src="/animations/hi_ok.riv"
              stateMachines="State Machine 1"
              scrollTrigger
              className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] mb-3"
            />
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
              L&apos;app, de l&apos;intérieur
            </h2>
          </div>
        </div>
        <ExerciseCarousel />
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  3 BÉNÉFICES CLÉS                                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-y border-brilliant-border bg-brilliant-surface">
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <BookOpen className="h-6 w-6 text-[#6967fb]" />,
                title: "85% du Coran",
                text: "Les mots qui reviennent le plus, en priorité.",
              },
              {
                icon: <Smartphone className="h-6 w-6 text-[#6967fb]" />,
                title: "5 min / jour",
                text: "Leçons courtes. Répétition espacée automatique.",
              },
              {
                icon: <InfinityIcon className="h-6 w-6 text-[#6967fb]" />,
                title: "PDFs offerts",
                text: "Les documents téléchargeables en bonus.",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border-2 border-b-4 border-brilliant-border bg-white p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6967fb]/10">
                  {b.icon}
                </div>
                <h3 className="mt-3 text-base font-bold font-heading text-brilliant-text">
                  {b.title}
                </h3>
                <p className="mt-1 text-sm text-brilliant-muted leading-relaxed">
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
        className="w-full bg-white"
      >
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
              Choisis ta formule
            </h2>
          </div>

          <PricingCards />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FAQ                                                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-y border-brilliant-border bg-brilliant-surface">
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
              Questions fréquentes
            </h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FINAL CTA                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-white">
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <div className="flex flex-col items-center text-center gap-5">
            <LandingMascot
              src="/animations/eyes_down.riv"
              animationName="eyes down"
              className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]"
            />
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text max-w-md">
              On se lance ?
            </h2>
            <Link
              href="/auth/signup?trial=true"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6967fb] px-8 py-4 text-sm sm:text-base font-bold text-white uppercase tracking-wide shadow-[0_4px_0_0_#5250d4] transition hover:scale-[1.02] active:scale-[0.98] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[3px]"
            >
              7 jours gratuits
            </Link>
            <p className="text-[11px] text-brilliant-muted">
              Puis 14,97€/mois · Résiliable en 1 clic
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
