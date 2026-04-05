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
  /** If the .riv file uses a state machine, start it on load. */
  useStateMachine?: boolean;
  /** Primary timeline animation to play on mount and on every
   *  replayKey change, bypassing the state machine. */
  animationName?: string;
  /** Optional looping animation to play after `animationName`
   *  finishes. Used on okok.riv: "yup" plays as the one-shot
   *  celebration, then "breath loop" takes over as idle. */
  idleAnimationName?: string;
  /** Monotonic counter — each time it changes, the timeline animation
   *  is stopped and replayed from frame 0. */
  replayKey?: number;
  /** Fired the first time the Rive runtime actually starts playing. */
  onPlayStart?: () => void;
  className?: string;
};

const MascotInstance = ({
  src,
  useStateMachine,
  animationName,
  idleAnimationName,
  replayKey,
  onPlayStart,
  className,
}: MascotInstanceProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    // Explicit timeline animation takes priority over state machine.
    animations: animationName ? [animationName] : undefined,
    stateMachines:
      !animationName && useStateMachine ? "State Machine 1" : undefined,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // Kick the animation into playing state as soon as rive is ready.
  // useRive's `autoplay: true` isn't always honored when `animations`
  // is set and the .riv comes from cache.
  useEffect(() => {
    if (!rive || !animationName) return;
    try {
      (rive as unknown as { play: (name: string) => void }).play(
        animationName
      );
    } catch {
      /* ignore */
    }
  }, [rive, animationName]);

  // Replay the timeline animation from frame 0 whenever replayKey
  // changes — this is how okok.riv replays its celebration on each
  // option click.
  useEffect(() => {
    if (!rive || replayKey === undefined) return;
    try {
      if (animationName) {
        const api = rive as unknown as {
          stop: (name?: string | string[]) => void;
          play: (name?: string | string[]) => void;
        };
        api.stop(animationName);
        api.play(animationName);
      } else if (useStateMachine) {
        // Fire every trigger input on the state machine — this is
        // what makes okok.riv replay "yup" and then transition back
        // to "breath loop" on each click.
        const api = rive as unknown as {
          stateMachineNames?: string[];
          stateMachineInputs?: (
            name: string
          ) => Array<{ name: string; fire?: () => void }> | undefined;
        };
        const smNames = api.stateMachineNames;
        if (smNames && smNames.length > 0) {
          const inputs = api.stateMachineInputs?.(smNames[0]) || [];
          for (const input of inputs) {
            if (typeof input.fire === "function") input.fire();
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, [rive, animationName, useStateMachine, replayKey]);

  // When `animationName` finishes (Stop event), switch to the idle
  // looping animation. This gives the sequence: "yup" one-shot on
  // mount / on each replayKey bump → "breath loop" while idle.
  useEffect(() => {
    if (!rive || !animationName || !idleAnimationName) return;
    const handler = () => {
      try {
        const api = rive as unknown as {
          play: (name: string) => void;
        };
        api.play(idleAnimationName);
      } catch {
        /* ignore */
      }
    };
    rive.on(EventType.Stop, handler);
    return () => {
      rive.off(EventType.Stop, handler);
    };
  }, [rive, animationName, idleAnimationName]);

  // Fire onPlayStart exactly once — on the first Advance event, which
  // means the runtime has rendered at least one frame.
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
 * Onboarding mascot — swaps between two .riv files based on phase:
 *  - intro  → hi_ok.riv  (Koji greeting via its state machine,
 *              including the "créons ensemble" beat at ~1.5s)
 *  - question → okok.riv (state machine: fires "yup" celebration
 *              trigger on each option click, rests on breath_loop
 *              idle between clicks)
 *
 * okok is kept mounted across clicks — `replayKey` changes re-fire
 * the "yup" trigger on the live Rive instance, so there is no remount
 * and no white flash between celebrations.
 */
type OnboardingMascotProps = {
  className?: string;
  phase?: MascotPhase;
  replayKey?: number;
  onPlayStart?: () => void;
};

const OnboardingMascotInner = ({
  className,
  phase = "intro",
  replayKey,
  onPlayStart,
}: OnboardingMascotProps) => {
  return (
    <div className={cn("relative h-full w-full", className)}>
      {phase === "intro" ? (
        <MascotInstance
          key="hi_ok"
          src="/animations/hi_ok.riv"
          useStateMachine
          onPlayStart={onPlayStart}
          className="absolute inset-0"
        />
      ) : (
        // okok.riv: run its built-in state machine, which handles
        // entry → yup → breath_loop natively. Remount on every
        // replayKey change so the SM restarts from entry and the
        // yup celebration plays from frame 0. The .riv file is
        // preloaded in the root layout so the remount is instant.
        <MascotInstance
          key={`okok-${replayKey ?? 0}`}
          src="/animations/okok.riv"
          useStateMachine
          className="absolute inset-0"
        />
      )}
    </div>
  );
};

// Client-only wrapper: useRive renders a <canvas> that can't exist
// during SSR, so we gate the whole subtree on a post-mount flag.
// Server HTML and the first client render both produce the same empty
// div — the Rive canvas only appears on the second client render.
export const OnboardingMascot = (props: OnboardingMascotProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return (
      <div className={cn("relative h-full w-full", props.className)} />
    );
  }
  return <OnboardingMascotInner {...props} />;
};
