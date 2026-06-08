"use client";

/**
 * Infinite, auto-scrolling marquee of TikTok review screenshots. The track
 * holds the list twice and animates -50% for a seamless loop; it pauses on
 * hover. Falls back to nothing when there are no screenshots.
 */
export function ReviewsMarquee({ images }: { images: string[] }) {
  const clean = images.filter(Boolean);
  if (!clean.length) return null;

  const loop = [...clean, ...clean];
  // Slower with more images so the speed feels constant.
  const duration = Math.max(24, clean.length * 7);

  return (
    <div className="group relative -mx-4 overflow-hidden sm:mx-0">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-16" />

      <ul
        className="flex w-max gap-4 px-4 will-change-transform group-hover:[animation-play-state:paused]"
        style={{
          animationName: "marqueeX",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {loop.map((src, i) => (
          <li key={i} className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Avis TikTok d'un élève"
              loading="lazy"
              className="h-[360px] w-auto rounded-2xl border border-neutral-200 bg-white object-contain shadow-sm sm:h-[420px]"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
