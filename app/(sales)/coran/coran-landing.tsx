import { Star as StarIcon, Check as CheckIcon } from "lucide-react";

import {
  type CoranLandingContent,
  type CoranSectionKey,
  formatCoranPrice,
  formatFcfaFromEur,
  formatFcfaAmount,
} from "@/lib/coran-landing-content";
import { ReviewsMarquee } from "../offre-a-vie/reviews-marquee";
import { StickyPayBar } from "./sticky-pay-bar";
import { PaymentMethods } from "./payment-methods";
import { CoranSamples } from "./coran-samples";

function Stars() {
  return (
    <div className="flex items-center gap-0.5 text-[#f6c343]">
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
      ))}
    </div>
  );
}

export function CoranLanding({
  content,
  createCheckout,
  topSlot,
}: {
  content: CoranLandingContent;
  /** Variant checkout action (defaults to the /coran one inside PaymentMethods). */
  createCheckout?: () => Promise<{ clientSecret: string | null } | { error: string }>;
  /** Optional block rendered at the very top (e.g. the free lead-magnet capture). */
  topSlot?: React.ReactNode;
}) {
  const c = content;
  const priceLabel = c.showPrice
    ? formatCoranPrice(c.price.amountCents, c.price.currency)
    : null;
  const compareLabel =
    c.showPrice && c.price.compareAtCents > c.price.amountCents
      ? formatCoranPrice(c.price.compareAtCents, c.price.currency)
      : null;
  const fcfaLabel =
    c.showPrice && c.showFcfa
      ? c.fcfaAmount > 0
        ? formatFcfaAmount(c.fcfaAmount)
        : formatFcfaFromEur(c.price.amountCents, c.price.currency)
      : null;

  const hasImageReviews = c.reviewImages.length > 0;
  const hasTextReviews = c.reviews.length > 0;

  // Each reorderable section as a node (null = nothing to show → no gap).
  const sections: Record<CoranSectionKey, React.ReactNode> = {
    banners:
      c.banners.length > 0 ? (
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
      ) : null,

    title: (
      <div>
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
    ),

    body:
      c.body.length > 0 ? (
        <div className="space-y-4">
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
              <p
                key={i}
                className="whitespace-pre-line text-[15px] leading-relaxed opacity-90"
              >
                {block.text}
              </p>
            ),
          )}
        </div>
      ) : null,

    samples:
      c.samples.length > 0 ? (
        <CoranSamples heading={c.samplesHeading} samples={c.samples} />
      ) : null,

    gifs:
      c.gifs.length > 0 ? (
        <div className="space-y-4">
          {c.gifs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className="h-auto w-full rounded-2xl object-contain" />
          ))}
        </div>
      ) : null,

    reviews:
      hasImageReviews || hasTextReviews ? (
        <div>
          {c.reviewsHeading && (
            <h2 className="mb-3 font-display text-lg font-bold">{c.reviewsHeading}</h2>
          )}
          {hasImageReviews && <ReviewsMarquee images={c.reviewImages} />}
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
      ) : null,
  };

  return (
    <div
      className="min-h-screen w-full font-sans"
      style={{ backgroundColor: c.bgColor, color: c.textColor }}
    >
      <style>{`html{scroll-behavior:smooth}`}</style>

      <div className="mx-auto max-w-[560px] px-4 pb-28 pt-4">
        {topSlot && <div className="mb-8">{topSlot}</div>}

        {/* Reorderable sections (order set in admin via drag & drop) */}
        {c.sectionOrder.map((k) => {
          const node = sections[k];
          return node ? (
            <div key={k} className="mt-8 first:mt-0">
              {node}
            </div>
          ) : null;
        })}

        {/* CHECKOUT — always last (conversion anchor) */}
        <div id="checkout" className="mt-10 scroll-mt-4">
          <h2 className="mb-3 font-display text-xl font-bold">Finalise ta commande</h2>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-neutral-900 shadow-sm">
            {priceLabel && (
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold">{priceLabel}</span>
                {compareLabel && (
                  <span className="text-sm text-neutral-400 line-through">{compareLabel}</span>
                )}
                {fcfaLabel && (
                  <span className="ml-auto rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                    ≈ {fcfaLabel}
                  </span>
                )}
              </div>
            )}

            {c.showDeliverables && c.deliverables.length > 0 && (
              <ul className="mb-4 space-y-1.5">
                {c.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={3} />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}

            <PaymentMethods
              omEnabled={c.orangeMoney.enabled}
              om={c.orangeMoney}
              createCheckout={createCheckout}
            />
          </div>
          {c.guarantee && (
            <p className="mt-3 text-center text-xs opacity-60">{c.guarantee}</p>
          )}
        </div>
      </div>

      {c.showStickyBar && (
        <StickyPayBar
          priceLabel={priceLabel}
          compareLabel={compareLabel}
          cta={c.ctaLabel}
          headline={c.stickyBarText}
        />
      )}
    </div>
  );
}
