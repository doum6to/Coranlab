import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpenText,
  Infinity as InfinityIcon,
  Lock,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { LandingMascot } from "@/components/landing-mascot";
import { Testimonials } from "../85motscoran/testimonials";
import { ExerciseCarousel } from "../85motscoran/exercise-carousel";
import { TrackView } from "../85motscoran/track-view";
import { BuyButton } from "./buy-button";
import { Faq } from "./faq";

export const dynamic = "force-static";
export const revalidate = 3600;

const PRICE = "47€";

export const metadata: Metadata = {
  title: "Quranlab — Accès à vie à l'application. Paiement unique de 47€.",
  description:
    "Débloque toute l'application Quranlab à vie pour 47€. Un seul paiement, aucun abonnement. Apprends le vocabulaire du Coran par la répétition espacée.",
  keywords: [
    "quranlab accès à vie",
    "application coran paiement unique",
    "apprendre les mots du coran",
    "vocabulaire coranique",
    "abonnement à vie coran",
  ],
  openGraph: {
    title: "Quranlab — Accès à vie pour 47€",
    description:
      "Un seul paiement. Toute l'application, pour toujours. Aucun abonnement.",
    url: "https://www.quranlab.app/offre-a-vie",
    siteName: "Quranlab",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://www.quranlab.app/hero.png",
        width: 1200,
        height: 630,
        alt: "Quranlab — Accès à vie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quranlab — Accès à vie pour 47€",
    description: "Un seul paiement. Toute l'application, pour toujours.",
    images: ["https://www.quranlab.app/hero.png"],
  },
  alternates: { canonical: "https://www.quranlab.app/offre-a-vie" },
};

const features = [
  {
    icon: <InfinityIcon className="h-5 w-5" strokeWidth={1.5} />,
    title: "Accès à vie",
    text: "Un seul paiement, et l'application est à toi pour toujours. Aucun abonnement, aucun prélèvement récurrent.",
  },
  {
    icon: <BookOpenText className="h-5 w-5" strokeWidth={1.5} />,
    title: "Toutes les leçons",
    text: "Tous les cours, tous les exercices, sans aucune limite. Tu apprends à ton rythme, du premier au dernier mot.",
  },
  {
    icon: <Sparkles className="h-5 w-5" strokeWidth={1.5} />,
    title: "Répétition espacée",
    text: "L'algorithme te fait réviser chaque mot juste avant que tu l'oublies. La mémorisation devient durable.",
  },
  {
    icon: <RefreshCw className="h-5 w-5" strokeWidth={1.5} />,
    title: "Mises à jour incluses",
    text: "Chaque nouvelle leçon et chaque amélioration future te sont offertes, sans jamais payer de supplément.",
  },
  {
    icon: <Smartphone className="h-5 w-5" strokeWidth={1.5} />,
    title: "Sur tous tes appareils",
    text: "Téléphone, tablette, ordinateur. Ta progression te suit partout, automatiquement.",
  },
  {
    icon: <BookOpenText className="h-5 w-5" strokeWidth={1.5} />,
    title: "Les PDF en bonus",
    text: "Tu reçois aussi les documents PDF « 85% des mots du Coran », offerts avec ton accès.",
  },
];

