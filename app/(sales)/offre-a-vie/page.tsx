import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Infinity as InfinityIcon,
  Lock,
} from "lucide-react";

import { LandingMascot } from "@/components/landing-mascot";
import { Testimonials } from "../85motscoran/testimonials";
import { TrackView } from "../85motscoran/track-view";
import { BuyButton } from "./buy-button";
import { Faq } from "./faq";
import { SpotsProgress, StickySpotsBar } from "./spots";
import { ArrowDoodle, Loops, Sparkle, Squiggle, Star } from "./doodles";
import { getOfferSettings, formatEuros } from "@/lib/offer";

// ISR — regenerated on demand when the admin saves the offer settings, and
// at most every 60s otherwise. The price/counter are read from the DB.
export const revalidate = 60;

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(20,20,20,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20,20,20,0.05) 1px, transparent 1px)",
  backgroundSize: "30px 30px",
} as const;

export const metadata: Metadata = {
  title: "Quranlab — Accès à vie à l'application. Offre de lancement.",
  description:
    "Débloque toute l'application Quranlab à vie, en un seul paiement et sans abonnement. Offre de lancement à prix réduit, en nombre de places limité.",
  keywords: [
    "quranlab accès à vie",
    "application coran paiement unique",
    "apprendre les mots du coran",
    "vocabulaire coranique",
    "abonnement à vie coran",
  ],
  openGraph: {
    title: "Quranlab — Accès à vie pour 14,97€",
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
    title: "Quranlab — Accès à vie pour 14,97€",
    description: "Un seul paiement. Toute l'application, pour toujours.",
    images: ["https://www.quranlab.app/hero.png"],
  },
  alternates: { canonical: "https://www.quranlab.app/offre-a-vie" },
};

const avatars = ["/woman.svg", "/man.svg", "/girl.svg", "/boy.svg"];

const SECTION_IMG =
  "https://geeipdnizshcpdmcgvdv.supabase.co/storage/v1/object/public/images/coranlab";

const rows = [
  {
    img: `${SECTION_IMG}/01.png`,
    tint: "#6967fb",
    title: "Ludique, efficace, et à toi pour toujours",
    text: "Des leçons courtes et addictives, pensées pour que tu progresses vraiment — et un accès à vie, pour ne jamais t'arrêter.",
  },
  {
    img: `${SECTION_IMG}/02.png`,
    tint: "#46c4f2",
    title: "Fondé sur la science",
    text: "La répétition espacée te fait réviser chaque mot juste avant que tu l'oublies. C'est prouvé : c'est comme ça qu'on mémorise durablement.",
  },
  {
    img: `${SECTION_IMG}/03.png`,
    tint: "#f6923a",
    title: "Reste motivé",
    text: "Séries de jours, points d'XP, ligues et défis : on transforme l'apprentissage en une habitude qu'on a envie de tenir. Cinq minutes par jour suffisent.",
  },
];

