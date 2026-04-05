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

type MascotInstanceProps = {
  src: string;
  /** If the .riv file uses a state machine instead of a direct timeline,
   *  auto-detect and start it on load. */
  useStateMachine?: boolean;
  /** Fired the first time the Rive runtime actually starts playing the
   *  animation (after fetch + parse + first frame). Used to sync timed
   *  UI — starting a timer at React mount is unreliable because the
   *  .riv file may still be loading. */
  onPlayStart?: () => void;
  className?: string;
};

const MascotInstance = ({
  src,
  useStateMachine,
  onPlayStart,
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

  // Fire onPlayStart exactly once — on the first Advance event, which
  // means the runtime has rendered at least one frame. Using Play alone
  // isn't enough because it can fire before the first paint.
  useEffect(() => {
    if (!rive || !onPlayStart) return;
    let fired = false;
    const handler = () => {
      if (fired) return;
      fired = true;
      onPlayStart();
    };
    rive.on(EventType.Advance, handler);
    return () => {
      rive.off(EventType.Advance, handler);
    };
  }, [rive, onPlayStart]);

  return (
    <RiveComponent
      className={cn("h-full w-full", className)}
      aria-label="mascotte"
    />
  );
};

/**
 * Plays `hi_ok.riv` — a single file whose state machine chains the
 * "hi" one-shot into a looping breath. The transition is handled
 * entirely by the Rive state machine, so no React-side timers or
 * file swaps are needed.
 */
export const OnboardingMascot = ({
  className,
  onPlayStart,
}: {
  className?: string;
  onPlayStart?: () => void;
}) => {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <MascotInstance
        src="/animations/hi_ok.riv"
        useStateMachine
        onPlayStart={onPlayStart}
        className="absolute inset-0"
      />
    </div>
  );
};
