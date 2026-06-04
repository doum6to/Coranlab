import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpenText,
  Infinity as InfinityIcon,
  Lock,
  RefreshCw,
  Smartphone,
  Sparkles as SparklesIcon,
} from "lucide-react";

import { LandingMascot } from "@/components/landing-mascot";
import { Testimonials } from "../85motscoran/testimonials";
import { ExerciseCarousel } from "../85motscoran/exercise-carousel";
import { TrackView } from "../85motscoran/track-view";
import { BuyButton } from "./buy-button";
import { Faq } from "./faq";
import { ArrowDoodle, Loops, Sparkle, Squiggle, Star } from "./doodles";

export const dynamic = "force-static";
export const revalidate = 3600;

const PRICE = "47€";

// Subtle graph-paper grid, like the reference.
const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(20,20,20,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20,20,20,0.05) 1px, transparent 1px)",
  backgroundSize: "30px 30px",
} as const;

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

const avatars = ["/woman.svg", "/man.svg", "/girl.svg", "/boy.svg"];

const heroCards = [
  { bg: "bg-[#46c4f2]", src: "/girl.svg", label: "Toutes les leçons" },
  { bg: "bg-[#6967fb]", src: "/mascot.svg", label: "Accès à vie", lift: true },
  { bg: "bg-[#f6923a]", src: "/boy.svg", label: "5 min / jour" },
];

const features = [
  {
    icon: <InfinityIcon className="h-5 w-5" strokeWidth={2} />,
    title: "Accès à vie",
    text: "Un seul paiement, et l'application est à toi pour toujours. Aucun abonnement, aucun prélèvement récurrent.",
  },
  {
    icon: <BookOpenText className="h-5 w-5" strokeWidth={2} />,
    title: "Toutes les leçons",
    text: "Tous les cours, tous les exercices, sans aucune limite. Tu apprends à ton rythme, du premier au dernier mot.",
  },
  {
    icon: <SparklesIcon className="h-5 w-5" strokeWidth={2} />,
    title: "Répétition espacée",
    text: "L'algorithme te fait réviser chaque mot juste avant que tu l'oublies. La mémorisation devient durable.",
  },
  {
    icon: <RefreshCw className="h-5 w-5" strokeWidth={2} />,
    title: "Mises à jour incluses",
    text: "Chaque nouvelle leçon et chaque amélioration future te sont offertes, sans jamais payer de supplément.",
  },
  {
    icon: <Smartphone className="h-5 w-5" strokeWidth={2} />,
    title: "Sur tous tes appareils",
    text: "Téléphone, tablette, ordinateur. Ta progression te suit partout, automatiquement.",
  },
  {
    icon: <BookOpenText className="h-5 w-5" strokeWidth={2} />,
    title: "Les PDF en bonus",
    text: "Tu reçois aussi les documents PDF « 85% des mots du Coran », offerts avec ton accès.",
  },
];

