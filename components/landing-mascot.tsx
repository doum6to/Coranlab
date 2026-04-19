"use client";

import { useEffect, useRef, useState } from "react";

import { LazyRiveAnimation } from "@/components/ui/lazy-rive";

type Props = {
  src: string;
  /** Optional explicit animation/timeline name (e.g. "eyes down" for eyes_down.riv). */
  animationName?: string;
  /** State machine to drive (e.g. "State Machine 1" for hi_ok.riv). */
  stateMachines?: string | string[];
  /**
   * If true, the Rive runtime and canvas are only mounted once the
   * element enters the viewport. The animation then plays from the
   * start because it only now begins loading. Use for below-the-fold
   * mascots that should play on scroll-in rather than at page load.
   */
  scrollTrigger?: boolean;
  className?: string;
};

export function LandingMascot({
  src,
  animationName,
  stateMachines,
  scrollTrigger = false,
  className,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(!scrollTrigger);

  useEffect(() => {
    if (!scrollTrigger) return;
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollTrigger]);

  return (
    <div ref={wrapperRef} className={className}>
      {inView && (
        <LazyRiveAnimation
          src={src}
          animationName={animationName}
          stateMachines={stateMachines}
          ariaLabel="Quranlab mascotte"
        />
      )}
    </div>
  );
}