export default async function OffreAViePage() {
  const { priceCents, spotsJoined, spotsTotal } = await getOfferSettings();
  const PRICE = formatEuros(priceCents);
  const priceValue = priceCents / 100;

  return (
    <div className="w-full bg-[#FAF8F3] text-neutral-900 font-sans">
      <TrackView />
      <StickySpotsBar joined={spotsJoined} total={spotsTotal} />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HERO — gold frame + grid, two columns                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-[#f6c343] to-[#f0a92e] px-2 pt-2 pb-3 sm:px-4 sm:pt-4 sm:pb-5">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[40px] bg-[#FAF8F3]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={GRID_STYLE}
          />

          <div className="relative px-5 sm:px-8 pt-5 sm:pt-6 pb-14 sm:pb-20">
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

            {/* hero grid */}
            <div className="mt-10 sm:mt-14 grid items-center gap-8 lg:gap-4 lg:grid-cols-2 max-w-[1080px] mx-auto">
              {/* mascot */}
              <div className="relative order-1 lg:order-none flex justify-center">
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute inset-0 -m-6 rounded-[44%] opacity-15 blur-2xl"
                    style={{ backgroundColor: "#6967fb" }}
                  />
                  <Sparkle className="absolute -left-4 top-2 h-7 w-7 text-neutral-900" />
                  <Star className="absolute -right-2 top-8 h-6 w-6 text-[#6967fb]" />
                  <Loops className="absolute left-1/2 -translate-x-1/2 -bottom-3 h-6 w-24 text-[#f0a92e]" />
                  <LandingMascot
                    src="/animations/eyes_down.riv"
                    animationName="eyes down"
                    className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px]"
                  />
                </div>
              </div>

              {/* copy + CTA */}
              <div className="relative text-center lg:text-left">
                <Squiggle className="absolute -top-6 right-6 h-5 w-16 text-[#46c4f2] hidden lg:block" />
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

                <h1 className="mt-6 font-display font-bold text-[40px] sm:text-[56px] lg:text-[60px] leading-[0.98] tracking-tight text-neutral-950">
                  La façon ludique d&apos;apprendre le Coran,{" "}
                  <span className="relative inline-block text-[#6967fb]">
                    à vie
                    <svg
                      viewBox="0 0 200 16"
                      className="absolute -bottom-1.5 left-0 w-full"
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

                <p className="mt-6 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-[460px] mx-auto lg:mx-0">
                  Un seul paiement de {PRICE}, aucun abonnement. Apprends 85%
                  des mots du Coran et garde ton accès pour toujours.
                </p>

                <div className="mt-8 flex flex-col gap-3 max-w-[360px] mx-auto lg:mx-0">
                  <BuyButton priceValue={priceValue} />
                  <Link
                    href="/auth/login"
                    className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-b-4 border-neutral-300 bg-white px-8 py-4 font-display text-base font-bold uppercase tracking-wide text-[#6967fb] transition-all hover:bg-neutral-50 active:translate-y-1 active:border-b-2"
                  >
                    J&apos;ai déjà un compte
                  </Link>
                </div>
                <p className="mt-4 text-xs text-neutral-500">
                  Paiement unique · Accès immédiat · Sécurisé par Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  TRUST BAR                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-white border-b border-neutral-200/70">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-8 py-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {[
              { icon: <Lock className="h-4 w-4" strokeWidth={2} />, text: "Paiement sécurisé Stripe" },
              { icon: <InfinityIcon className="h-4 w-4" strokeWidth={2} />, text: "Aucun abonnement" },
              { icon: <BadgeCheck className="h-4 w-4" strokeWidth={2} />, text: "Accès activé en 2 minutes" },
            ].map((t) => (
              <div
                key={t.text}
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] leading-tight sm:text-sm font-medium text-neutral-600"
              >
                <span className="text-[#6967fb]">{t.icon}</span>
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  ALTERNATING FEATURE ROWS (Duolingo-style)                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {rows.map((r, i) => (
        <section
          key={r.title}
          className={i % 2 === 0 ? "bg-[#FAF8F3]" : "bg-white"}
        >
          <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-14 sm:py-20">
            <div className="grid items-center gap-8 sm:gap-12 md:grid-cols-2">
              {/* themed illustration */}
              <div
                className={`flex justify-center ${
                  i % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                <div className="relative h-[280px] w-full max-w-[380px] sm:h-[360px]">
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-[42%] sm:h-[280px] sm:w-[280px]"
                    style={{ backgroundColor: r.tint, opacity: 0.1 }}
                  />
                  <Sparkle className="absolute left-5 top-3 h-6 w-6 text-neutral-900/60" />
                  <Star className="absolute right-6 bottom-6 h-5 w-5 text-neutral-900/25" />
                  <Image
                    src={r.img}
                    alt={r.title}
                    fill
                    sizes="(max-width: 768px) 80vw, 380px"
                    className="relative object-contain p-1"
                  />
                </div>
              </div>

              {/* text */}
              <div
                className={`text-center md:text-left ${
                  i % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <h2 className="font-display font-bold text-3xl sm:text-4xl leading-tight text-neutral-950">
                  {r.title}
                </h2>
                <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-[460px] mx-auto md:mx-0">
                  {r.text}
                </p>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  LOWER SURFACE — tarif + avis + FAQ + CTA, same DA as the hero  */}
      {/*  (gold frame + graph grid + doodles)                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-[#f6c343] to-[#f0a92e] px-2 py-3 sm:px-4 sm:py-5">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[40px] bg-[#FAF8F3]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={GRID_STYLE}
          />
          <Star className="absolute left-6 top-10 h-6 w-6 text-[#6967fb] hidden sm:block" />
          <Sparkle className="absolute right-8 top-[36%] h-6 w-6 text-neutral-900/70 hidden sm:block" />
          <Loops className="absolute left-10 bottom-[30%] h-6 w-24 text-[#f0a92e] hidden sm:block" />

          <div className="relative divide-y divide-neutral-900/[0.06]">
            {/* TARIF — price anchor */}
            <div className="max-w-[720px] mx-auto px-6 sm:px-8 py-16 sm:py-20 text-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
                Fais le calcul
              </p>
              <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
                Un paiement. Pour toujours.
              </h2>
              <p className="mt-5 text-base text-neutral-600 leading-relaxed max-w-[520px] mx-auto">
                L&apos;abonnement, c&apos;est 14,97€ chaque mois — soit près de{" "}
                <span className="font-semibold text-neutral-900">
                  180€ par an
                </span>
                . L&apos;offre à vie, c&apos;est un paiement unique de{" "}
                <span className="font-semibold text-neutral-900">{PRICE}</span>,
                et l&apos;accès est à toi pour toujours. Réservé aux{" "}
                <span className="font-semibold text-neutral-900">
                  {spotsTotal.toLocaleString("fr-FR")} premiers élèves
                </span>
                .
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4 max-w-[440px] mx-auto">
                <div className="rounded-3xl border-2 border-neutral-200 bg-white p-6">
                  <p className="text-[11px] tracking-[0.15em] uppercase text-neutral-400">
                    Abonnement
                  </p>
                  <p className="mt-2 font-display font-bold text-3xl text-neutral-400 line-through">
                    14,97€
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    par mois · ~180€/an
                  </p>
                </div>
                <div className="rounded-3xl border-2 border-neutral-950 bg-white p-6">
                  <p className="text-[11px] tracking-[0.15em] uppercase text-[#6967fb]">
                    À vie
                  </p>
                  <p className="mt-2 font-display font-bold text-3xl text-neutral-950">
                    {PRICE}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    une seule fois
                  </p>
                </div>
              </div>
            </div>

            {/* AVIS — testimonials */}
            <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
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

            {/* TARIF — offer card */}
            <div
              id="offre"
              className="max-w-[560px] mx-auto px-6 sm:px-8 py-16 sm:py-20"
            >
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
                    <span className="text-sm text-white/60">
                      une seule fois
                    </span>
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
                    label={`Obtenir l'accès — ${PRICE}`}
                    priceValue={priceValue}
                  />

                  <SpotsProgress
                    tone="dark"
                    joined={spotsJoined}
                    total={spotsTotal}
                    priceLabel={PRICE}
                  />

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
                    <Lock className="h-3 w-3" strokeWidth={1.5} />
                    Paiement sécurisé via Stripe
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="max-w-[820px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
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

            {/* FINAL CTA */}
            <div className="relative max-w-[720px] mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
              <ArrowDoodle className="absolute left-10 top-12 h-10 w-10 text-neutral-900 hidden sm:block" />
              <LandingMascot
                src="/animations/eyes_down.riv"
                animationName="eyes down"
                className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] mx-auto"
              />
              <h2 className="mt-6 font-display font-bold text-3xl sm:text-5xl leading-[1.02] text-neutral-950">
                Ton accès, pour toujours.
              </h2>
              <p className="mt-5 text-base text-neutral-600">
                Un seul paiement de {PRICE}. Tu n&apos;y repenseras jamais.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3 max-w-[360px] mx-auto">
                <BuyButton className="w-full" priceValue={priceValue} />
                <p className="text-xs text-neutral-500">
                  Accès immédiat · Sécurisé par Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