export default function OffreAViePage() {
  return (
    <div className="w-full bg-[#FAF8F3] text-neutral-900 font-sans">
      <TrackView />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HERO — gold frame + grid card                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-[#f6c343] to-[#f0a92e] px-2 pt-2 pb-3 sm:px-4 sm:pt-4 sm:pb-5">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[40px] bg-[#FAF8F3]">
          {/* graph-paper grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={GRID_STYLE}
          />

          <div className="relative px-5 sm:px-8 pt-5 sm:pt-6 pb-12 sm:pb-16">
            {/* top bar */}
            <div className="flex items-center justify-between max-w-[1080px] mx-auto">
              <Link href="/85motscoran" aria-label="Accueil Quranlab">
                <Image
                  src="/quranlab-logo.svg"
                  alt="Quranlab"
                  width={150}
                  height={48}
                  priority
                  className="h-9 sm:h-10 w-auto"
                />
              </Link>
              <a
                href="#offre"
                className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                Accès à vie
              </a>
            </div>

            {/* hero center */}
            <div className="relative max-w-[760px] mx-auto text-center mt-12 sm:mt-16">
              {/* doodles */}
              <Sparkle className="absolute -left-2 sm:left-6 top-10 h-7 w-7 text-neutral-900 hidden sm:block" />
              <Star className="absolute right-2 sm:right-10 top-2 h-6 w-6 text-[#6967fb] hidden sm:block" />
              <Loops className="absolute left-1/2 -translate-x-1/2 -top-2 h-6 w-20 text-[#f0a92e] hidden sm:block" />
              <Squiggle className="absolute -right-2 sm:right-8 bottom-28 h-5 w-16 text-[#46c4f2] hidden sm:block" />

              {/* social proof */}
              <div className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-sm">
                <div className="flex -space-x-2">
                  {avatars.map((src, i) => (
                    <span
                      key={src}
                      className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full ring-2 ring-white"
                      style={{
                        backgroundColor: [
                          "#46c4f2",
                          "#6967fb",
                          "#f6923a",
                          "#f6c343",
                        ][i],
                      }}
                    >
                      <Image
                        src={src}
                        alt=""
                        width={24}
                        height={24}
                        className="h-5 w-5 object-contain"
                      />
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium text-neutral-600">
                  Plus de 1 000 apprenants
                </span>
              </div>

              <h1 className="mt-7 font-display font-bold text-[44px] sm:text-[64px] lg:text-[76px] leading-[0.98] tracking-tight text-neutral-950">
                Toute l&apos;application,
                <br className="hidden sm:block" />{" "}
                <span className="relative inline-block text-[#6967fb]">
                  à vie
                  <svg
                    viewBox="0 0 200 16"
                    className="absolute -bottom-2 left-0 w-full"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M4 11C50 4 150 4 196 9"
                      stroke="#6967fb"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                .
              </h1>

              <p className="mt-7 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-[480px] mx-auto">
                Un seul paiement de {PRICE}. Aucun abonnement, jamais. Apprends
                le vocabulaire du Coran et garde ton accès pour toujours.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <BuyButton className="w-full sm:w-auto" />
                <a
                  href="#offre"
                  className="inline-flex items-center justify-center rounded-full border-2 border-neutral-300 bg-white px-7 py-3.5 text-sm font-semibold text-neutral-800 transition-transform hover:scale-[1.02] active:scale-[0.99]"
                >
                  En savoir plus
                </a>
              </div>
              <p className="mt-4 text-xs text-neutral-500">
                Paiement unique · Accès immédiat · Sécurisé par Stripe
              </p>
            </div>

            {/* colorful character cards */}
            <div className="relative mt-14 sm:mt-20 grid grid-cols-3 gap-3 sm:gap-5 max-w-[720px] mx-auto">
              <ArrowDoodle className="absolute -left-4 -top-10 h-10 w-10 text-neutral-900 hidden sm:block" />
              {heroCards.map((c) => (
                <div
                  key={c.label}
                  className={`relative flex aspect-[3/4] items-end justify-center overflow-hidden rounded-3xl ${c.bg} shadow-[0_18px_40px_-18px_rgba(0,0,0,0.4)] ${
                    c.lift ? "sm:-translate-y-5" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="absolute right-3 top-3 text-white/80"
                  >
                    <SparklesIcon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <Image
                    src={c.src}
                    alt=""
                    width={220}
                    height={260}
                    className="h-[78%] w-auto object-contain drop-shadow-sm"
                  />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-neutral-900">
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  TRUST BAR                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-white border-b border-neutral-200/70">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: <Lock className="h-4 w-4" strokeWidth={2} />, text: "Paiement sécurisé Stripe" },
              { icon: <InfinityIcon className="h-4 w-4" strokeWidth={2} />, text: "Aucun abonnement" },
              { icon: <BadgeCheck className="h-4 w-4" strokeWidth={2} />, text: "Accès activé en 2 minutes" },
            ].map((t) => (
              <div
                key={t.text}
                className="flex items-center justify-center gap-2 text-sm font-medium text-neutral-600"
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
      <section className="w-full bg-[#FAF8F3]">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              Ce que tu obtiens
            </p>
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
              Tout, sans limite, pour toujours
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border-2 border-neutral-900/10 bg-white p-7 flex flex-col transition-transform hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6967fb] text-white">
                  {f.icon}
                </div>
                <h3 className="mt-5 font-display font-semibold text-xl text-neutral-950">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
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
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
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
          <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
            {PRICE} une fois. Et c&apos;est tout.
          </h2>
          <p className="mt-5 text-base text-neutral-600 leading-relaxed max-w-[520px] mx-auto">
            L&apos;abonnement classique, c&apos;est 14,97€ chaque mois. Avec
            l&apos;offre à vie, tu es gagnant en moins de{" "}
            <span className="font-semibold text-neutral-900">quatre mois</span>{" "}
            — puis tout le reste est offert, pour toujours.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-[440px] mx-auto">
            <div className="rounded-3xl border-2 border-neutral-200 bg-white p-6">
              <p className="text-[11px] tracking-[0.15em] uppercase text-neutral-400">
                Abonnement
              </p>
              <p className="mt-2 font-display font-bold text-3xl text-neutral-400 line-through">
                14,97€
              </p>
              <p className="mt-1 text-xs text-neutral-400">par mois, à vie</p>
            </div>
            <div className="rounded-3xl border-2 border-neutral-950 bg-white p-6">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#6967fb]">
                À vie
              </p>
              <p className="mt-2 font-display font-bold text-3xl text-neutral-950">
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
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
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
          <div className="relative rounded-[32px] bg-neutral-950 text-white p-8 sm:p-12 overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#6967fb] opacity-40 blur-3xl"
            />
            <Star className="absolute left-6 top-6 h-6 w-6 text-white/30" />
            <div className="relative text-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-white/50">
                Accès à vie
              </p>
              <div className="mt-4 flex items-baseline justify-center gap-2">
                <span className="font-display font-bold text-6xl sm:text-7xl tracking-tight">
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
                      strokeWidth={2.5}
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
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
              Questions fréquentes
            </h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FINAL CTA                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-gradient-to-b from-[#f6c343] to-[#f0a92e] px-2 pb-3 pt-0 sm:px-4 sm:pb-5">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[40px] bg-[#FAF8F3]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={GRID_STYLE}
          />
          <div className="relative max-w-[720px] mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center">
            <LandingMascot
              src="/animations/eyes_down.riv"
              animationName="eyes down"
              className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] mx-auto"
            />
            <h2 className="mt-6 font-display font-bold text-3xl sm:text-5xl leading-[1.02] text-neutral-950">
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
        </div>
      </section>
    </div>
  );
}
