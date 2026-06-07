import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Clock, Play, ShieldCheck, X } from "lucide-react";

import { formatEuros } from "@/lib/offer";
import { getArabicLandingContent } from "@/lib/arabic-landing-content";
import { isEmbedUrl as isEmbed, toEmbedSrc as embedSrc } from "@/lib/video-embed";
import { BuyButton } from "./buy-button";
import { StickyCta } from "./sticky-cta";
import { ProgramList } from "./program-list";

export const dynamic = "force-static";
export const revalidate = 3600;

const GOLD = "#e0b34a";

export const metadata: Metadata = {
  title: "Lire l'arabe en moins de 7h — sans devoirs, sans cahier | Quranlab",
  description:
    "La méthode pour apprendre à lire l'arabe en moins de 7h, sans devoirs, sans stylo et sans cahier. 21 cours en vidéo. Accès à vie, paiement unique, satisfait ou remboursé.",
  alternates: { canonical: "https://www.quranlab.app/lire-larabe" },
  openGraph: {
    title: "Lire l'arabe en moins de 7h",
    description: "Sans devoirs, sans stylo et sans cahier. 21 cours en vidéo.",
    url: "https://www.quranlab.app/lire-larabe",
    siteName: "Quranlab",
    locale: "fr_FR",
    type: "website",
  },
};

const TrustIcon = [ShieldCheck, Clock, Check];

