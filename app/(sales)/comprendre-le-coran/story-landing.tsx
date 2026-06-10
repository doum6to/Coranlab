import Image from "next/image";
import {
  BadgeCheck,
  BookOpen,
  Check,
  Gift,
  Lock,
  Star as StarIcon,
} from "lucide-react";

import type { OfferSettings } from "@/lib/offer";
import type { TikTokLandingContent } from "@/lib/tiktok-landing-content";
import type { LandingContent } from "@/lib/landing-content";
import { BuyButton } from "../offre-a-vie/buy-button";
import { Faq } from "../offre-a-vie/faq";
import { LandingReviews } from "../offre-a-vie/reviews";
import { OfferScarcity } from "../offre-a-vie/offer-scarcity";
import { PaymentBadges } from "../offre-a-vie/payment-badges";
import { LandingAnalytics } from "../offre-a-vie/landing-analytics";

function Stars() {
  return (
    <div className="flex items-center gap-0.5 text-[#f6c343]">
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
      ))}
    </div>
  );
}

/**
 * The ad itself, embedded for continuity: a TikTok URL renders the official
 * embed iframe; any other URL is treated as a direct video file.
 */
function AdVideo({ url }: { url: string }) {
  const tiktokId = url.match(/tiktok\.com\/.*video\/(\d+)/)?.[1];
  if (tiktokId) {
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
        title="Publicité Quranlab"
        loading="lazy"
        allow="encrypted-media"
        className="mx-auto mt-7 aspect-[9/16] w-full max-w-[320px] rounded-3xl border border-neutral-200"
      />
    );
  }
  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      src={url}
      controls
      playsInline
      preload="metadata"
      className="mx-auto mt-7 aspect-[9/16] w-full max-w-[320px] rounded-3xl bg-black"
    />
  );
}

/**
 * Story-driven sales page for cold TikTok traffic (/comprendre-le-coran).
 * Mirrors the 9-image couple-dialogue ad beat for beat: pain (listening
 * without understanding) → "500 words = 85%" → the book → contextual
 * translations + example verses → "Viens, on le prend ensemble".
 * Hero product = the 500-words ebook; lifetime app access is the bonus.
 */
