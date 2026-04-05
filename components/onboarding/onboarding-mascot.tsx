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
  /** Explicit animation timeline to play instead of the state machine.
   *  Used for okok.riv where we want to jump straight into "yup"
   *  (the celebration timeline) without passing through the state
   *  machine's idle state (which visually resembles hi_ok). */
  animationName?: string;
  /** Monotonic counter — when it changes, the current animation is
   *  stopped, reset to frame 0, and replayed. Used instead of a React
   *  `key`-driven remount so we don't get a white frame while the
   *  Rive runtime re-inits. */
  replayKey?: number;
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
  animationName,
  replayKey,
  onPlayStart,
  className,
}: MascotInstanceProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    animations: animationName ? [animationName] : undefined,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // Auto-detect and play the first state machine in the file, then
  // fire any trigger inputs on it. Without firing the triggers,
  // files like okok.riv — whose celebration is gated by a "Trigger 1"
  // input — sit on their idle state and look identical to the
  // hi_ok breath loop.
  useEffect(() => {
    if (!rive) return;
    if (animationName) {
      try {
        (rive as unknown as { play: (name: string) => void }).play(
          animationName
        );
      } catch {
        /* ignore */
      }
      return;
    }
    if (!useStateMachine) return;
    try {
      const api = rive as unknown as {
        stateMachineNames?: string[];
        play: (name: string) => void;
        stateMachineInputs?: (
          name: string
        ) => Array<{ name: string; type: number; fire?: () => void }> | undefined;
      };
      const smNames = api.stateMachineNames;
      if (smNames && smNames.length > 0) {
        api.play(smNames[0]);
        const inputs = api.stateMachineInputs?.(smNames[0]) || [];
        for (const input of inputs) {
          if (typeof input.fire === "function") {
            input.fire();
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, [rive, useStateMachine, animationName]);

  // Replay the animation in-place when replayKey changes — reset the
  // timeline to frame 0 and start playing again. Keeping the same Rive
  // instance alive avoids the white flash that a React `key`-driven
  // remount would cause while the runtime re-initialises.
  useEffect(() => {
    if (!rive || !animationName || replayKey === undefined) return;
    try {
      const api = rive as unknown as {
        stop: (name?: string | string[]) => void;
        reset: (options?: { animations?: string[]; autoplay?: boolean }) => void;
        play: (name?: string | string[]) => void;
      };
      if (typeof api.reset === "function") {
        api.reset({ animations: [animationName], autoplay: true });
      } else {
        api.stop(animationName);
        api.play(animationName);
      }
    } catch {
      /* ignore */
    }
  }, [rive, animationName, replayKey]);

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

type MascotPhase = "intro" | "question";

/**
 * Onboarding mascot — two layers stacked in the same box:
 *  - hi_ok.riv (the greeting / idle) — always mounted while we're in
 *    the onboarding, so switching from intro to question doesn't cost
 *    a fresh Rive init.
 *  - okok.riv (the "yup" celebration) — mounted only once we reach
 *    the question phase, and kept alive from that point on. The
 *    instance is never unmounted between option clicks: instead we
 *    call reset+play via the `replayKey` effect in MascotInstance,
 *    which eliminates the white frame flash a React `key`-driven
 *    remount would cause while the Rive runtime re-initialises.
 *
 * Visibility is a pure opacity toggle. okok's "yup" timeline is
 * one-shot, so when no option has been selected yet it sits paused
 * on its final frame underneath hi_ok — invisible, and ready to
 * replay instantly on the first click.
 */
export const OnboardingMascot = ({
  className,
  phase = "intro",
  showOkok = false,
  replayKey,
  onPlayStart,
}: {
  className?: string;
  phase?: MascotPhase;
  showOkok?: boolean;
  replayKey?: number;
  onPlayStart?: () => void;
}) => {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-150",
          showOkok ? "opacity-0" : "opacity-100"
        )}
      >
        <MascotInstance
          src="/animations/hi_ok.riv"
          useStateMachine
          onPlayStart={onPlayStart}
          className="absolute inset-0"
        />
      </div>

      {phase === "question" && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-150",
            showOkok ? "opacity-100" : "opacity-0"
          )}
        >
          <MascotInstance
            src="/animations/okok.riv"
            // Play the "yup" celebration timeline directly, bypassing
            // the state machine (whose idle state "breath loop" is
            // visually indistinguishable from hi_ok).
            animationName="yup"
            // Resets and replays the timeline in-place whenever
            // replayKey changes — no remount, no white flash.
            replayKey={replayKey}
            className="absolute inset-0"
          />
        </div>
      )}
    </div>
  );
};
