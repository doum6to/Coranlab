"use client";

import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

type MascotInstanceProps = {
  src: string;
  /** If the .riv file uses a state machine instead of a direct timeline,
   *  auto-detect and start it on load. */
  useStateMachine?: boolean;
  className?: string;
};

const MascotInstance = ({
  src,
  useStateMachine,
  className,
}: MascotInstanceProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // Auto-detect and play the first state machine in the file. Without
  // this, Rive loads the artboard but doesn't know what to play and
  // the canvas sits static.
  useEffect(() => {
    if (!rive || !useStateMachine) return;
    try {
      const smNames = (
        rive as unknown as { stateMachineNames?: string[] }
      ).stateMachineNames;
      if (smNames && smNames.length > 0) {
        rive.play(smNames[0]);
      }
    } catch {
      /* ignore */
    }
  }, [rive, useStateMachine]);

  return (
    <RiveComponent
      className={cn("h-full w-full", className)}
      aria-label="mascotte"
    />
  );
};

/**
 * Plays `mascot_hi_loop.riv` — a single file whose state machine chains
 * Entry → Timeline 1 (hi, one-shot) → Timeline 4 (breath, loop). The
 * transition is handled entirely by the Rive state machine, so no
 * React-side timers or file swaps are needed.
 */
export const OnboardingMascot = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <MascotInstance
        src="/animations/hi_ok.riv"
        useStateMachine
        className="absolute inset-0"
      />
    </div>
  );
};
