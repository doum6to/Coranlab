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
    const handler = () => onFinish();
    rive.on(EventType.Stop, handler);
    return () => {
      rive.off(EventType.Stop, handler);
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
          "absolute inset-0 transition-opacity duration-150",
          hiDone && "pointer-events-none opacity-0"
        )}
      />
      <MascotInstance
        src="/animations/mascot_breath.riv"
        className={cn(
          "absolute inset-0 transition-opacity duration-150",
          !hiDone && "pointer-events-none opacity-0"
        )}
      />
    </div>
  );
};