export function StoryLanding({
  content,
  reviews,
  offer,
  priceLabel,
  compareLabel,
  priceValue,
}: {
  content: TikTokLandingContent;
  /** Reviews reused from the V3 landing content (no re-entry needed). */
  reviews: LandingContent["reviews"];
  offer: OfferSettings;
  priceLabel: string;
  compareLabel: string | null;
  priceValue: number;
}) {
  const c = content;

  return (
    <div className="w-full bg-white font-sans text-neutral-900">
      <LandingAnalytics />

      {/* Logo-only strip (ad traffic: no nav, no login, nothing to leak focus) */}
      <header className="border-b border-neutral-100">
        <div className="mx-auto flex max-w-[1000px] justify-center px-4 py-3">
          <Image
            src="/quranlab-logo.svg"
            alt="Quranlab"
            width={130}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-[680px] px-5 pb-10 pt-8 text-center sm:pt-12">
        <p className="text-sm font-semibold text-[#6967fb]">{c.hero.eyebrow}</p>
        <h1 className="mt-3 font-display text-[34px] font-bold leading-[1.1] text-neutral-950 sm:text-5xl">
          {c.hero.title}{" "}
          <span className="relative inline-block text-[#6967fb]">
            {c.hero.titleHighlight}
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-base leading-relaxed text-neutral-600">
          {c.hero.subtitle}
        </p>

        {/* Price shown up-front: at this ticket the price IS an argument. */}
        {c.hero.showPrice && (
          <div className="mt-5 flex items-baseline justify-center gap-2">
            <span className="font-display text-3xl font-bold text-neutral-950">
              {priceLabel}
            </span>
            {compareLabel && (
              <span className="text-lg text-neutral-400 line-through">
                {compareLabel}
              </span>
            )}
          </div>
        )}

        <div className="mx-auto mt-4 max-w-[380px]">
          <BuyButton
            label={c.hero.cta}
            subLabel={c.hero.ctaSub}
            priceValue={priceValue}
            variant="tiktok"
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <Stars />
          <span className="text-sm text-neutral-500">{c.hero.socialProof}</span>
        </div>
        <PaymentBadges badges={offer.paymentBadges} className="mt-3" />

        {/* Media AFTER the CTA so the buy button stays above the fold. The ad
            video wins over the still illustration when both are set. */}
        {c.hero.videoUrl ? (
          <AdVideo url={c.hero.videoUrl} />
        ) : c.hero.image ? (
          <div className="relative mx-auto mt-7 aspect-square w-full max-w-[340px] overflow-hidden rounded-3xl">
            <Image
              src={c.hero.image}
              alt=""
              fill
              sizes="(max-width: 640px) 90vw, 340px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}
      </section>

      {/* STORY — the ad dialogue, bubble for bubble */}
      <section className="bg-[#FAF8F3] border-y border-neutral-200/70">
        <div className="mx-auto max-w-[560px] px-5 py-12 sm:py-16">
          <h2 className="text-center font-display text-2xl font-bold text-neutral-950 sm:text-3xl">
            {c.story.heading}
          </h2>
          <div className="mt-8 space-y-3">
            {c.story.bubbles.map((b, i) => (
              <div
                key={i}
                className={`flex ${b.side === "right" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                    b.side === "right"
                      ? "rounded-br-md bg-[#6967fb] text-white"
                      : "rounded-bl-md border border-neutral-200 bg-white text-neutral-800"
                  }`}
                >
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METHOD — why 500 words are enough */}
      <section className="mx-auto max-w-[1000px] px-5 py-12 sm:py-16">
        <h2 className="text-center font-display text-2xl font-bold text-neutral-950 sm:text-3xl">
          {c.method.heading}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {c.method.cards.map((card, i) => (
            <div
              key={i}
              className="rounded-3xl border-2 border-neutral-900/10 bg-white p-6 text-center"
            >
              <h3 className="font-display text-lg font-bold text-neutral-950">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* THE BOOK + bonus stack */}
      <section className="bg-[#FAF8F3] border-y border-neutral-200/70">
        <div className="mx-auto grid max-w-[960px] items-center gap-8 px-5 py-12 sm:grid-cols-2 sm:py-16">
          <div className="mx-auto w-full max-w-[320px]">
            {c.book.image ? (
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src={c.book.image}
                  alt={c.book.heading}
                  fill
                  sizes="(max-width: 640px) 80vw, 320px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-white text-neutral-300">
                <BookOpen className="h-16 w-16" strokeWidth={1} />
              </div>
            )}
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-neutral-950 sm:text-3xl">
              {c.book.heading}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-neutral-600">
              {c.book.text}
            </p>
            <ul className="mt-5 space-y-2.5">
              {c.book.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#58cc6a]" strokeWidth={3} />
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <Gift className="h-4 w-4 text-[#6967fb]" strokeWidth={2} />
              {c.book.bonusHeading}
            </p>
            <ul className="mt-2.5 space-y-2.5">
              {c.book.bonuses.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#6967fb]" strokeWidth={2.5} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* "Flip through some pages" — real page screenshots, the strongest
            proof an ebook can give. Hidden until the admin uploads excerpts. */}
        {c.book.excerpts.length > 0 && (
          <div className="mx-auto max-w-[960px] px-5 pb-12 sm:pb-16">
            <h3 className="text-center font-display text-xl font-bold text-neutral-950 sm:text-2xl">
              {c.book.excerptsHeading}
            </h3>
            <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {c.book.excerpts.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] w-[220px] shrink-0 snap-center overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md sm:w-[260px]"
                >
                  <Image
                    src={src}
                    alt={`Extrait du livre — page ${i + 1}`}
                    fill
                    sizes="260px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* REVIEWS — reuse the V3 admin-uploaded screenshots/reviews */}
      <section className="mx-auto max-w-[1100px] px-5 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            {reviews.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-neutral-950 sm:text-3xl">
            {reviews.heading}
          </h2>
        </div>
        <LandingReviews items={reviews.items} screenshots={reviews.screenshots} />
      </section>

      {/* OFFER CARD */}
      <section id="offre" className="bg-[#FAF8F3] border-t border-neutral-200/70">
        {/* Short, specific testimonials right where hesitation peaks. */}
        {c.offerCard.testimonials.length > 0 && (
          <div className="mx-auto max-w-[680px] px-5 pt-12 sm:pt-16">
            <div className="grid gap-3 sm:grid-cols-2">
              {c.offerCard.testimonials.map((t, i) => (
                <figure
                  key={i}
                  className="rounded-2xl border border-neutral-200 bg-white p-4"
                >
                  <Stars />
                  <blockquote className="mt-2 text-sm leading-relaxed text-neutral-700">
                    « {t.text} »
                  </blockquote>
                  {t.name && (
                    <figcaption className="mt-2 text-xs font-semibold text-neutral-500">
                      — {t.name}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}
        <div className="mx-auto max-w-[560px] px-4 py-14 sm:py-20">
          <div className="relative overflow-hidden rounded-[32px] bg-neutral-950 p-8 text-white sm:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#6967fb] opacity-40 blur-3xl"
            />
            <div className="relative text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                {c.offerCard.eyebrow}
              </p>
              <div className="mt-4 flex items-baseline justify-center gap-2">
                {compareLabel && (
                  <span className="font-display text-3xl text-white/40 line-through">
                    {compareLabel}
                  </span>
                )}
                <span className="font-display text-6xl font-bold tracking-tight sm:text-7xl">
                  {priceLabel}
                </span>
                <span className="text-sm text-white/60">
                  {c.offerCard.priceSuffix}
                </span>
              </div>

              <ul className="mx-auto mt-8 max-w-[360px] space-y-3 text-left">
                {c.offerCard.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/90">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#a6a5ff]" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <BuyButton
                className="mt-8"
                label={c.offerCard.cta}
                subLabel={c.offerCard.ctaSub}
                priceValue={priceValue}
                variant="tiktok"
              />
              <OfferScarcity
                mode={offer.scarcityMode}
                tone="dark"
                joined={offer.spotsJoined}
                total={offer.spotsTotal}
                priceLabel={priceLabel}
                compareLabel={compareLabel ?? undefined}
                locale="fr"
              />
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
                <Lock className="h-3 w-3" strokeWidth={1.5} />
                {c.offerCard.guarantee}
              </p>
              <PaymentBadges badges={offer.paymentBadges} className="mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[760px] px-5 py-12 sm:py-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-neutral-950 sm:text-3xl">
          {c.faq.heading}
        </h2>
        <Faq items={c.faq.items} />
      </section>

      {/* FINAL CTA — echo of the ad's last frame */}
      <section className="bg-[#FAF8F3] border-t border-neutral-200/70">
        <div className="mx-auto max-w-[560px] px-5 py-14 text-center sm:py-16">
          <h2 className="font-display text-3xl font-bold text-neutral-950">
            {c.finalCta.title}
          </h2>
          <p className="mt-2 text-base text-neutral-600">{c.finalCta.subtitle}</p>
          <div className="mx-auto mt-6 max-w-[380px]">
            <BuyButton
              label={c.finalCta.cta}
              priceValue={priceValue}
              variant="tiktok"
            />
          </div>
        </div>
      </section>

      {/* Spacer so the sticky bar never covers the footer CTA */}
      <div aria-hidden className="h-20" />

      {/* Sticky bottom CTA — plain anchor to the offer card (no JS needed) */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[560px] items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            {compareLabel && (
              <span className="text-sm text-neutral-400 line-through">
                {compareLabel}
              </span>
            )}
            <span className="font-display text-xl font-bold text-neutral-950">
              {priceLabel}
            </span>
          </div>
          <a
            href="#offre"
            className="rounded-2xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white transition-all hover:brightness-[1.05] active:translate-y-0.5 active:border-b-0"
          >
            {c.hero.cta}
          </a>
        </div>
      </div>
    </div>
  );
}