function VideoBox({
  url,
  label,
  className,
  vertical,
}: {
  url?: string;
  label: string;
  className?: string;
  vertical?: boolean;
}) {
  const ratio = vertical ? "aspect-[9/16]" : "aspect-video";
  if (url) {
    if (isEmbed(url)) {
      return (
        <div
          className={`relative ${ratio} w-full overflow-hidden rounded-2xl border border-white/10 bg-black ${className ?? ""}`}
        >
          <iframe
            src={embedSrc(url)}
            title={label}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <video
        src={url}
        controls
        className={`${ratio} w-full overflow-hidden rounded-2xl border border-white/10 bg-black object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      className={`relative flex ${ratio} w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ${className ?? ""}`}
    >
      <div className="flex flex-col items-center gap-2 text-white/40">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: GOLD }}
        >
          <Play className="h-6 w-6 fill-neutral-900 text-neutral-900" />
        </span>
        <span className="px-3 text-center text-xs">{label}</span>
      </div>
    </div>
  );
}

export default async function LireLArabePage() {
  const c = await getArabicLandingContent();
  const price = formatEuros(c.pricing.priceCents);
  const compareAt = formatEuros(c.pricing.compareAtCents);
  const priceEuros = c.pricing.priceCents / 100;

  return (
    <div className="w-full bg-neutral-950 text-white">
      <StickyCta label={c.sticky.label} ctaLabel={c.sticky.ctaLabel} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(224,179,74,0.18) 0%, rgba(224,179,74,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[860px] px-5 sm:px-8 pt-6 pb-14 sm:pb-20">
          <div className="flex justify-center">
            <Link href="/85motscoran" aria-label="Accueil Quranlab">
              <Image
                src="/quranlab-logo.svg"
                alt="Quranlab"
                width={160}
                height={52}
                priority
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
          </div>

          <div className="mt-12 text-center">
            <span
              className="inline-block rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ borderColor: `${GOLD}55`, color: GOLD }}
            >
              {c.hero.badge}
            </span>
            <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
              {c.hero.titleLead}{" "}
              <span style={{ color: GOLD }}>{c.hero.titleHighlight}</span> ?
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/70">
              {c.hero.subtitle}
            </p>
          </div>

          <div className="mt-10">
            <VideoBox url={c.hero.videoUrl} label={c.hero.videoLabel} />
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <a
              href="#tarifs"
              className="inline-flex w-full max-w-[360px] items-center justify-center gap-2 rounded-2xl border-b-4 border-[#a9801f] bg-gradient-to-b from-[#e9c15a] to-[#d9a93c] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-neutral-900 shadow-lg transition-all hover:brightness-[1.04] active:translate-y-1 active:border-b-0"
            >
              {c.hero.ctaLabel}
            </a>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/60">
              {c.trust.map((t, i) => {
                const Icon = TrustIcon[i % TrustIcon.length];
                return (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <Icon className="h-4 w-4" style={{ color: GOLD }} /> {t}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-[1000px] px-5 sm:px-8 py-14 sm:py-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              {c.testimonials.heading}
            </h2>
            <p className="mt-3 text-white/60">{c.testimonials.subheading}</p>
          </div>
          {/* Mobile: swipeable carousel of vertical videos. Desktop: 3-up grid. */}
          <div className="mt-10 -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
            {c.testimonials.items.map((t, i) => (
              <div
                key={i}
                className="w-[68%] shrink-0 snap-center sm:w-auto"
              >
                <VideoBox url={t.videoUrl} label={t.label} vertical />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="border-t border-white/10">
        <div className="mx-auto max-w-[560px] px-5 sm:px-8 py-16 sm:py-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              {c.pricing.heading}
            </h2>
            <p className="mt-3 text-sm text-white/60">{c.pricing.subheading}</p>
          </div>

          <div
            className="relative overflow-hidden rounded-[28px] border bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 sm:p-10"
            style={{ borderColor: `${GOLD}40` }}
          >
            <p
              className="text-center text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              {c.pricing.badge}
            </p>
            <p className="mt-1 text-center text-sm text-white/50">
              {c.pricing.cycleNote}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              {c.pricing.compareAtCents > c.pricing.priceCents && (
                <span className="text-2xl font-bold text-white/40 line-through">
                  {compareAt}
                </span>
              )}
              <span className="text-6xl font-extrabold" style={{ color: GOLD }}>
                {price}
              </span>
            </div>
            {c.pricing.savingLabel && (
              <p className="mt-2 text-center text-sm font-semibold text-[#e0b34a]">
                {c.pricing.savingLabel}
              </p>
            )}

            <ul className="mt-8 space-y-3">
              {c.pricing.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/85">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: GOLD }}
                    strokeWidth={3}
                  />
                  {f}
                </li>
              ))}
            </ul>

            <BuyButton
              className="mt-8"
              label={c.pricing.buttonLabel}
              priceEuros={priceEuros}
            />
            <p className="mt-3 text-center text-[11px] text-white/40">
              {c.pricing.secure}
            </p>
          </div>
        </div>
      </section>

      {/* MÉTHODE */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-[1000px] px-5 sm:px-8 py-16 sm:py-20">
          <div className="text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              {c.method.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
              {c.method.heading}
            </h2>
            <p className="mt-3 text-white/60">{c.method.subheading}</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {c.method.steps.map((s) => (
              <div
                key={s.n + s.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6"
              >
                <span
                  className="text-2xl sm:text-3xl font-extrabold"
                  style={{ color: GOLD }}
                >
                  {s.n}
                </span>
                <h3 className="mt-2 sm:mt-3 font-bold text-base sm:text-lg">
                  {s.title}
                </h3>
                <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-sm text-white/60 leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPITRES */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-[820px] px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold">
            {c.program.heading}
          </h2>
          <ProgramList chapters={c.program.chapters} />
        </div>
      </section>

      {/* COMPARISON */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold">
            {c.comparison.heading}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-bold text-white/70">
                {c.comparison.classicTitle}
              </h3>
              <ul className="mt-4 space-y-3">
                {c.comparison.classic.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-white/60"
                  >
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl border bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6"
              style={{ borderColor: `${GOLD}40` }}
            >
              <h3 className="font-bold" style={{ color: GOLD }}>
                {c.comparison.oursTitle}
              </h3>
              <ul className="mt-4 space-y-3">
                {c.comparison.ours.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-white/90"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: GOLD }}
                      strokeWidth={3}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-[760px] px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold">
            {c.faq.heading}
          </h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {c.faq.items.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-semibold text-white">{item.q}</span>
                  <span
                    className="text-xl transition-transform group-open:rotate-45"
                    style={{ color: GOLD }}
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-white/65">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <BuyButton
              className="mx-auto max-w-[360px]"
              label={c.pricing.buttonLabel}
              priceEuros={priceEuros}
            />
            <p className="mt-3 text-[11px] text-white/40">{c.pricing.secure}</p>
          </div>
        </div>
      </section>

      <div aria-hidden className="h-24" />
    </div>
  );
}