export default function OffreAViePage() {
  return (
    <div className="w-full bg-[#FAF8F3] text-neutral-900">
      <TrackView />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HERO                                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        >
          <span
            dir="rtl"
            className="font-arabic text-[240px] sm:text-[360px] lg:text-[480px] font-bold text-neutral-900/[0.04] leading-none"
          >
            خُلُود
          </span>
        </div>

        <div className="relative max-w-[1040px] mx-auto px-6 sm:px-8 pt-8 sm:pt-10 pb-16 sm:pb-24">
          <div className="max-w-[720px] mx-auto text-center">
            <Link
              href="/85motscoran"
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
              Offre à vie · Paiement unique
            </div>

            <h1 className="mt-7 font-serif text-[44px] sm:text-[64px] lg:text-[80px] leading-[0.96] tracking-tight text-neutral-950">
              Toute l&apos;application,{" "}
              <span className="italic text-[#6967fb]">à vie</span>.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-[540px] mx-auto">
              Un seul paiement de {PRICE}. Aucun abonnement, jamais. Apprends
              le vocabulaire du Coran et garde ton accès pour toujours.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              <LandingMascot
                src="/animations/eyes_down.riv"
                animationName="eyes down"
                className="w-[192px] h-[192px] sm:w-[240px] sm:h-[240px]"
              />
              <BuyButton className="w-full max-w-[320px]" />
              <p className="text-xs text-neutral-500">
                Paiement unique de {PRICE} · Accès immédiat · Sécurisé par
                Stripe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  TRUST BAR                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-t border-neutral-200/70 bg-white">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              {
                icon: <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />,
                text: "Paiement sécurisé Stripe",
              },
              {
                icon: <InfinityIcon className="h-4 w-4" strokeWidth={1.5} />,
                text: "Aucun abonnement",
              },
              {
                icon: <BadgeCheck className="h-4 w-4" strokeWidth={1.5} />,
                text: "Accès activé en 2 minutes",
              },
            ].map((t) => (
              <div
                key={t.text}
                className="flex items-center justify-center gap-2 text-sm text-neutral-600"
              >
                <span className="text-[#6967fb]">{t.icon}</span>
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  WHAT YOU GET                                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-t border-neutral-200/70 bg-[#FAF8F3]">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              Ce que tu obtiens
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-neutral-950">
              Tout, sans limite, pour toujours
            </h2>
          </div>

          <div className="grid gap-px bg-neutral-200/70 border border-neutral-200/70 rounded-2xl overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="bg-white p-8 flex flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">
                  {f.icon}
                </div>
                <h3 className="mt-6 font-serif text-xl text-neutral-950">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  APP PREVIEW                                                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-t border-neutral-200/70 bg-white overflow-hidden">
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
      {/*  PRICE ANCHOR                                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-t border-neutral-200/70 bg-[#FAF8F3]">
        <div className="max-w-[720px] mx-auto px-6 sm:px-8 py-16 sm:py-24 text-center">
          <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
            Fais le calcul
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-neutral-950">
            {PRICE} une fois. Et c&apos;est tout.
          </h2>
          <p className="mt-5 text-base text-neutral-600 leading-relaxed max-w-[520px] mx-auto">
            L&apos;abonnement classique, c&apos;est 14,97€ chaque mois. Avec
            l&apos;offre à vie, tu es gagnant en moins de{" "}
            <span className="font-semibold text-neutral-900">
              quatre mois
            </span>{" "}
            — puis tout le reste est offert, pour toujours.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-[440px] mx-auto">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <p className="text-[11px] tracking-[0.15em] uppercase text-neutral-400">
                Abonnement
              </p>
              <p className="mt-2 font-serif text-3xl text-neutral-400 line-through">
                14,97€
              </p>
              <p className="mt-1 text-xs text-neutral-400">par mois, à vie</p>
            </div>
            <div className="rounded-2xl border-2 border-neutral-950 bg-white p-6">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#6967fb]">
                À vie
              </p>
              <p className="mt-2 font-serif text-3xl text-neutral-950">
                {PRICE}
              </p>
              <p className="mt-1 text-xs text-neutral-500">une seule fois</p>
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
      {/*  PRICING CARD                                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section
        id="offre"
        className="w-full border-t border-neutral-200/70 bg-[#FAF8F3]"
      >
        <div className="max-w-[560px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="relative rounded-3xl bg-neutral-950 text-white p-8 sm:p-12 overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#6967fb] opacity-30 blur-3xl"
            />
            <div className="relative text-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-white/50">
                Accès à vie
              </p>
              <div className="mt-4 flex items-baseline justify-center gap-2">
                <span className="font-serif text-6xl sm:text-7xl tracking-tight">
                  {PRICE}
                </span>
                <span className="text-sm text-white/60">une seule fois</span>
              </div>
              <p className="mt-2 text-xs text-white/50">
                Aucun abonnement · Aucun prélèvement récurrent
              </p>

              <ul className="mt-10 space-y-3 text-left max-w-[360px] mx-auto">
                {[
                  "Toutes les leçons et tous les exercices",
                  "Répétition espacée adaptative",
                  "Mises à jour et nouvelles leçons incluses",
                  "Sur tous tes appareils",
                  "Les documents PDF offerts en bonus",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-white/90"
                  >
                    <BadgeCheck
                      className="h-4 w-4 shrink-0 mt-0.5 text-[#a6a5ff]"
                      strokeWidth={2}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <BuyButton
                className="mt-10"
                label={`Obtenir l'accès à vie — ${PRICE}`}
              />

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
                <Lock className="h-3 w-3" strokeWidth={1.5} />
                Paiement sécurisé via Stripe
              </p>
            </div>
          </div>
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
            Ton accès, pour toujours.
          </h2>
          <p className="mt-5 text-base text-neutral-600">
            Un seul paiement de {PRICE}. Tu n&apos;y repenseras jamais.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <BuyButton className="w-full max-w-[320px]" />
            <p className="text-xs text-neutral-500">
              Accès immédiat · Sécurisé par Stripe
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
