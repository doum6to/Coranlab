"use client";

import { LazyRiveAnimation } from "@/components/ui/lazy-rive";

export function LandingMascot({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <LazyRiveAnimation src={src} ariaLabel="Quranlab mascotte" />
    </div>
  );
}
