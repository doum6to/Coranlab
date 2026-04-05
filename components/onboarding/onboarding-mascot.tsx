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
   *  Used for okok.riv where we want to jump straight into "full one"
   *  (the celebration timeline) without passing through the state
   *  machine's idle state (which visually resembles hi_ok). */
  animationName?: string;
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

type MascotVariant = "hi_ok" | "okok";

/**
 * Onboarding mascot — only ONE MascotInstance is mounted at a time,
 * matching the current `variant`. This is intentional: previously both
 * instances were mounted from the intro step with an opacity toggle,
 * but `okok.riv`'s celebration state-machine trigger was fired as soon
 * as the instance initialised (see the MascotInstance play effect),
 * so the celebration played invisibly on the intro step and was stuck
 * on its post-celebration frame by the time the user reached a
 * question. That made it look like hi_ok was showing first, then okok
 * "launching" on click.
 *
 * Mounting only the active variant ensures the trigger fires exactly
 * when the user sees the mascot. `okok.riv` is preloaded in the root
 * layout so the fresh mount on question-step entry is instantaneous
 * (cached fetch, cached wasm). The `replayKey`-driven `key` on the
 * okok instance forces a full remount on each option click so the
 * celebration replays from frame 0.
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
  return (
    <div className={cn("relative h-full w-full", className)}>
      {variant === "hi_ok" ? (
        <MascotInstance
          src="/animations/hi_ok.riv"
          useStateMachine
          onPlayStart={onPlayStart}
          className="absolute inset-0"
        />
      ) : (
        <MascotInstance
          key={`okok-${replayKey ?? 0}`}
          src="/animations/okok.riv"
          // Play the "yup" celebration timeline directly, bypassing
          // the state machine. Going through the state machine would
          // start on its idle state ("breath loop"), which is visually
          // indistinguishable from hi_ok — the user would briefly see
          // hi_ok-looking frames before the celebration transition
          // fires. Playing the timeline directly jumps straight into
          // the celebration from frame 0.
          animationName="yup"
          className="absolute inset-0"
        />
      )}
    </div>
  );
};
