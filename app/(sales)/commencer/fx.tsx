"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Alignment, Fit, Layout, useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { Volume2, VolumeX } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Feedback sounds + haptics                                            */
/*                                                                      */
/* Tiny synthesised sounds (Web Audio, no files to download). Web Audio */
/* follows the phone's silent switch on iOS, so a visitor arriving from */
/* a social app in silent mode is never surprised by sound.             */

const MUTE_KEY = "cm_sound";
const muteListeners = new Set<() => void>();
let ctx: AudioContext | null = null;

function isMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "off";
  } catch {
    return false;
  }
}

export function setFxMuted(muted: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "off" : "on");
  } catch { /* ignore */ }
  muteListeners.forEach((l) => l());
}

export function useFxMuted(): boolean {
  return useSyncExternalStore(
    (cb) => {
      muteListeners.add(cb);
      return () => { muteListeners.delete(cb); };
    },
    isMuted,
    () => false,
  );
}

function audio(): AudioContext | null {
  if (typeof window === "undefined" || isMuted()) return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

type Note = { f: number; at?: number; dur?: number; type?: OscillatorType; gain?: number; to?: number };

function play(notes: Note[]) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + 0.005;
  for (const n of notes) {
    const start = t0 + (n.at ?? 0);
    const dur = n.dur ?? 0.09;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = n.type ?? "sine";
    osc.frequency.setValueAtTime(n.f, start);
    if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, start + dur);
    const peak = n.gain ?? 0.07;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
}

function buzz(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator && !isMuted()) navigator.vibrate(pattern);
  } catch { /* ignore */ }
}

/** One call per moment: sound + matching vibration (Android; iOS has none on the web). */
export const fx = {
  /** An option is picked. */
  select() { play([{ f: 620, dur: 0.06, gain: 0.05 }, { f: 930, at: 0.045, dur: 0.07, gain: 0.045 }]); buzz(8); },
  /** Moving to the next screen. */
  next() { play([{ f: 420, to: 700, dur: 0.13, type: "triangle", gain: 0.045 }]); buzz(6); },
  /** A small step is ticked off (loader checklist). */
  tick() { play([{ f: 1180, dur: 0.05, gain: 0.04 }]); },
  /** Right answer. */
  correct() { play([{ f: 784, dur: 0.1 }, { f: 1047, at: 0.08, dur: 0.1 }, { f: 1568, at: 0.16, dur: 0.18, gain: 0.06 }]); buzz([10, 40, 18]); },
  /** Wrong answer: soft, never punishing. */
  wrong() { play([{ f: 260, to: 170, dur: 0.22, type: "triangle", gain: 0.06 }]); buzz(45); },
  /** A reward lands (XP, streak). */
  reward() { play([{ f: 1319, dur: 0.07, gain: 0.045 }, { f: 1760, at: 0.06, dur: 0.12, gain: 0.045 }]); },
  /** Big moment: lesson finished, plan ready. */
  win() {
    play([
      { f: 523, dur: 0.12 }, { f: 659, at: 0.1, dur: 0.12 }, { f: 784, at: 0.2, dur: 0.12 }, { f: 1047, at: 0.3, dur: 0.3, gain: 0.08 },
      { f: 1568, at: 0.42, dur: 0.25, gain: 0.035 }, { f: 2093, at: 0.5, dur: 0.3, gain: 0.03 },
    ]);
    buzz([14, 50, 14, 50, 30]);
  },
};

