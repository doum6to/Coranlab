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
 * Plays `mascot_hi.riv` once on mount, then immediately switches to
 * `mascot_breath.riv` looping. Because this component stays mounted for
 * the whole onboarding flow (the parent only swaps CSS classes around it),
 * plain React state is enough — no sessionStorage persistence needed, and
 * every fresh visit to /onboarding replays the greeting.
 */
export const OnboardingMascot = ({ className }: { className?: string }) => {
  const [phase, setPhase] = useState<"hi" | "breath">("hi");

  if (phase === "hi") {
    return (
      <MascotInstance
        key="hi"
        src="/animations/mascot_hi.riv"
        className={className}
        onFinish={() => setPhase("breath")}
      />
    );
  }

  return (
    <MascotInstance
      key="breath"
      src="/animations/mascot_breath.riv"
      className={className}
    />
  );
};
