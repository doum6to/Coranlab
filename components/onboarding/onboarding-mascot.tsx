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

const HI_DONE_KEY = "onboarding_mascot_hi_done";

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
 * Plays `mascot_hi.riv` once on first mount, then immediately transitions
 * to `mascot_breath.riv` looping. Uses sessionStorage so the state survives
 * remounts (when the onboarding layout changes between intro and question
 * steps) — the mascot never replays the "hi" animation twice in a session.
 */
export const OnboardingMascot = ({ className }: { className?: string }) => {
  const [phase, setPhase] = useState<"hi" | "breath">(() => {
    if (typeof window === "undefined") return "hi";
    return sessionStorage.getItem(HI_DONE_KEY) === "1" ? "breath" : "hi";
  });

  if (phase === "hi") {
    return (
      <MascotInstance
        key="hi"
        src="/animations/mascot_hi.riv"
        className={className}
        onFinish={() => {
          try {
            sessionStorage.setItem(HI_DONE_KEY, "1");
          } catch {
            /* ignore */
          }
          setPhase("breath");
        }}
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

/** Call this once the user finishes (or leaves) the onboarding flow. */
export const resetOnboardingMascot = () => {
  try {
    sessionStorage.removeItem(HI_DONE_KEY);
  } catch {
    /* ignore */
  }
};
