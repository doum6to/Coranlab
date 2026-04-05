"use client";

import {
  Alignment,
  EventType,
  Fit,
  Layout,
  useRive,
} from "@rive-app/react-canvas";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

type RiveMascotProps = {
  /** Path under /public, e.g. "/animations/eyes_down.riv" */
  src: string;
  /** Explicit timeline animation to play (bypasses the state machine).
   *  Used e.g. for mascot_breath.riv where we want the "breath loop"
   *  idle specifically, not whatever the file's default SM picks. */
  animationName?: string;
  className?: string;
};

/**
 * Thin wrapper around useRive that autoplays the file's default
 * timeline / state machine, or a specific named animation if
 * `animationName` is provided. Use for simple idle mascot animations
 * (login/signup header, level-card, etc). For the onboarding flow
 * where we need trigger control, use OnboardingMascot instead.
 */
export const RiveMascot = ({
  src,
  animationName,
  className,
}: RiveMascotProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    animations: animationName ? [animationName] : undefined,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // When an explicit animationName is provided, autoplay: true doesn't
  // reliably start that specific timeline on first load. Wait for the
  // Load event before calling play() to guarantee the animation is
  // kicked off once the .riv file is fully ready.
  useEffect(() => {
    if (!rive || !animationName) return;
    const tryPlay = () => {
      try {
        (rive as unknown as { play: (name: string) => void }).play(
          animationName
        );
      } catch {
        /* ignore */
      }
    };
    tryPlay();
    rive.on(EventType.Load, tryPlay);
    return () => {
      rive.off(EventType.Load, tryPlay);
    };
  }, [rive, animationName]);

  return (
    <RiveComponent
      className={cn("h-full w-full", className)}
      aria-label="mascotte"
    />
  );
};
