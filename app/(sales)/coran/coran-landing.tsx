import { Star as StarIcon } from "lucide-react";

import {
  type CoranLandingContent,
  formatCoranPrice,
} from "@/lib/coran-landing-content";
import { ReviewsMarquee } from "../offre-a-vie/reviews-marquee";
import { CoranCheckoutEmbed } from "./checkout-embed";
import { StickyPayBar } from "./sticky-pay-bar";

function Stars() {
  return (
    <div className="flex items-center gap-0.5 text-[#f6c343]">
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
      ))}
    </div>
  );
}

export function CoranLanding({ content }: { content: CoranLandingContent }) {
  const c = content;
  const priceLabel = c.showPrice
    ? formatCoranPrice(c.price.amountCents, c.price.currency)
    : null;
  const compareLabel =
    c.showPrice && c.price.compareAtCents > c.price.amountCents
      ? formatCoranPrice(c.price.compareAtCents, c.price.currency)
      : null;

  const hasImageReviews = c.reviewImages.length > 0;
  const hasTextReviews = c.reviews.length > 0;

  return (
    <div
      className="min-h-screen w-full font-sans"
      style={{ backgroundColor: c.bgColor, color: c.textColor }}
    >
      <style>{`html{scroll-behavior:smooth}`}</style>

      <div className="mx-auto max-w-[560px] px-4 pb-28 pt-4">
        {/* BANNERS */}
        {c.banners.length > 0 && (
          <div
            className={
              c.banners.length > 1
                ? "-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
                : ""
            }
          >
            {c.banners.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt=""
                className={`h-auto w-full shrink-0 rounded-2xl object-cover ${
                  c.banners.length > 1 ? "snap-center" : ""
                }`}
                style={c.banners.length > 1 ? { maxWidth: "85%" } : undefined}
              />
            ))}
          </div>
        )}

        {/* TITLE + PRICE */}
        <div className="mt-5">
          <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
            {c.title}
          </h1>
          {c.subtitle && (
            <p className="mt-2 text-[15px] leading-relaxed opacity-70">{c.subtitle}</p>
          )}
          {priceLabel && (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold">{priceLabel}</span>
              {compareLabel && (
                <span className="text-lg line-through opacity-40">{compareLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* BODY (free-form text + images) */}
        {c.body.length > 0 && (
          <div className="mt-7 space-y-4">
            {c.body.map((block, i) =>
              block.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={block.url}
                  alt=""
                  className="h-auto w-full rounded-2xl object-cover"
                />
              ) : (
                <p key={i} className="whitespace-pre-line text-[15px] leading-relaxed opacity-90">
                  {block.text}
                </p>
              ),
            )}
          </div>
        )}

        {/* REVIEWS */}
        {(hasImageReviews || hasTextReviews) && (
          <div className="mt-9">
            {c.reviewsHeading && (
              <h2 className="mb-3 font-display text-lg font-bold">{c.reviewsHeading}</h2>
            )}
            {/* Auto-scrolling screenshots (like landing V3) */}
            {hasImageReviews && <ReviewsMarquee images={c.reviewImages} />}
            {/* Optional text testimonials */}
            {hasTextReviews && (
              <div className={`space-y-3 ${hasImageReviews ? "mt-4" : ""}`}>
                {c.reviews.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 text-neutral-700 shadow-sm"
                  >
                    <Stars />
                    <p className="mt-2 text-sm leading-relaxed">{r.text}</p>
                    {r.name && (
                      <p className="mt-2 text-xs font-semibold text-neutral-500">{r.name}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHECKOUT */}
        <div className="mt-10">
          <h2 className="mb-3 font-display text-xl font-bold">Finalise ta commande</h2>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
            <CoranCheckoutEmbed />
          </div>
          {c.guarantee && (
            <p className="mt-3 text-center text-xs opacity-60">{c.guarantee}</p>
          )}
        </div>
      </div>

      {c.showStickyBar && (
        <StickyPayBar priceLabel={priceLabel} compareLabel={compareLabel} cta={c.ctaLabel} />
      )}
    </div>
  );
}
