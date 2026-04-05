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
  /** If provided, called once the animation's full duration has elapsed. */
  onFinish?: () => void;
  /** Force the animation to restart on stop — useful when the .riv file
   *  isn't marked as Loop in the Rive editor. */
  forceLoop?: boolean;
  /** If the .riv file uses a state machine instead of a direct timeline,
   *  auto-detect and start it on load. */
  useStateMachine?: boolean;
  className?: string;
};

const MascotInstance = ({
  src,
  onFinish,
  forceLoop,
  useStateMachine,
  className,
}: MascotInstanceProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // Auto-detect and play the first state machine in the file. Required
  // when the mascot uses a state machine (e.g. "Any State → Timeline
  // (loop)") rather than a plain timeline — otherwise Rive loads the
  // artboard but doesn't know what to play, and the canvas sits static.
  useEffect(() => {
    if (!rive || !useStateMachine) return;

    const playSM = () => {
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
    };

    playSM();
    const handler = () => playSM();
    rive.on(EventType.Load, handler);
    return () => {
      rive.off(EventType.Load, handler);
    };
  }, [rive, useStateMachine]);

  // "onFinish" detection for the greeting. `Advance` keeps firing every
  // frame even after the state machine reaches Exit (the runtime still
  // renders the canvas), so we can't rely on Advance going silent.
  // Instead, watch `rive.isPlaying`: it flips to true when the state
  // machine starts advancing and back to false once it settles in its
  // terminal state. Fire onFinish on that true → false transition.
  useEffect(() => {
    if (!rive || !onFinish) return;
    let done = false;
    let started = false;

    const fire = () => {
      if (done) return;
      done = true;
      onFinish();
    };

    const checker = setInterval(() => {
      if (done) return;
      const playing = (rive as unknown as { isPlaying?: boolean }).isPlaying;
      if (playing === true) {
        started = true;
        return;
      }
      if (started && playing === false) {
        clearInterval(checker);
        fire();
      }
    }, 16);

    const ceiling = setTimeout(fire, 30_000);

    return () => {
      clearInterval(checker);
      clearTimeout(ceiling);
    };
  }, [rive, onFinish]);

  // Force loop behaviour for the breath animation — if the .riv isn't
  // set to Loop in the editor, Rive will Stop it on the last frame.
  // We listen on Stop (event-driven restart) AND poll isPlaying every
  // 500ms as a safety net in case the Stop event isn't fired for this
  // particular runtime build.
  useEffect(() => {
    if (!rive || !forceLoop) return;

    const restart = () => {
      try {
        // A one-shot animation that has already reached its end needs
        // to be rewound to frame 0 before `play()` will do anything —
        // otherwise Rive just "plays" the final frame and stops
        // immediately. We try scrub(name, 0) first, then fall back to
        // stop()+play() which also forces a full replay.
        const withApi = rive as unknown as {
          animationNames?: string[];
          scrub?: (name: string, value: number) => void;
          stop?: () => void;
        };
        const names = withApi.animationNames;
        if (names && names.length > 0 && typeof withApi.scrub === "function") {
          withApi.scrub(names[0], 0);
        } else if (typeof withApi.stop === "function") {
          withApi.stop();
        }
        rive.play();
      } catch {
        /* ignore */
      }
    };

    rive.on(EventType.Stop, restart);

    const interval = setInterval(() => {
      try {
        const withPlaying = rive as unknown as { isPlaying?: boolean };
        if (withPlaying.isPlaying === false) restart();
      } catch {
        /* ignore */
      }
    }, 500);

    return () => {
      rive.off(EventType.Stop, restart);
      clearInterval(interval);
    };
  }, [rive, forceLoop]);

  return (
    <RiveComponent
      className={cn("h-full w-full", className)}
      aria-label="mascotte"
    />
  );
};

/**
 * Plays `mascot_hi.riv` once then swaps to `mascot_breath.riv` looping.
 * Both Rive instances are mounted from the start and stacked with
 * `position: absolute`, so the transition is a zero-flash opacity toggle
 * (the canvas never leaves the DOM between the two animations).
 */
export const OnboardingMascot = ({ className }: { className?: string }) => {
  const [hiDone, setHiDone] = useState(false);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <MascotInstance
        src="/animations/mascot_hi.riv"
        useStateMachine
        onFinish={() => setHiDone(true)}
        className={cn(
          "absolute inset-0",
          hiDone && "pointer-events-none opacity-0"
        )}
      />
      <MascotInstance
        src="/animations/mascot_breath.riv"
        useStateMachine
        forceLoop
        className={cn(
          "absolute inset-0",
          !hiDone && "pointer-events-none opacity-0"
        )}
      />
    </div>
  );
};
