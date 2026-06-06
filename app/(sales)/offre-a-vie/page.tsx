import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Infinity as InfinityIcon,
  Lock,
} from "lucide-react";

import { LandingMascot } from "@/components/landing-mascot";
import { TrackView } from "../85motscoran/track-view";
import { BuyButton } from "./buy-button";
import { Faq } from "./faq";
import { LandingReviews } from "./reviews";
import { DemoExercise } from "./demo-exercise";
import { SpotsProgress } from "./spots";
import { StickySpotsBar } from "./sticky-spots-bar";
import { ArrowDoodle, Loops, Sparkle, Star } from "./doodles";
import { getOfferSettings, formatEuros } from "@/lib/offer";
import { getLandingContent } from "@/lib/landing-content";

// ISR — regenerated on demand when the admin saves the offer settings or
// landing content, and at most every 60s otherwise.
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
    title: "Quranlab — Accès à vie",
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
    title: "Quranlab — Accès à vie",
    description: "Un seul paiement. Toute l'application, pour toujours.",
    images: ["https://www.quranlab.app/hero.png"],
  },
  alternates: { canonical: "https://www.quranlab.app/offre-a-vie" },
};

const avatars = ["/woman.svg", "/man.svg", "/girl.svg", "/boy.svg"];

export default async function OffreAViePage() {
  const [{ priceCents, compareAtCents, spotsJoined, spotsTotal }, content] =
    await Promise.all([getOfferSettings(), getLandingContent()]);

  const PRICE = formatEuros(priceCents);
  const COMPARE =
    compareAtCents > priceCents ? formatEuros(compareAtCents) : null;
  const priceValue = priceCents / 100;

  const trustIcons = [
    <Lock key="0" className="h-4 w-4" strokeWidth={2} />,
    <InfinityIcon key="1" className="h-4 w-4" strokeWidth={2} />,
    <BadgeCheck key="2" className="h-4 w-4" strokeWidth={2} />,
  ];

  return (
    <div className="w-full bg-[#FAF8F3] text-neutral-900 font-sans">
      <TrackView />
      <StickySpotsBar
        joined={spotsJoined}
        total={spotsTotal}
        priceLabel={PRICE}
        compareLabel={COMPARE ?? undefined}
      />

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

            {/* hero — centered column: title, subtitle, illustration, CTAs */}
            <div className="relative mt-10 sm:mt-14 flex flex-col items-center text-center max-w-[680px] mx-auto">
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
                  {content.hero.socialProof}
                </span>
              </div>

              {/* title */}
              <h1 className="mt-6 font-display font-bold text-[40px] sm:text-[56px] lg:text-[60px] leading-[0.98] tracking-tight text-neutral-950">
                {content.hero.titleLead}{" "}
                <span className="relative inline-block text-[#6967fb]">
                  {content.hero.titleHighlight}
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
              </h1>

              {/* subtitle */}
              <p className="mt-6 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-[460px] mx-auto">
                {content.hero.subtitle}
              </p>

              {/* illustration */}
              <div className="relative mt-10 flex justify-center">
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
                    className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px]"
                  />
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-10 flex w-full flex-col gap-3 max-w-[360px] mx-auto">
                <BuyButton
                  priceValue={priceValue}
                  label={content.hero.ctaPrimary}
                />
                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-b-4 border-neutral-300 bg-white px-8 py-4 font-display text-base font-bold uppercase tracking-wide text-[#6967fb] transition-all hover:bg-neutral-50 active:translate-y-1 active:border-b-2"
                >
                  {content.hero.ctaSecondary}
                </Link>
              </div>
              <p className="mt-4 text-xs text-neutral-500">
                Paiement unique · Accès immédiat · Sécurisé par Stripe
              </p>
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
            {content.trust.slice(0, 3).map((text, i) => (
              <div
                key={text}
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] leading-tight sm:text-sm font-medium text-neutral-600"
              >
                <span className="text-[#6967fb]">{trustIcons[i]}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  ALTERNATING FEATURE ROWS (Duolingo-style)                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {content.rows.map((r, i) => (
        <section
          key={`${r.title}-${i}`}
          className={i % 2 === 0 ? "bg-[#FAF8F3]" : "bg-white"}
        >
          <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-14 sm:py-20">
            <div className="grid items-center gap-8 sm:gap-12 md:grid-cols-2">
              {/* illustration */}
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
                  {r.image ? (
                    <Image
                      src={r.image}
                      alt={r.title}
                      fill
                      sizes="(max-width: 768px) 80vw, 380px"
                      className="relative object-contain p-1"
                    />
                  ) : null}
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
      {/*  VALUE STACK — ebook + bonuses                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-neutral-200/70">
        <div className="max-w-[820px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="text-center mb-10">
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              {content.valueStack.eyebrow}
            </p>
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
              {content.valueStack.heading}
            </h2>
            <p className="mt-4 text-base text-neutral-600 max-w-[480px] mx-auto">
              {content.valueStack.intro}
            </p>
          </div>

          <div className="space-y-3">
            {content.valueStack.items.map((item) => {
              const isBonus = item.badge.toUpperCase().startsWith("BONUS");
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border-2 border-neutral-900/10 bg-[#FAF8F3] p-4 sm:p-5"
                >
                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      isBonus
                        ? "bg-[#f6c343] text-neutral-900"
                        : "bg-[#6967fb] text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-neutral-950">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {item.value ? (
                      <span className="text-sm text-neutral-400 line-through">
                        {item.value}
                      </span>
                    ) : null}
                    {isBonus && (
                      <span className="block text-xs font-bold text-[#58cc6a]">
                        OFFERT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-neutral-950 p-6 text-center text-white">
            <p className="text-sm text-white/70">
              {content.valueStack.totalLabel}
              {COMPARE ? (
                <>
                  {" "}
                  <span className="font-bold text-white/90 line-through">
                    {COMPARE}
                  </span>
                </>
              ) : null}{" "}
              · Aujourd&apos;hui{" "}
              <span className="font-display text-xl font-bold text-white">
                {PRICE}
              </span>
            </p>
            <BuyButton
              className="w-full max-w-[320px]"
              label={content.offer.buttonLabel}
              priceValue={priceValue}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  INTERACTIVE DEMO                                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <DemoExercise />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  LOWER SURFACE — tarif + avis + FAQ + CTA, same DA as the hero  */}
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
                {content.priceAnchor.eyebrow}
              </p>
              <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
                {content.priceAnchor.heading}
              </h2>
              <p className="mt-5 text-base text-neutral-600 leading-relaxed max-w-[520px] mx-auto">
                {content.priceAnchor.body}
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

            {/* AVIS */}
            <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
              <div className="text-center mb-12">
                <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
                  {content.reviews.eyebrow}
                </p>
                <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
                  {content.reviews.heading}
                </h2>
              </div>
              <LandingReviews items={content.reviews.items} />
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
                    {content.offer.eyebrow}
                  </p>
                  <div className="mt-4 flex items-baseline justify-center gap-2">
                    {COMPARE && (
                      <span className="font-display text-3xl text-white/40 line-through">
                        {COMPARE}
                      </span>
                    )}
                    <span className="font-display font-bold text-6xl sm:text-7xl tracking-tight">
                      {PRICE}
                    </span>
                    <span className="text-sm text-white/60">
                      une seule fois
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/50">
                    {content.offer.cycleNote}
                  </p>

                  <ul className="mt-10 space-y-3 text-left max-w-[360px] mx-auto">
                    {content.offer.features.map((f) => (
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
                    label={content.offer.buttonLabel}
                    priceValue={priceValue}
                  />

                  <SpotsProgress
                    tone="dark"
                    joined={spotsJoined}
                    total={spotsTotal}
                    priceLabel={PRICE}
                    compareLabel={COMPARE ?? undefined}
                  />

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
                    <Lock className="h-3 w-3" strokeWidth={1.5} />
                    {content.offer.secure}
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="max-w-[820px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
              <div className="text-center mb-10 sm:mb-12">
                <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
                  {content.faq.eyebrow}
                </p>
                <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
                  {content.faq.heading}
                </h2>
              </div>
              <Faq items={content.faq.items} />
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
                {content.finalCta.heading}
              </h2>
              <p className="mt-5 text-base text-neutral-600">
                {content.finalCta.subtitle}
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

      {/* Clearance so the fixed bottom bar never covers the last content */}
      <div aria-hidden className="h-24" />
    </div>
  );
}
