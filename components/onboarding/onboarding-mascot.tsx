"use client";

import {
  Alignment,
  EventType,
  Fit,
  Layout,
  useRive,
} from "@rive-app/react-canvas";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type MascotInstanceProps = {
  src: string;
  onFinish?: () => void;
  className?: string;
};

const MascotInstance = ({ src, onFinish, className }: MascotInstanceProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  useEffect(() => {
    if (!rive || !onFinish) return;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      // durationSec is exposed by the canvas runtime but typed as unknown
      // on the React wrapper, so we cast to read it.
      const seconds = (rive as unknown as { durationSec?: number }).durationSec;
      if (!seconds || seconds <= 0) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(onFinish, seconds * 1000);
    };

    // Try right away in case the file is already loaded
    schedule();

    // Also schedule once the file finishes loading (first call might be
    // too early, before the artboard duration is available).
    const handleLoad = () => schedule();
    rive.on(EventType.Load, handleLoad);

    return () => {
      rive.off(EventType.Load, handleLoad);
      if (timer) clearTimeout(timer);
    };
  }, [rive, onFinish]);

  return (
    <RiveComponent
      className={cn("h-full w-full", className)}
      aria-label="mascotte"
    />
  );
};

/**
 * Plays `mascot_hi.riv` once then transitions to `mascot_breath.riv` on
 * loop. Both Rive instances are mounted from the start and stacked in an
 * absolute layer, so the swap is a zero-flash opacity toggle (the canvas
 * never leaves the DOM between the two animations).
 */
export const OnboardingMascot = ({ className }: { className?: string }) => {
  const [hiDone, setHiDone] = useState(false);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <MascotInstance
        src="/animations/mascot_hi.riv"
        onFinish={() => setHiDone(true)}
        className={cn(
          "absolute inset-0",
          hiDone && "pointer-events-none opacity-0"
        )}
      />
      <MascotInstance
        src="/animations/mascot_breath.riv"
        className={cn(
          "absolute inset-0",
          !hiDone && "pointer-events-none opacity-0"
        )}
      />
    </div>
  );
};
