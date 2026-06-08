import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Lock } from "lucide-react";

import { LandingMascot } from "@/components/landing-mascot";
import { formatEuros, type OfferSettings } from "@/lib/offer";
import type { LandingContent } from "@/lib/landing-content";
import { BuyButton } from "./buy-button";
import { Faq } from "./faq";
import { DemoExercise } from "./demo-exercise";
import { SpotsProgress } from "./spots";
import { StickySpotsBar } from "./sticky-spots-bar";
import { Sparkle, Star, Loops } from "./doodles";

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(20,20,20,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20,20,20,0.05) 1px, transparent 1px)",
  backgroundSize: "30px 30px",
} as const;

/** Renders text with blank-line paragraphs and single-line breaks preserved. */
function Rich({ text }: { text: string }) {
  const paras = text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <div className="space-y-4 text-lg leading-relaxed text-neutral-700">
      {paras.map((p, i) => (
        <p key={i}>
          {p.split("\n").map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function LetterImage({ src, alt }: { src: string; alt: string }) {
  if (!src) return null;
  return (
    <div className="my-10 flex justify-center">
      <Image
        src={src}
        alt={alt}
        width={900}
        height={700}
        className="h-auto w-full max-w-[440px] rounded-2xl object-contain"
      />
    </div>
  );
}

export function LetterLanding({
  content,
  offer,
}: {
  content: LandingContent;
  offer: OfferSettings;
}) {
  const { priceCents, compareAtCents, spotsJoined, spotsTotal } = offer;
  const PRICE = formatEuros(priceCents);
  const COMPARE =
    compareAtCents > priceCents ? formatEuros(compareAtCents) : null;
  const priceValue = priceCents / 100;
  const L = content.letter;

  return (
    <div className="w-full bg-[#FAF8F3] text-neutral-900 font-sans">
      <StickySpotsBar
        joined={spotsJoined}
        total={spotsTotal}
        priceLabel={PRICE}
        compareLabel={COMPARE ?? undefined}
        ctaLabel={content.offer.stickyLabel}
      />

      {/* HEADER + LETTER OPENING */}
      <section className="bg-gradient-to-b from-[#f6c343] to-[#f0a92e] px-2 pt-2 pb-3 sm:px-4 sm:pt-4 sm:pb-5">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[40px] bg-[#FAF8F3]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={GRID_STYLE}
          />
          <div className="relative mx-auto max-w-[720px] px-6 sm:px-8 pt-5 pb-14 sm:pb-16">
            <div className="flex items-center justify-between">
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
                Voir l&apos;offre
              </a>
            </div>

            <div className="relative mt-10">
              <Sparkle className="absolute -left-2 top-0 h-6 w-6 text-[#6967fb] hidden sm:block" />
              <Loops className="absolute right-2 -top-3 h-6 w-20 text-[#f0a92e] hidden sm:block" />
              <h1 className="font-display font-bold text-3xl sm:text-[40px] leading-tight text-neutral-950">
                {L.greeting}
              </h1>
              <div className="mt-6">
                <Rich text={L.intro} />
              </div>
              {L.methodLine ? (
                <p className="mt-6 font-display text-lg font-semibold text-neutral-900">
                  {L.methodLine}
                </p>
              ) : null}
              <LetterImage src={L.image1} alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* INSIGHT */}
      <section className="bg-white">
        <div className="mx-auto max-w-[720px] px-6 sm:px-8 py-14 sm:py-20">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-neutral-950">
            {L.insightHeading}
          </h2>
          <div className="mt-5">
            <Rich text={L.insightBody} />
          </div>
          <LetterImage src={L.image2} alt="" />
        </div>
      </section>

      {/* HOW */}
      <section className="bg-[#FAF8F3] border-t border-neutral-200/70">
        <div className="mx-auto max-w-[720px] px-6 sm:px-8 py-14 sm:py-20">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-neutral-950">
            {L.howHeading}
          </h2>
          <div className="mt-5">
            <Rich text={L.howBody} />
          </div>
        </div>
      </section>

      {/* BONUSES */}
      <section className="bg-white border-t border-neutral-200/70">
        <div className="mx-auto max-w-[820px] px-6 sm:px-8 py-14 sm:py-20">
          <h2 className="text-center font-display font-bold text-2xl sm:text-3xl text-neutral-950">
            {L.bonusesHeading}
          </h2>
          <LetterImage src={L.bonusesImage} alt="" />
          <div className="mt-6 space-y-4">
            {L.bonuses.map((b, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-5 rounded-3xl border-2 border-neutral-900/10 bg-[#FAF8F3] p-5 sm:p-6"
              >
                {b.image ? (
                  <Image
                    src={b.image}
                    alt=""
                    width={300}
                    height={400}
                    className="h-auto w-[120px] shrink-0 self-center rounded-xl object-contain sm:self-start"
                  />
                ) : null}
                <div>
                  <h3 className="font-display font-bold text-lg text-neutral-950">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRY IT */}
      <DemoExercise />

      {/* OFFER CARD */}
      <section
        id="offre"
        className="bg-[#FAF8F3] border-t border-neutral-200/70"
      >
        <div className="mx-auto max-w-[560px] px-6 sm:px-8 py-16 sm:py-20">
          <div className="relative overflow-hidden rounded-[32px] bg-neutral-950 p-8 sm:p-12 text-white">
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
                <span className="text-sm text-white/60">une seule fois</span>
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
                subLabel={content.offer.buttonSub}
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
      </section>

      {/* CLOSING */}
      <section className="bg-white border-t border-neutral-200/70">
        <div className="mx-auto max-w-[640px] px-6 sm:px-8 py-16 sm:py-20 text-center">
          <LandingMascot
            src="/animations/eyes_down.riv"
            animationName="eyes down"
            className="mx-auto h-[110px] w-[110px]"
          />
          <div className="mt-6">
            <Rich text={L.closing} />
          </div>
          <div className="mt-8 flex justify-center">
            <a
              href="#offre"
              className="inline-flex items-center justify-center rounded-2xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-8 py-4 font-display text-base font-bold uppercase tracking-wide text-white transition-all hover:brightness-[1.05] active:translate-y-1 active:border-b-0"
            >
              {L.ctaLabel}
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#FAF8F3] border-t border-neutral-200/70">
        <div className="mx-auto max-w-[820px] px-6 sm:px-8 py-16 sm:py-20">
          <div className="text-center mb-10">
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              {content.faq.eyebrow}
            </p>
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
              {content.faq.heading}
            </h2>
          </div>
          <Faq items={content.faq.items} />
        </div>
      </section>

      <div aria-hidden className="h-24" />
    </div>
  );
}
