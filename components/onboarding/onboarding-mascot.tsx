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
  /** Monotonically-increasing number. When it changes, the instance
   *  resets its state machine back to frame 0 and plays from the start.
   *  Pass `undefined` (or never change it) to disable replay. */
  replayTrigger?: number;
  className?: string;
};

const MascotInstance = ({
  src,
  useStateMachine,
  onPlayStart,
  replayTrigger,
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

  // Replay on external trigger — stop + reset the state machine, then
  // play again from frame 0. Used to re-trigger `okok.riv` every time
  // the user picks a new option in the onboarding question steps.
  useEffect(() => {
    if (!rive || replayTrigger === undefined) return;
    try {
      const withApi = rive as unknown as {
        stop?: () => void;
        reset?: (args?: { stateMachines?: string[] }) => void;
        stateMachineNames?: string[];
      };
      const smNames = withApi.stateMachineNames;
      if (typeof withApi.stop === "function") withApi.stop();
      if (smNames && smNames.length > 0 && typeof withApi.reset === "function") {
        withApi.reset({ stateMachines: [smNames[0]] });
        rive.play(smNames[0]);
      } else {
        rive.play();
      }
    } catch {
      /* ignore */
    }
  }, [rive, replayTrigger]);

  return (
    <RiveComponent
      className={cn("h-full w-full", className)}
      aria-label="mascotte"
    />
  );
};

type MascotVariant = "hi_ok" | "okok";

/**
 * Onboarding mascot with two stackable animations:
 *   - `hi_ok.riv`: greeting → breath loop (default, plays from first
 *     mount and keeps looping).
 *   - `okok.riv`: celebratory reaction, triggered each time the user
 *     picks a new option during question steps.
 *
 * Both instances are mounted from the start (absolute inset-0) so the
 * swap is a zero-flash opacity toggle. `okok` is re-triggered via its
 * `replayTrigger` prop whenever `replayKey` changes.
 */
export const OnboardingMascot = ({
  className,
  variant = "hi_ok",
  replayKey,
  onPlayStart,
}: {
  className?: string;
  variant?: MascotVariant;
  replayKey?: number;
  onPlayStart?: () => void;
}) => {
  const showHi = variant === "hi_ok";
  return (
    <div className={cn("relative h-full w-full", className)}>
      <MascotInstance
        src="/animations/hi_ok.riv"
        useStateMachine
        onPlayStart={onPlayStart}
        className={cn(
          "absolute inset-0",
          !showHi && "pointer-events-none opacity-0"
        )}
      />
      {/* Full remount (via React key) on every replayKey bump. This is
          the most reliable way to guarantee a clean play from frame 0
          for state-machine-driven .riv files — stop+reset+play on an
          already-finished SM is flaky across Rive runtime versions.
          okok.riv is preloaded in the root layout so remounting only
          hits the browser cache. */}
      <MascotInstance
        key={`okok-${replayKey ?? 0}`}
        src="/animations/okok.riv"
        useStateMachine
        className={cn(
          "absolute inset-0",
          showHi && "pointer-events-none opacity-0"
        )}
      />
    </div>
  );
};
