"use client";

import type { LandingReview } from "@/lib/landing-content";

/**
 * Two-row infinite marquee of admin-added text reviews — same motion as the
 * image marquee (top row scrolls left, bottom row right, never pauses). Both
 * rows render the same cards; the bottom row is rotated so it isn't a mirror.
 */
export function TextReviewsMarquee({ reviews }: { reviews: LandingReview[] }) {
  const clean = reviews.filter((r) => r && r.text);
  if (!clean.length) return null;

  const offset = Math.floor(clean.length / 2);
  const bottom = [...clean.slice(offset), ...clean.slice(0, offset)];
  const duration = Math.max(30, clean.length * 11);

  return (
    <div className="-mx-4 space-y-3 overflow-hidden sm:mx-0">
      <MarqueeRow reviews={clean} duration={duration} />
      {clean.length > 1 && (
        <MarqueeRow reviews={bottom} duration={duration} reverse />
      )}
    </div>
  );
}

function Stars() {
  return (
    <div className="mb-2 flex gap-0.5 text-[#f6c343]">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function MarqueeRow({
  reviews,
  duration,
  reverse = false,
}: {
  reviews: LandingReview[];
  duration: number;
  reverse?: boolean;
}) {
  const loop = [...reviews, ...reviews];

  return (
    <ul
      className="flex w-max gap-3 px-1.5 will-change-transform"
      style={{
        animationName: "marqueeX",
        animationDuration: `${duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      {loop.map((r, i) => (
        <li
          key={i}
          className="flex w-[260px] shrink-0 flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:w-[300px]"
        >
          <Stars />
          <p className="flex-1 text-sm leading-relaxed text-neutral-700">
            &ldquo;{r.text}&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-display font-semibold text-neutral-900">
              {r.author}
            </span>
            {r.handle ? (
              <span className="text-xs text-neutral-400">{r.handle}</span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
