"use client";

/**
 * Two-row infinite marquee of uploaded review images. The top row scrolls
 * right→left and the bottom row scrolls left→right (same keyframe, reversed),
 * so both move at an identical, synchronised speed. Each track holds its list
 * twice and animates -50% for a seamless loop, and never pauses (including on
 * touch/hover) so the motion stays continuous.
 */
export function ReviewsMarquee({ images }: { images: string[] }) {
  const clean = images.filter(Boolean);
  if (!clean.length) return null;

  // Split into two rows; with a single image both rows reuse it.
  const top = clean.length > 1 ? clean.filter((_, i) => i % 2 === 0) : clean;
  const bottom = clean.length > 1 ? clean.filter((_, i) => i % 2 === 1) : clean;

  // One duration for both rows so they stay in lock-step. Slower with more
  // images so the perceived speed feels constant.
  const duration = Math.max(28, Math.max(top.length, bottom.length) * 9);

  return (
    <div className="relative -mx-4 space-y-3 overflow-hidden sm:mx-0">
      {/* edge fades spanning both rows */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-20" />

      <MarqueeRow images={top} duration={duration} />
      <MarqueeRow images={bottom} duration={duration} reverse />
    </div>
  );
}

function MarqueeRow({
  images,
  duration,
  reverse = false,
}: {
  images: string[];
  duration: number;
  reverse?: boolean;
}) {
  const loop = [...images, ...images];

  return (
    <ul
      className="flex w-max gap-3 px-4 will-change-transform"
      style={{
        animationName: "marqueeX",
        animationDuration: `${duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      {loop.map((src, i) => (
        <li key={i} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Avis d'un élève"
            loading="lazy"
            className="h-[150px] w-auto rounded-xl border border-neutral-200 bg-white object-contain shadow-sm sm:h-[190px]"
          />
        </li>
      ))}
    </ul>
  );
}
