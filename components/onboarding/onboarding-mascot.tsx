"use client";

import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type MascotInstanceProps = {
  src: string;
  onFinish?: () => void;
  className?: string;
};

const MascotInstance = ({ src, onFinish, className }: MascotInstanceProps) => {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  useEffect(() => {
    if (!rive || !onFinish) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let done = false;

    // Read the animation duration from whichever API the Rive runtime
    // exposes. durationSec is the newer direct accessor; older builds
    // only expose per-animation objects via animationByName, where the
    // duration is stored in frames and has to be divided by fps.
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
        /* ignore — fall through to polling */
      }
      return null;
    };

    const tryStart = (): boolean => {
      if (done) return true;
      const ms = getDurationMs();
      if (ms === null || ms <= 0) return false;
      done = true;
      timer = setTimeout(onFinish, ms);
      return true;
    };

    // First shot — the file may already be fully loaded by the time this
    // effect runs (which also means the Load event has already fired and
    // an .on(Load) listener would miss it).
    if (!tryStart()) {
      let attempts = 0;
      poll = setInterval(() => {
        attempts += 1;
        if (tryStart() || attempts > 40) {
          if (poll) clearInterval(poll);
        }
      }, 50);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (poll) clearInterval(poll);
    };
  }, [rive, onFinish]);

  return (
    <RiveComponent
      className={cn("h-full w-full", className)}
      aria-label="mascotte"
    />
  );
};

/**
 * Plays `mascot_hi.riv` once then transitions to `mascot_breath.riv` on
 * loop. Both Rive instances are mounted from the start and stacked in an
 * absolute layer, so the swap is a zero-flash opacity toggle (the canvas
 * never leaves the DOM between the two animations).
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
        className={cn(
          "absolute inset-0",
          !hiDone && "pointer-events-none opacity-0"
        )}
      />
    </div>
  );
};
