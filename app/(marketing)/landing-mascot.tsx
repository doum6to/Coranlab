"use client";

import { LazyRiveAnimation } from "@/components/ui/lazy-rive";

export function LandingMascot({
  src,
  animationName,
  className,
}: {
  src: string;
  /** Optional explicit animation/timeline name (e.g. "eyes down" for eyes_down.riv). */
  animationName?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <LazyRiveAnimation
        src={src}
        animationName={animationName}
        ariaLabel="Quranlab mascotte"
      />
    </div>
  );
}