/** Discreet sound switch for the funnel header. */
export function FxMuteButton({ color, labelOn, labelOff }: { color: string; labelOn: string; labelOff: string }) {
  const muted = useFxMuted();
  return (
    <button type="button" onClick={() => { setFxMuted(!muted); if (muted) window.setTimeout(() => fx.select(), 30); }} aria-pressed={!muted} aria-label={muted ? labelOn : labelOff} title={muted ? labelOn : labelOff}
      className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ color }}>
      {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Confetti burst (DOM, ~40 pieces, one shot)                           */

const CONFETTI_COLORS = ["#6967FB", "#F5C842", "#22C55E", "#FF8A3D", "#C8C7F0", "#FF5A7A"];
// Deterministic pseudo-random so every burst looks the same quality.
const rnd = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function ConfettiBurst({ fireKey, pieces = 44, originY = "38%" }: { fireKey: number; pieces?: number; originY?: string }) {
  const reduce = useReducedMotion();
  if (reduce || fireKey <= 0) return null;
  return (
    <div key={fireKey} className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      {Array.from({ length: pieces }, (_, i) => {
        const angle = -Math.PI / 2 + (rnd(i, 1) - 0.5) * Math.PI * 1.5;
        const dist = 120 + rnd(i, 2) * 220;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const size = 6 + rnd(i, 3) * 7;
        const round = rnd(i, 4) > 0.6;
        return (
          <motion.span key={i} className="absolute left-1/2" style={{ top: originY, width: size, height: round ? size : size * 0.45, borderRadius: round ? 999 : 2, background: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{ x: [0, dx, dx * 1.08], y: [0, dy, dy + 260 + rnd(i, 5) * 160], opacity: [1, 1, 0], rotate: (rnd(i, 6) - 0.5) * 900, scale: 1 }}
            transition={{ duration: 1.5 + rnd(i, 7) * 0.7, times: [0, 0.32, 1], ease: ["easeOut", "easeIn"], delay: rnd(i, 8) * 0.08 }} />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small animated atoms                                                 */

/** Number that counts up to `value` (and bumps when it changes). */
export function CountUp({ value, duration = 700, className, style }: { value: number; duration?: number; className?: string; style?: React.CSSProperties }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  const from = useRef(0);
  useEffect(() => {
    if (reduce) { setShown(value); return; }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(a + (value - a) * eased);
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);
  return <span className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }}>{shown}</span>;
}

/** "+10 XP" that floats up and fades each time `fireKey` changes. */
export function FlyUp({ fireKey, children, className, style }: { fireKey: number; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {fireKey > 0 && !reduce && (
        <motion.span key={fireKey} className={`pointer-events-none absolute z-20 whitespace-nowrap ${className ?? ""}`} style={style}
          initial={{ opacity: 0, y: 8, scale: 0.7 }} animate={{ opacity: [0, 1, 1, 0], y: -46, scale: [0.7, 1.15, 1, 1] }} transition={{ duration: 1.1, times: [0, 0.18, 0.7, 1], ease: "easeOut" }} aria-hidden>
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Rive rewards                                                         */

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function RewardBurstInner({ fireKey }: { fireKey: number }) {
  const { rive, RiveComponent } = useRive({ src: "/animations/reward_burst.riv", stateMachines: "State Machine 1", autoplay: true, layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }) });
  const fire = useStateMachineInput(rive, "State Machine 1", "fire");
  useEffect(() => {
    if (fireKey > 0 && fire) fire.fire();
  }, [fireKey, fire]);
  return <RiveComponent className="h-full w-full" aria-hidden />;
}
/** Star pop played over whatever it is laid on; fires each time `fireKey` grows. Stays mounted so it never flashes. */
export function RewardBurst({ fireKey, className }: { fireKey: number; className?: string }) {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  return <div className={`pointer-events-none ${className ?? ""}`} aria-hidden>{mounted && !reduce && <RewardBurstInner fireKey={fireKey} />}</div>;
}

function StreakFlameInner() {
  const { RiveComponent } = useRive({ src: "/animations/streak_flame.riv", stateMachines: "State Machine 1", autoplay: true, layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }) });
  return <RiveComponent className="h-full w-full" aria-hidden />;
}
/** The streak flame: ignites when mounted, then keeps flickering. */
export function StreakFlame({ className }: { className?: string }) {
  const mounted = useMounted();
  // Zoomed into the flame: its frame keeps room for the sparks of the ignition.
  return (
    <div className={className} aria-hidden>
      {mounted && (
        <div className="relative h-full w-full">
          <div className="absolute" style={{ width: "145%", height: "145%", left: "-22.5%", top: "-29.75%" }}><StreakFlameInner /></div>
        </div>
      )}
    </div>
  );
}
