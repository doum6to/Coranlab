import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Clock,
  CreditCard,
  FileText,
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
            Apprends le vocabulaire qui couvre{" "}
            <span className="text-[#6967fb]">85% du Coran</span>.
          </h1>
          <p className="text-brilliant-muted text-base sm:text-lg max-w-[480px] leading-relaxed">
            L&apos;application qui te fait mémoriser les mots les plus
            fréquents du Coran, avec la répétition espacée et des exercices
            variés. Essaie 7 jours, paie si tu accroches.
          </p>

          <div className="flex flex-col items-center lg:items-start gap-2 w-full sm:w-auto">
            <Link
              href="/auth/signup?trial=true"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#6967fb] px-8 py-4 text-sm sm:text-base font-bold text-white uppercase tracking-wide shadow-[0_4px_0_0_#5250d4] transition hover:scale-[1.02] active:scale-[0.98] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[3px]"
            >
              Commencer mes 7 jours gratuits
            </Link>
            <p className="text-[11px] text-brilliant-muted">
              Puis 14,97€/mois · Résiliable en 1 clic
            </p>
          </div>

          <a
            href="#offres"
            className="text-xs text-brilliant-muted underline-offset-4 hover:underline"
          >
            Ou achète juste les PDFs à 9,99€ (paiement unique)
          </a>

          <div className="flex items-center gap-4 text-xs text-brilliant-muted">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              Aucun prélèvement pendant 7 jours
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              Paiement sécurisé Stripe
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  TESTIMONIALS — real TikTok reviews                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-y border-brilliant-border bg-brilliant-surface">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6967fb]/10 px-3 py-1 text-xs font-bold text-[#6967fb] uppercase tracking-wide mb-3">
              Avis TikTok vérifiés
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
              Ce qu&apos;ils en disent
            </h2>
            <p className="mt-2 text-brilliant-muted text-sm sm:text-base">
              Des commentaires laissés sur nos vidéos TikTok.
            </p>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  APP PREVIEW : exercise carousel                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-white overflow-hidden">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
            <LandingMascot
              src="/animations/hi_ok.riv"
              stateMachines="State Machine 1"
              scrollTrigger
              className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] mb-3"
            />
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
              Des exercices variés pour ancrer chaque mot
            </h2>
            <p className="mt-3 text-brilliant-muted text-sm sm:text-base max-w-[540px]">
              QCM, flashcards, associations, anagrammes... Chaque mot est vu
              sous plusieurs angles pour que ton cerveau le retienne pour de
              bon.
            </p>
          </div>
        </div>
        <ExerciseCarousel />
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 pt-8 sm:pt-10 pb-16 sm:pb-20 text-center">
          <p className="text-xs text-brilliant-muted">
            Tu testes tout pendant 7 jours, sans aucun prélèvement.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  3 BÉNÉFICES CLÉS                                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-y border-brilliant-border bg-brilliant-surface">
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <BookOpen className="h-6 w-6 text-[#6967fb]" />,
                title: "85% du Coran couvert",
                text: "En maîtrisant les mots les plus fréquents, tu comprends la majeure partie du texte coranique.",
              },
              {
                icon: <Smartphone className="h-6 w-6 text-[#6967fb]" />,
                title: "5 min par jour suffisent",
                text: "Des leçons courtes, la répétition espacée fait le reste. Tu progresses sans y penser.",
              },
              {
                icon: <InfinityIcon className="h-6 w-6 text-[#6967fb]" />,
                title: "Les PDFs offerts",
                text: "L'abonnement inclut aussi les documents PDF téléchargeables, pour réviser hors-ligne.",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border-2 border-b-4 border-brilliant-border bg-white p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6967fb]/10">
                  {b.icon}
                </div>
                <h3 className="mt-4 text-base font-bold font-heading text-brilliant-text">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-brilliant-muted leading-relaxed">
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
            <p className="mt-3 text-brilliant-muted text-sm sm:text-base max-w-[520px] mx-auto">
              L&apos;application pour apprendre en pratiquant, ou les PDFs
              seuls pour apprendre à ton rythme.
            </p>
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
              Les questions qu&apos;on nous pose
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
          <div className="flex flex-col items-center text-center gap-6">
            <LandingMascot
              src="/animations/eyes_down.riv"
              animationName="eyes down"
              className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]"
            />
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text max-w-md">
              Prêt à comprendre ce que tu récites ?
            </h2>
            <p className="text-brilliant-muted text-sm sm:text-base max-w-sm">
              Essaie l&apos;application pendant 7 jours, complètement
              gratuit. Si ça te plaît, tu continues pour 14,97€/mois.
            </p>
            <Link
              href="/auth/signup?trial=true"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6967fb] px-8 py-4 text-sm sm:text-base font-bold text-white uppercase tracking-wide shadow-[0_4px_0_0_#5250d4] transition hover:scale-[1.02] active:scale-[0.98] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[3px]"
            >
              Commencer mes 7 jours gratuits
            </Link>
            <p className="flex items-center gap-1.5 text-xs text-brilliant-muted">
              <CreditCard className="h-3 w-3" />
              CB demandée à l&apos;inscription, aucun prélèvement pendant 7 jours
            </p>
            <a
              href="#offres"
              className="text-xs text-brilliant-muted underline-offset-4 hover:underline"
            >
              <FileText className="inline h-3 w-3 mr-1" />
              Ou juste les PDFs à 9,99€
            </a>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-brilliant-muted/80">
              <Clock className="h-3 w-3" />
              Livraison immédiate · Résiliable en 1 clic
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
