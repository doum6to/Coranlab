import type { Metadata } from "next";
import Image from "next/image";
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Infinity as InfinityIcon,
  Zap,
} from "lucide-react";

import { LandingMascot } from "../landing-mascot";
import { PricingCards } from "./pricing-cards";
import { Faq } from "./faq";
import { ExerciseCarousel } from "./exercise-carousel";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Le vocabulaire qui couvre 85% du Coran : pack complet à 9,99€ | Quranlab",
  description:
    "Un pack de documents PDF qui contient les mots les plus fréquents du Coran (couvrant environ 85% du texte), classés par ordre de fréquence. Paiement unique 9,99€, envoyé par email.",
  keywords: [
    "apprendre les mots du coran",
    "vocabulaire coranique",
    "mots fréquents coran",
    "pdf mots coran",
    "85% coran",
    "cours coran",
  ],
  openGraph: {
    title: "Le vocabulaire qui couvre 85% du Coran : pack complet à 9,99€",
    description:
      "Documents PDF envoyés par email. Option application Quranlab disponible pour pratiquer au quotidien.",
    url: "https://www.quranlab.app/85motscoran",
    siteName: "Quranlab",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://www.quranlab.app/hero.png",
        width: 1200,
        height: 630,
        alt: "Le vocabulaire qui couvre 85% du Coran",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Le vocabulaire qui couvre 85% du Coran : pack à 9,99€",
    description: "Documents PDF envoyés par email, accessible à vie.",
    images: ["https://www.quranlab.app/hero.png"],
  },
  alternates: { canonical: "https://www.quranlab.app/85motscoran" },
};

export default function Page85MotsCoran() {
  return (
    <>
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
            Pack complet, accessible à vie
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brilliant-text leading-tight font-heading max-w-[540px]">
            Apprends le vocabulaire qui couvre{" "}
            <span className="text-[#6967fb]">85% du Coran</span>.
          </h1>
          <p className="text-brilliant-muted text-base sm:text-lg max-w-[480px] leading-relaxed">
            Un pack de documents PDF clair, organisé par fréquence, avec les
            mots les plus utilisés du Coran, leurs racines et leurs
            traductions. À toi de l&apos;apprendre à ton rythme. 9,99€
            paiement unique, envoyé par email.
          </p>
          <a
            href="#offres"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6967fb] px-8 py-4 text-sm sm:text-base font-bold text-white uppercase tracking-wide shadow-[0_4px_0_0_#5250d4] transition hover:scale-[1.02] active:scale-[0.98] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[3px]"
          >
            Voir l&apos;offre
            <ChevronRight className="h-4 w-4" />
          </a>
          <div className="flex items-center gap-4 text-xs text-brilliant-muted">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              Paiement sécurisé
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              Satisfait ou remboursé*
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  PROMESSE : 3 bénéfices clés                                   */}
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
                icon: <Download className="h-6 w-6 text-[#6967fb]" />,
                title: "Livré en 2 minutes",
                text: "Dès le paiement, tu reçois un email avec le lien vers tes documents. Aucune attente.",
              },
              {
                icon: <InfinityIcon className="h-6 w-6 text-[#6967fb]" />,
                title: "Accès à vie",
                text: "Télécharge les fichiers, imprime-les, partage-les en famille. Ils sont à toi pour toujours.",
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
      {/*  APERÇU DU CONTENU                                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <LandingMascot
            src="/animations/hi_ok.riv"
            stateMachines="State Machine 1"
            scrollTrigger
            className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] mb-3"
          />
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
            Ce que tu vas recevoir
          </h2>
          <p className="mt-3 text-brilliant-muted text-sm sm:text-base max-w-[520px]">
            Des documents pensés pour l&apos;apprentissage, avec une
            progression logique basée sur la fréquence d&apos;apparition dans
            le Coran.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Mots les plus fréquents",
              body: "Les 100, 300, 500 mots qui reviennent le plus. Par ordre de puissance d'impact.",
              arabic: "اللَّه · رَبّ · قَالَ",
            },
            {
              title: "Racines arabes classées",
              body: "Chaque mot rattaché à sa racine trilitère pour comprendre des familles entières.",
              arabic: "ك ت ب · ع ل م · ر ح م",
            },
            {
              title: "Traductions et contexte",
              body: "Pour chaque mot : sa traduction, sa fréquence, et son rôle dans les versets.",
              arabic: "nombre, sens, usage",
            },
            {
              title: "Verbes et particules",
              body: "Les verbes courants et les petits mots grammaticaux indispensables à la lecture.",
              arabic: "فِي · مِنْ · إِنَّ",
            },
            {
              title: "Mots thématiques",
              body: "Regroupements par thème : foi, prière, récits prophétiques, paradis, etc.",
              arabic: "إِيمَان · صَلَاة",
            },
            {
              title: "Format imprimable",
              body: "PDF optimisés pour l'impression papier ou la lecture sur écran, sans DRM.",
              arabic: "PDF · A4 · tous supports",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border-2 border-b-4 border-brilliant-border bg-white p-5 sm:p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6967fb]/10 mb-4">
                <FileText className="h-5 w-5 text-[#6967fb]" />
              </div>
              <h3 className="text-base font-bold font-heading text-brilliant-text">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-brilliant-muted leading-relaxed">
                {card.body}
              </p>
              <div className="mt-4 rounded-xl bg-brilliant-surface px-3 py-2 text-center">
                <p className="font-arabic text-lg text-brilliant-text">
                  {card.arabic}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  APP PREVIEW : exercises carousel                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-t border-brilliant-border bg-white overflow-hidden">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6967fb]/10 px-3 py-1 text-xs font-bold text-[#6967fb] uppercase tracking-wide mb-4">
              Aperçu de l&apos;application
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
              Des exercices variés pour ancrer chaque mot
            </h2>
            <p className="mt-3 text-brilliant-muted text-sm sm:text-base max-w-[540px] mx-auto">
              QCM, flashcards, associations, anagrammes... Chaque mot est vu
              sous plusieurs angles pour que ton cerveau le retienne pour de
              bon.
            </p>
          </div>
        </div>
        <ExerciseCarousel />
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 pt-8 sm:pt-10 pb-16 sm:pb-20 text-center">
          <p className="text-xs text-brilliant-muted">
            Inclus dans l&apos;offre complète avec l&apos;abonnement à
            l&apos;application.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  PRICING                                                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section
        id="offres"
        className="w-full border-y border-brilliant-border bg-brilliant-surface"
      >
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
              Choisis ta formule
            </h2>
            <p className="mt-3 text-brilliant-muted text-sm sm:text-base max-w-[520px] mx-auto">
              Le pack seul, ou le pack + l&apos;application pour pratiquer tous
              les jours.
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
              Commence aujourd&apos;hui. Paiement unique, livraison
              immédiate par email.
            </p>
            <a
              href="#offres"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6967fb] px-8 py-4 text-sm sm:text-base font-bold text-white uppercase tracking-wide shadow-[0_4px_0_0_#5250d4] transition hover:scale-[1.02] active:scale-[0.98] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[3px]"
            >
              Voir les offres
              <ChevronRight className="h-4 w-4" />
            </a>
            <p className="flex items-center gap-1.5 text-xs text-brilliant-muted">
              <Clock className="h-3 w-3" />
              Livraison en 2 minutes · Garantie effort-résultats*
            </p>
            <p className="text-[11px] text-brilliant-muted/80 max-w-[340px]">
              *Remboursement possible sur preuve d&apos;application sérieuse
              de la méthode. Détails dans la FAQ.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
