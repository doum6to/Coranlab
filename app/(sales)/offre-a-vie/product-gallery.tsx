"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Placeholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-100 text-xs text-neutral-400 ${className}`}
    >
      Image à venir
    </div>
  );
}

/**
 * Product image carousel: clickable arrows, swipe (touch) and drag (mouse),
 * plus clickable thumbnails. Falls back to placeholders when empty.
 */
export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);

  if (!images.length) {
    return (
      <div>
        <Placeholder className="aspect-square w-full" />
        <div className="mt-3 grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Placeholder key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  const count = images.length;
  const go = (d: number) => setIndex((p) => (p + d + count) % count);

  const onStart = (x: number) => {
    startX.current = x;
  };
  const onEnd = (x: number) => {
    if (startX.current == null) return;
    const dx = x - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  return (
    <div>
      <div
        className="relative aspect-square w-full touch-pan-y select-none overflow-hidden rounded-3xl bg-neutral-100"
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchEnd={(e) => onEnd(e.changedTouches[0].clientX)}
        onPointerDown={(e) => onStart(e.clientX)}
        onPointerUp={(e) => onEnd(e.clientX)}
      >
        <Image
          src={images[index]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 520px"
          className="object-cover"
          draggable={false}
          priority
        />

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Image précédente"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-md transition hover:bg-white active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              aria-label="Image suivante"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-md transition hover:bg-white active:scale-95"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>

            {/* dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-4 bg-neutral-900" : "w-1.5 bg-neutral-900/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.slice(0, 8).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`aspect-square w-full overflow-hidden rounded-xl border-2 transition ${
                i === index ? "border-[#6967fb]" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
