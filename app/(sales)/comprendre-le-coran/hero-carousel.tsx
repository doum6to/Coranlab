"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Hero carousel for the ad creative slides: a horizontal snap-scroll strip
 * with pagination dots underneath. The active dot follows the scroll position;
 * tapping a dot scrolls to that slide. Dots are hidden when there's a single
 * image (nothing to paginate). Images are served unoptimized (already
 * compressed WebP) so the first slide doesn't gate the hero LCP.
 */
export function HeroCarousel({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        // The most-visible slide wins.
        let best: { idx: number; ratio: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number((e.target as HTMLElement).dataset.idx);
          if (Number.isNaN(idx)) continue;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { idx, ratio: e.intersectionRatio };
          }
        }
        if (best) setActive(best.idx);
      },
      { root: scrollerRef.current, threshold: [0.5, 0.75, 1] },
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [images.length]);

  const goTo = (i: number) =>
    slideRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

  return (
    <div className="mb-5">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* leading spacer so slide 1 sits centered with a peek of slide 2 */}
        <div className="w-[7vw] shrink-0 sm:w-10" aria-hidden />
        {images.map((src, i) => (
          <div
            key={i}
            data-idx={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="relative aspect-square w-[78vw] max-w-[330px] shrink-0 snap-center overflow-hidden rounded-3xl"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 78vw, 330px"
              className="object-cover"
              priority={i === 0}
              unoptimized
            />
          </div>
        ))}
        <div className="w-[7vw] shrink-0 sm:w-10" aria-hidden />
      </div>

      {/* Pagination dots — only when there's more than one slide. */}
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Image ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-[#6967fb]" : "w-1.5 bg-neutral-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
