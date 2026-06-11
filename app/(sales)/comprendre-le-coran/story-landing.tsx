import Image from "next/image";
import {
  BadgeCheck,
  BookOpen,
  Check,
  Gift,
  Lock,
  ShieldCheck,
  Star as StarIcon,
} from "lucide-react";

import { StickyReveal } from "./sticky-reveal";
import { TrackViewContent } from "./track-view-content";

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
        className="mx-auto aspect-[9/16] w-full max-w-[300px] rounded-3xl border border-neutral-200"
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
      className="mx-auto aspect-[9/16] w-full max-w-[300px] rounded-3xl bg-black"
    />
  );
}

/**
 * Turns a flat cover image into a 3D book mockup with a spine, page edges and
 * a soft floor shadow — so even a plain cover looks like a tangible product.
 */
function BookMockup({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="[perspective:1600px]">
      <div className="relative mx-auto aspect-[3/4] w-[220px] [transform:rotateY(-24deg)_rotateX(4deg)] [transform-style:preserve-3d] sm:w-[240px]">
        {/* page edges (right side, gives thickness) */}
        <div className="absolute right-[-14px] top-[1.5%] h-[97%] w-4 rounded-r-[3px] bg-gradient-to-r from-neutral-200 via-white to-neutral-300 [transform:rotateY(34deg)] [transform-origin:left]" />
        {/* cover */}
        <div className="relative h-full w-full overflow-hidden rounded-l-[4px] rounded-r-lg shadow-[0_30px_50px_-12px_rgba(0,0,0,0.45)]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="240px"
            className="object-cover"
          />
          {/* spine shading on the left + glossy sheen on the cover */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/15" />
        </div>
        {/* floor shadow */}
        <div className="absolute -bottom-5 left-1/2 h-5 w-[80%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-md" />
      </div>
    </div>
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

  // Value anchoring made coherent: sum the per-feature worths (the part after
  // "|", e.g. "App à vie | 97 €") so the struck "valeur réelle" always equals
  // what's actually listed. Falls back to the manual text if no values found.
  const valueSum = c.offerCard.features.reduce((sum, f) => {
    const after = f.includes("|") ? f.split("|").slice(1).join("|") : "";
    const n = parseFloat(after.replace(/[^0-9.,]/g, "").replace(",", "."));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const computedValueTotal =
    valueSum > 0
      ? `Valeur réelle : ${
          Number.isInteger(valueSum) ? valueSum : valueSum.toFixed(2).replace(".", ",")
        } €`
      : c.offerCard.valueTotal;

  // Hero image origin (Supabase) — preconnect so DNS+TLS run in parallel with
  // the HTML/CSS instead of serially before the LCP image's first byte.
  const heroSrc = c.hero.videoUrl
    ? null
    : c.hero.images[0] || c.hero.image || null;
  let heroOrigin: string | null = null;
  try {
    heroOrigin = heroSrc?.startsWith("http") ? new URL(heroSrc).origin : null;
  } catch {
    heroOrigin = null;
  }

  return (
    <div className="w-full bg-white font-sans text-neutral-900">
      {/* Smooth scrolling for the sticky bar's #offre anchor */}
      <style>{`html{scroll-behavior:smooth}`}</style>
      {heroOrigin && <link rel="preconnect" href={heroOrigin} />}
      {/* Early page-view beacon: fires on HTML parse (BEFORE React hydration),
          so cold TikTok visitors who bounce in <1s are still counted. Sets a
          flag so <LandingAnalytics> doesn't double-fire lp_view. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{if(window.__qlViewSent)return;window.__qlViewSent=1;var k="ql_sid",s;try{s=localStorage.getItem(k);if(!s){s=(self.crypto&&crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2));localStorage.setItem(k,s);}}catch(e){s="anon-"+Math.random().toString(36).slice(2);}var p=JSON.stringify({event:"lp_view",path:location.pathname,locale:document.documentElement.lang||"fr",sessionId:s});if(navigator.sendBeacon){navigator.sendBeacon("/api/track",new Blob([p],{type:"application/json"}));}else{fetch("/api/track",{method:"POST",body:p,headers:{"Content-Type":"application/json"},keepalive:true});}}catch(e){}})();`,
        }}
      />
      <LandingAnalytics />
      <TrackViewContent value={priceValue} />

      {/* HERO — warm cream background + soft violet halo behind the title */}
      <section className="relative overflow-hidden bg-[#FAF8F3]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-[#6967fb]/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-[680px] px-5 pb-10 pt-5 text-center sm:pt-7">
        {/* MEDIA FIRST — TikTok traffic is visual: instant recognition of the
            ad creative confirms "you're in the right place" before any text.
            Priority: video > swipeable slides (mirrors a carousel ad) > image. */}
        {c.hero.videoUrl ? (
          <div className="mb-5">
            <AdVideo url={c.hero.videoUrl} />
          </div>
        ) : c.hero.images.length > 1 ? (
          <div className="mb-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* leading spacer so slide 1 sits centered with a peek of slide 2 */}
            <div className="w-[7vw] shrink-0 sm:w-10" aria-hidden />
            {c.hero.images.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square w-[78vw] max-w-[330px] shrink-0 snap-center overflow-hidden rounded-3xl"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 78vw, 330px"
                  className="object-cover"
                  priority={i === 0}
                  // Uploads are already compressed WebP — skip the Next image
                  // optimizer so the hero (LCP) isn't blocked by its cold-start
                  // transcode; serve straight from the Supabase CDN.
                  unoptimized
                />
              </div>
            ))}
            <div className="w-[7vw] shrink-0 sm:w-10" aria-hidden />
          </div>
        ) : c.hero.images[0] || c.hero.image ? (
          /* Square frame: shows the (square) ad artwork uncropped — compact
             enough to keep the headline near the fold. */
          <div className="relative mx-auto mb-5 aspect-square w-full max-w-[300px] overflow-hidden rounded-3xl sm:max-w-[330px]">
            <Image
              src={c.hero.images[0] || c.hero.image}
              alt=""
              fill
              sizes="(max-width: 640px) 80vw, 330px"
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        ) : null}

        <p className="text-sm font-semibold text-[#6967fb]">{c.hero.eyebrow}</p>
        <h1 className="mt-3 font-display text-[26px] font-bold leading-[1.15] text-neutral-950 sm:text-[40px] sm:leading-[1.1]">
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

        {/* Promise-at-a-glance stats strip */}
        {c.hero.stats.length > 0 && (
          <div className="mx-auto mt-8 flex max-w-[440px] items-stretch justify-center divide-x divide-neutral-200 rounded-2xl border border-neutral-200 bg-white py-3 shadow-sm">
            {c.hero.stats.map((st, i) => (
              <div key={i} className="flex-1 px-2 text-center">
                <p className="font-display text-xl font-bold text-[#6967fb]">
                  {st.value}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-neutral-500">
                  {st.label}
                </p>
              </div>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* STORY — the ad dialogue, bubble for bubble */}
      <section className="border-y border-neutral-200/70 bg-white">
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
                      : "rounded-bl-md border border-neutral-200 bg-neutral-50 text-neutral-800"
                  }`}
                >
                  {b.text}
                </p>
              </div>
            ))}
          </div>

          {/* Future pacing: project the visitor into the after */}
          {c.story.closing && (
            <p className="mx-auto mt-8 max-w-[480px] rounded-2xl bg-[#6967fb]/5 px-5 py-4 text-center text-[15px] font-medium leading-relaxed text-neutral-800">
              {c.story.closing}
            </p>
          )}
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
              <BookMockup src={c.book.image} alt={c.book.heading} />
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
              {/* Value anchoring: the real worth, struck through, above the price */}
              {computedValueTotal && (
                <p className="mt-3 text-sm text-white/60">
                  <span className="line-through decoration-white/40">
                    {computedValueTotal}
                  </span>
                </p>
              )}
              <div className="mt-2 flex items-baseline justify-center gap-2">
                {/* Avoid a double strike-through: when the "valeur réelle"
                    line is shown above, it already carries the anchor. */}
                {compareLabel && !computedValueTotal && (
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

              <ul className="mx-auto mt-8 max-w-[380px] space-y-3 text-left">
                {c.offerCard.features.map((f) => {
                  // "Text | value" lines render the worth right-aligned.
                  const [text, value] = f.split("|").map((x) => x.trim());
                  return (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/90">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#a6a5ff]" strokeWidth={2.5} />
                      <span className="flex-1">{text}</span>
                      {value && (
                        <span className="shrink-0 font-semibold text-[#a6a5ff]">
                          {value}
                        </span>
                      )}
                    </li>
                  );
                })}
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

      {/* GUARANTEE — risk reversal with visual weight, right after the price */}
      <section className="mx-auto max-w-[680px] px-5 pt-12 sm:pt-16">
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-[#58cc6a]/40 bg-[#58cc6a]/5 p-6 text-center sm:flex-row sm:p-7 sm:text-left">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#58cc6a]/15">
            <ShieldCheck className="h-8 w-8 text-[#3fa34d]" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-neutral-950">
              {c.guaranteeBox.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
              {c.guaranteeBox.text}
            </p>
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

      {/* Sticky bottom CTA — revealed once the visitor scrolls past the hero,
          so it never covers the primary above-the-fold button. */}
      <StickyReveal>
        <div className="border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
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
      </StickyReveal>
    </div>
  );
}
