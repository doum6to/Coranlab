"use client";

/**
 * Two-row infinite marquee of uploaded review images. Both rows render the same
 * images (identical track width) so they share an exact pixel speed: the top
 * row scrolls right→left, the bottom row left→right (same keyframe, reversed).
 * The bottom row is rotated so it doesn't line up as a mirror of the top. Each
 * track holds its list twice and animates -50% for a seamless loop, and never
 * pauses (including on touch/hover) so the motion stays continuous.
 */

/**
 * Routes an image through the Next.js optimizer at a small width. The uploads
 * are full-resolution phone screenshots (~12 MP ≈ 45 MB decoded EACH); an
 * animated track holding 2× all of them blows past mobile GPU memory limits —
 * which is exactly when Safari/Chrome drop the composited layer (a row goes
 * blank) or the animation turns to slideshow. A 640px WebP is ~13× lighter.
 * `w` must be one of next.config's deviceSizes.
 */
const optimized = (src: string) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=640&q=70`;
export function ReviewsMarquee({ images }: { images: string[] }) {
  const clean = images.filter(Boolean);
  if (!clean.length) return null;

  // Offset the bottom row so the two lines don't read as a mirror image.
  const offset = Math.floor(clean.length / 2);
  const bottom = [...clean.slice(offset), ...clean.slice(0, offset)];

  // Same duration for both rows; identical width means identical pixel speed.
  // Slower with more images so the perceived speed feels constant.
  const duration = Math.max(28, clean.length * 9);

  return (
    <div className="-mx-4 space-y-3 overflow-hidden sm:mx-0">
      <MarqueeRow images={clean} duration={duration} />
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
      className="flex w-max gap-3 px-1.5 will-change-transform"
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
          {/* Eager (not lazy): lazy images inside a moving track arrive late
              and leave visible holes while the row scrolls. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={optimized(src)}
            alt="Avis d'un élève"
            loading="eager"
            decoding="async"
            className="h-[150px] w-auto rounded-xl border border-neutral-200 bg-white object-contain shadow-sm sm:h-[190px]"
          />
        </li>
      ))}
    </ul>
  );
}
