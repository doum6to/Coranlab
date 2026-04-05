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
  className?: string;
};

const MascotInstance = ({
  src,
  onFinish,
  forceLoop,
  className,
}: MascotInstanceProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // Duration-based "onFinish" timer for the greeting animation.
  useEffect(() => {
    if (!rive || !onFinish) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let done = false;

    const fire = () => {
      if (done) return;
      done = true;
      if (timer) clearTimeout(timer);
      if (poll) clearInterval(poll);
      onFinish();
    };

    const getDurationMs = (): number | null => {
      try {
        const withDurationSec = rive as unknown as { durationSec?: number };
        if (
          typeof withDurationSec.durationSec === "number" &&
          withDurationSec.durationSec > 0
        ) {
          return withDurationSec.durationSec * 1000;
        }

        const withAnims = rive as unknown as {
          animationNames?: string[];
          animationByName?: (
            name: string
          ) => { duration?: number; fps?: number } | undefined;
        };
        const names = withAnims.animationNames;
        if (names && names.length > 0 && withAnims.animationByName) {
          const anim = withAnims.animationByName(names[0]);
          if (
            anim &&
            typeof anim.duration === "number" &&
            typeof anim.fps === "number" &&
            anim.fps > 0
          ) {
            return (anim.duration / anim.fps) * 1000;
          }
        }
      } catch {
        /* ignore */
      }
      return null;
    };

    const trySchedule = (): boolean => {
      if (done) return true;
      const ms = getDurationMs();
      if (ms === null || ms <= 0) return false;
      timer = setTimeout(fire, ms);
      return true;
    };

    if (!trySchedule()) {
      let attempts = 0;
      poll = setInterval(() => {
        attempts += 1;
        if (trySchedule() || attempts > 40) {
          if (poll) clearInterval(poll);
          // Hard safety net: if after 2s we still couldn't read the
          // duration, just advance anyway so the flow never gets stuck.
          if (!done && attempts > 40) {
            fire();
          }
        }
      }, 50);
    }

    // Ultimate ceiling: no matter what, advance after 10 seconds.
    const ceiling = setTimeout(fire, 10_000);

    return () => {
      if (timer) clearTimeout(timer);
      if (poll) clearInterval(poll);
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
        onFinish={() => setHiDone(true)}
        className={cn(
          "absolute inset-0",
          hiDone && "pointer-events-none opacity-0"
        )}
      />
      <MascotInstance
        src="/animations/mascot_breath.riv"
        forceLoop
        className={cn(
          "absolute inset-0",
          !hiDone && "pointer-events-none opacity-0"
        )}
      />
    </div>
  );
};
