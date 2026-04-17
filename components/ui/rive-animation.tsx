"use client";

import {
  EventType,
  Fit,
  Layout,
  Alignment,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

type RiveAnimationProps = {
  /** Path to the `.riv` file, relative to `/public` (e.g. "/animations/mascot.riv") */
  src: string;
  /** Optional state machine name(s) to run. Leave empty to play the default timeline. */
  stateMachines?: string | string[];
  /**
   * Explicit timeline animation(s) to play (bypasses the state machine).
   * Required for .riv files whose default timeline doesn't auto-play
   * (e.g. `eyes_down.riv` → `"eyes down"`, `mascot_breath.riv` → `"breath"`).
   */
  animationName?: string;
  /** Artboard name inside the `.riv` file. Defaults to the first one. */
  artboard?: string;
  /** Auto-play on mount. Defaults to true. */
  autoplay?: boolean;
  /** Fit mode — how the artboard is scaled inside its container. */
  fit?: Fit;
  /** Alignment of the artboard within its container. */
  alignment?: Alignment;
  /** Tailwind classes applied to the canvas wrapper. */
  className?: string;
  /** Accessibility label. */
  ariaLabel?: string;
};

/**
 * Base Rive renderer. Prefer using the lazy `<LazyRiveAnimation />` export
 * from `@/components/ui/lazy-rive` to keep the Rive runtime out of the
 * initial bundle.
 */
export const RiveAnimation = ({
  src,
  stateMachines,
  animationName,
  artboard,
  autoplay = true,
  fit = Fit.Contain,
  alignment = Alignment.Center,
  className,
  ariaLabel = "animation",
}: RiveAnimationProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines,
    animations: animationName ? [animationName] : undefined,
    artboard,
    autoplay,
    layout: new Layout({ fit, alignment }),
  });

  // When an explicit animationName is provided, `autoplay: true` doesn't
  // reliably start that named timeline on first load. Wait for the Load
  // event before calling play() to guarantee it starts once the file is
  // fully ready. Matches the pattern used in RiveMascot.
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
      aria-label={ariaLabel}
    />
  );
};

type BoolTriggerProps = RiveAnimationProps & {
  /** Name of the state machine (required for triggered animations). */
  stateMachine: string;
  /** Name of the boolean/trigger input inside that state machine. */
  input: string;
  /** Current value — toggling it re-fires the animation. */
  value: boolean;
  /** Treat the input as a "trigger" (fire and reset) rather than a boolean. */
  asTrigger?: boolean;
};

/**
 * Variant that binds a React boolean to a Rive state machine input.
 * Useful for "correct answer" / "wrong answer" reactions.
 */
export const RiveBoolAnimation = ({
  stateMachine,
  input,
  value,
  asTrigger = false,
  src,
  artboard,
  autoplay = true,
  fit = Fit.Contain,
  alignment = Alignment.Center,
  className,
  ariaLabel = "animation",
}: BoolTriggerProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: stateMachine,
    artboard,
    autoplay,
    layout: new Layout({ fit, alignment }),
  });

  const smInput = useStateMachineInput(rive, stateMachine, input);

  useEffect(() => {
    if (!smInput) return;
    if (asTrigger) {
      if (value) smInput.fire();
    } else {
      smInput.value = value;
    }
  }, [smInput, value, asTrigger]);

  return (
    <RiveComponent
      className={cn("h-full w-full", className)}
      aria-label={ariaLabel}
    />
  );
};
