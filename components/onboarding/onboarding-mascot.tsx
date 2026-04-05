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

type IntroMascotProps = {
  onPlayStart?: () => void;
  className?: string;
};

/**
 * hi_ok.riv mascot — drives the greeting via its state machine
 * ("State Machine 1"), which plays the full Koji intro with the
 * "créons ensemble" beat at ~1.5s. Used on the onboarding intro
 * steps only.
 */
const IntroMascot = ({ onPlayStart, className }: IntroMascotProps) => {
  const { rive, RiveComponent } = useRive({
    src: "/animations/hi_ok.riv",
    autoplay: true,
    stateMachines: "State Machine 1",
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // Fire onPlayStart exactly once — on the first Advance event, which
  // means the runtime has rendered at least one frame. The onboarding
  // page uses this to arm the 1.5s "créons ensemble" beat timer in
  // sync with the real animation start (not React mount time).
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

type QuestionMascotProps = {
  /** Monotonic counter — each bump scrubs "yup" back to frame 0 and
   *  replays it on the live Rive instance. */
  replayKey?: number;
  className?: string;
};

/**
 * okok.riv mascot — plays the "yup" celebration timeline as a
 * one-shot, then transitions to the "breath loop" idle via the Stop
 * event. Kept mounted across option clicks: each replayKey bump
 * scrubs "yup" back to frame 0 and plays it again in place, so
 * there is no canvas remount and no white flash between clicks.
 */
const QuestionMascot = ({ replayKey, className }: QuestionMascotProps) => {
  const { rive, RiveComponent } = useRive({
    src: "/animations/okok.riv",
    autoplay: true,
    animations: ["yup"],
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // Kick "yup" into playing state as soon as rive is ready. useRive's
  // `autoplay: true` isn't always honored when `animations` is set
  // and the .riv file comes from cache.
  useEffect(() => {
    if (!rive) return;
    try {
      (rive as unknown as { play: (name: string) => void }).play("yup");
    } catch {
      /* ignore */
    }
  }, [rive]);

  // Replay "yup" from frame 0 whenever replayKey changes. We scrub
  // the time cursor to 0 and then play — a plain stop()+play()
  // leaves the cursor at the end of a finished one-shot and re-ends
  // immediately, while reset() destroys/recreates the animation
  // instance and can cause a 1-frame blank flash.
  useEffect(() => {
    if (!rive || replayKey === undefined) return;
    try {
      const api = rive as unknown as {
        scrub: (name: string, value: number) => void;
        play: (name: string) => void;
      };
      api.scrub("yup", 0);
      api.play("yup");
    } catch {
      /* ignore */
    }
  }, [rive, replayKey]);

  // When "yup" finishes (Stop event), switch to the "breath loop"
  // idle so the mascot breathes gently between clicks.
  useEffect(() => {
    if (!rive) return;
    const handler = () => {
      try {
        (rive as unknown as { play: (name: string) => void }).play(
          "breath loop"
        );
      } catch {
        /* ignore */
      }
    };
    rive.on(EventType.Stop, handler);
    return () => {
      rive.off(EventType.Stop, handler);
    };
  }, [rive]);

  return (
    <RiveComponent
      className={cn("h-full w-full", className)}
      aria-label="mascotte"
    />
  );
};

type MascotPhase = "intro" | "question";

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
        <IntroMascot
          onPlayStart={onPlayStart}
          className="absolute inset-0"
        />
      ) : (
        <QuestionMascot
          replayKey={replayKey}
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
