"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { wordAudioSrc } from "@/lib/word-audio";
import { useT } from "@/lib/i18n/use-t";
import { cn } from "@/lib/utils";

/* ───────────────────────── Sound preference ───────────────────────── */

const PREF_KEY = "ql_word_sound";
const prefListeners = new Set<() => void>();

function readSoundOn(): boolean {
  try {
    return window.localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setWordSoundOn(on: boolean) {
  try {
    window.localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {}
  if (!on) player?.pause();
  prefListeners.forEach((l) => l());
}

/** Whether words are read aloud automatically (and listening exercises shown). */
export function useWordSoundOn(): boolean {
  return useSyncExternalStore(
    (cb) => {
      prefListeners.add(cb);
      return () => { prefListeners.delete(cb); };
    },
    readSoundOn,
    () => true,
  );
}

/* ───────────────────────────── Player ─────────────────────────────── */

/**
 * One shared <audio> element for every word clip. Reusing the same element
 * matters on iOS: once it has played inside a tap, later programmatic plays
 * (reading the next word when it appears) are allowed.
 */
let player: HTMLAudioElement | null = null;
const playListeners = new Set<(src: string | null) => void>();
const notify = (src: string | null) => playListeners.forEach((l) => l(src));

// 0.05 s of silence, used once to unlock the element on the first tap.
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

function getPlayer(): HTMLAudioElement {
  if (!player) {
    player = new Audio();
    player.preload = "auto";
    player.addEventListener("ended", () => notify(null));
    player.addEventListener("pause", () => notify(null));
  }
  return player;
}

let unlocked = false;
/** Call inside the lesson: the first tap anywhere unlocks automatic playback. */
export function useUnlockWordAudio() {
  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      const p = getPlayer();
      if (p.paused && !p.src) {
        p.src = SILENCE;
        p.play().then(() => p.pause()).catch(() => {});
      }
      window.removeEventListener("pointerdown", unlock, true);
    };
    window.addEventListener("pointerdown", unlock, true);
    return () => window.removeEventListener("pointerdown", unlock, true);
  }, []);
}

/**
 * Clips already downloaded, kept in memory: playing one then starts at once, with no request
 * to the server between the tap and the sound.
 */
const ready = new Map<string, string>();
const fetching = new Set<string>();

async function fetchClip(src: string) {
  if (ready.has(src) || fetching.has(src)) return;
  fetching.add(src);
  try {
    const res = await fetch(src);
    if (res.ok) ready.set(src, URL.createObjectURL(new Blob([await res.arrayBuffer()], { type: "audio/mpeg" })));
  } catch { /* offline or blocked: the clip is simply loaded when it is played */ }
  fetching.delete(src);
}

/** Downloads the clips of these words ahead of time, in the order given, three at a time. */
export function preloadWords(words: (string | null | undefined)[]) {
  if (typeof window === "undefined") return;
  const queue = Array.from(new Set(words.map(wordAudioSrc).filter((s): s is string => !!s && !ready.has(s))));
  const next = async (): Promise<void> => {
    const src = queue.shift();
    if (!src) return;
    await fetchClip(src);
    return next();
  };
  for (let i = 0; i < 3; i++) void next();
}

/** Cuts the voice short: the learner has moved on, the word of the exercise before must not follow them. */
export function stopWord() {
  if (!player || player.paused) return;
  player.pause();
  notify(null);
}

/** Plays the clip of an Arabic word. Resolves false when there is none or the browser blocks it. */
export async function playWord(arabic: string | null | undefined): Promise<boolean> {
  const src = wordAudioSrc(arabic);
  if (!src || typeof window === "undefined") return false;
  try {
    const p = getPlayer();
    p.pause();
    p.src = ready.get(src) ?? src;
    p.currentTime = 0;
    await p.play();
    notify(src);
    return true;
  } catch {
    notify(null);
    return false; // blocked before the first tap: the button still works
  }
}

/** True while the given word's clip is playing (drives the button's pulse). */
function useIsPlaying(arabic: string | null | undefined) {
  const src = wordAudioSrc(arabic);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const l = (cur: string | null) => setPlaying(!!src && cur === src);
    playListeners.add(l);
    return () => { playListeners.delete(l); };
  }, [src]);
  return playing;
}

/**
 * Reads the word aloud when it appears (or when `enabled` turns true), unless
 * the learner switched the sound off. `force` ignores that preference: used by
 * listening exercises, which only exist while the sound is on anyway.
 */
export function useAutoPlayWord(arabic: string | null | undefined, enabled = true, force = false, delayMs = 250) {
  const soundOn = useWordSoundOn();
  useEffect(() => {
    if (!enabled || !arabic || (!soundOn && !force)) return;
    const id = window.setTimeout(() => { void playWord(arabic); }, delayMs);
    return () => window.clearTimeout(id);
  }, [arabic, enabled, soundOn, force, delayMs]);
}

/**
 * Delay for a word read aloud right after an answer: the right/wrong sound lasts about 0.3 s,
 * the word follows it without a gap (it used to wait twice as long).
 */
export const AFTER_ANSWER_MS = 340;

/* ───────────────────────────── Buttons ────────────────────────────── */

type SpeakProps = {
  arabic: string | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
};

/** Speaker button; renders nothing when the word has no clip. */
export function SpeakButton({ arabic, className, size = "md" }: SpeakProps) {
  const t = useT();
  const playing = useIsPlaying(arabic);
  if (!wordAudioSrc(arabic)) return null;
  const dim = size === "lg" ? "h-24 w-24" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-[18px] w-[18px]" : "h-5 w-5";
  const play = () => { void playWord(arabic); };
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={t.audio.listen}
      onClick={(e) => { e.stopPropagation(); play(); }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); play(); }
      }}
      className={cn(
        "inline-flex shrink-0 cursor-pointer select-none items-center justify-center rounded-full transition active:scale-95",
        size === "lg"
          ? "bg-[#6967FB] text-white shadow-[0_6px_0_0_#4a48d4] active:translate-y-[4px] active:shadow-none"
          : "bg-[#EFEFFF] text-[#6967FB] hover:bg-[#E4E3FF]",
        dim,
        playing && (size === "lg" ? "ring-8 ring-[#6967FB]/20" : "ring-4 ring-[#6967FB]/25"),
        className,
      )}
    >
      <Volume2 className={cn(icon, playing && "animate-pulse")} />
    </span>
  );
}

/** Header switch: read words aloud (and offer listening exercises) or not. */
export function WordSoundToggle({ className }: { className?: string }) {
  const t = useT();
  const on = useWordSoundOn();
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? t.audio.turnOff : t.audio.turnOn}
      title={on ? t.audio.turnOff : t.audio.turnOn}
      onClick={() => setWordSoundOn(!on)}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-neutral-100",
        on ? "text-[#6967FB]" : "text-brilliant-muted",
        className,
      )}
    >
      {on ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}
