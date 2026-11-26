"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

import { SpeakButton, playWord } from "@/components/word-audio";
import { Translit } from "@/components/translit";
import { cn } from "@/lib/utils";

/** Colours of a judged answer, shared with the feedback sheet at the bottom of the lesson. */
const RIGHT = "#1F9D4D";
const WRONG = "#D93A3A";

type ChoiceProps = {
  /** 1-based position: shown as a keyboard hint on large screens only. */
  index?: number;
  selected: boolean;
  /** Lesson state: nothing judged yet, or the verdict on the learner's pick. */
  status: "correct" | "wrong" | "none";
  /** Whether THIS option is the right answer (revealed once judged). */
  correct: boolean;
  disabled?: boolean;
  onClick: () => void;
  align?: "start" | "center";
  className?: string;
  children: ReactNode;
};

/**
 * One answer of a multiple-choice exercise. A single component for every exercise so an
 * option always looks and behaves the same: readable 16 px label, a press that responds
 * under the finger, green for the right answer (with a tick), red for a wrong pick, and the
 * other options stepping back once the answer is judged.
 */
export function Choice({ index, selected, status, correct, disabled, onClick, align = "start", className, children }: ChoiceProps) {
  const judged = status !== "none";
  const right = judged && correct;
  const wrong = judged && selected && !correct;
  const dimmed = judged && !right && !wrong;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || judged}
      aria-pressed={selected}
      className={cn(
        "flex min-h-[56px] w-full select-none items-center gap-3 rounded-2xl border-2 px-4 py-2 text-left text-base font-medium text-brilliant-text transition-[transform,background-color,border-color,opacity] duration-150",
        !judged && "active:translate-y-[3px] active:!shadow-none",
        align === "center" && "justify-center text-center",
        !judged && !selected && "border-[#E0E0E0] bg-white hover:bg-gray-50",
        !judged && selected && "border-[#6967FB] bg-[#F4F4FF] font-semibold",
        dimmed && "border-[#E0E0E0] bg-white opacity-45",
        disabled && !judged && "cursor-not-allowed",
        className,
      )}
      style={{
        boxShadow: judged || selected ? "none" : "0 4px 0 0 #D4D4D4",
        ...(right ? { borderColor: RIGHT, background: "#F1FBF3", fontWeight: 600 } : {}),
        ...(wrong ? { borderColor: WRONG, background: "#FEF5F5" } : {}),
      }}
    >
      {index !== undefined && (
        <span
          className={cn(
            "hidden h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 text-xs lg:flex",
            selected && !judged ? "border-[#6967FB] text-[#6967FB]" : "border-[#E0E0E0] text-brilliant-muted",
          )}
          aria-hidden
        >
          {index}
        </span>
      )}
      <span className={cn("min-w-0", align === "start" && "flex-1")}>{children}</span>
      {right && (
        <span className="animate-xp-pop flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-white" style={{ background: RIGHT }} aria-hidden>
          <Check className="h-[13px] w-[13px]" strokeWidth={3.2} />
        </span>
      )}
    </button>
  );
}

/** Grid the options sit in: one column on phones, two from tablets up. */
export function Choices({ children, label }: { children: ReactNode; label?: string }) {
  return <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label={label}>{children}</div>;
}

/**
 * The Arabic word an exercise is about. Its reading aids (phonetics, voice) appear once the
 * answer is given: shown before, they would give it away.
 */
export function WordPrompt({ arabic, revealAids, size = "md", className, children, concealed }: { arabic: string | null | undefined; revealAids: boolean; size?: "md" | "lg"; className?: string; children?: ReactNode; /** Shown in place of the word, which keeps its room (a word to recall from memory). */ concealed?: ReactNode }) {
  return (
    <div className={cn("relative flex w-full max-w-[300px] flex-col items-center justify-center rounded-3xl bg-[#F5F4FE] px-4 py-5 sm:py-7", className)}>
      <span className={cn("font-arabic text-brilliant-text transition-opacity duration-300", size === "lg" ? "text-4xl sm:text-5xl" : "text-[2.125rem] sm:text-4xl", concealed && "opacity-0")} dir="rtl" lang="ar" aria-hidden={!!concealed}>{arabic}</span>
      <Translit arabic={arabic} className="mt-1 text-sm" reveal={revealAids} />
      {/* Comes in once the word has faded out, never over it */}
      {concealed && <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-[0.9375rem] font-semibold text-brilliant-muted duration-300 animate-in fade-in fill-mode-both delay-300">{concealed}</span>}
      {revealAids && <SpeakButton arabic={arabic} size="sm" className="absolute left-2.5 top-2.5 !bg-white" />}
      {children && (
        <div className="mt-3 w-full border-t border-[#E4E2F7] pt-3 text-center text-lg font-bold leading-snug text-brilliant-text" style={{ textWrap: "balance" as never }}>
          {children}
        </div>
      )}
    </div>
  );
}

/** Same panel for a prompt given in the learner's language (the word to rebuild, for instance). */
export function MeaningPrompt({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex w-full max-w-[300px] items-center justify-center rounded-3xl bg-[#F5F4FE] px-5 py-5 text-center text-xl font-bold leading-snug text-brilliant-text", className)} style={{ textWrap: "balance" as never }}>
      {children}
    </div>
  );
}

/**
 * What an exercise that runs itself (pairs, cards, letters) asks the lesson's footer button to
 * do. Every exercise is then driven from the same place, at the bottom, under the thumb.
 */
export type ExerciseAction = { label: "check" | "next"; disabled: boolean; run: () => void };

type Pair = { id: number; pairIndex: number | null; arabicText: string | null; frenchText: string | null };
type Side = "ar" | "tr";

function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  // A shuffle that lands on the original order would line every pair up: try again.
  for (let attempt = 0; attempt < 6; attempt++) {
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    if (out.length < 2 || out.some((item, i) => item !== list[i])) break;
  }
  return out;
}

function PairTile({ state, disabled, onClick, children }: { state: "idle" | "picked" | "matched" | "miss"; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || state === "matched"}
      aria-pressed={state === "picked"}
      className={cn(
        "flex h-full min-h-[64px] w-full select-none items-center justify-center rounded-2xl border-2 px-2.5 py-1.5 text-center text-brilliant-text transition-[transform,background-color,border-color,opacity] duration-150",
        state === "idle" && "border-[#E0E0E0] bg-white hover:bg-gray-50 active:translate-y-[3px] active:!shadow-none",
        state === "picked" && "border-[#6967FB] bg-[#F4F4FF]",
        state === "matched" && "border-[#BFE8C9] bg-[#F1FBF3] opacity-60",
        state === "miss" && "animate-shake",
      )}
      style={{
        boxShadow: state === "idle" ? "0 4px 0 0 #D4D4D4" : "none",
        ...(state === "miss" ? { borderColor: WRONG, background: "#FEF5F5" } : {}),
      }}
    >
      {children}
    </button>
  );
}

/**
 * Two columns to pair up: Arabic words on one side, their meanings (shuffled) on the other.
 * Either side can be tapped first. A found pair is read aloud, as a reward; a wrong pair
 * shakes and costs nothing.
 */
export function MatchBoard({ pairs, onDone, disabled, label }: { pairs: Pair[]; onDone: () => void; disabled?: boolean; label?: string }) {
  const keyOf = (p: Pair) => p.pairIndex ?? p.id;
  // Shuffled after mount: a random order drawn during server rendering would not match the browser's.
  const [meanings, setMeanings] = useState<Pair[] | null>(null);
  useEffect(() => {
    setMeanings(shuffled(pairs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [picked, setPicked] = useState<{ side: Side; key: number } | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [miss, setMiss] = useState<{ ar: number; tr: number } | null>(null);

  const tap = (side: Side, key: number) => {
    if (disabled || matched.has(key)) return;
    if (!picked || picked.side === side) {
      setPicked(picked?.side === side && picked.key === key ? null : { side, key });
      setMiss(null);
      return;
    }
    if (picked.key === key) {
      void playWord(pairs.find((p) => keyOf(p) === key)?.arabicText);
      const next = new Set(matched).add(key);
      setMatched(next);
      setPicked(null);
      if (next.size === pairs.length) setTimeout(onDone, 450);
      return;
    }
    setMiss(side === "ar" ? { ar: key, tr: picked.key } : { ar: picked.key, tr: key });
    setPicked(null);
    setTimeout(() => setMiss(null), 550);
  };

  const stateOf = (side: Side, key: number) =>
    matched.has(key) ? "matched" : miss && miss[side] === key ? "miss" : picked?.side === side && picked.key === key ? "picked" : "idle";

  // One grid row per pair of tiles, so both columns keep the same line whatever the label length.
  const right = meanings ?? pairs;
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-x-3 gap-y-2.5" role="group" aria-label={label}>
      {pairs.map((pair, row) => {
        const meaning = right[row];
        return (
          <Fragment key={pair.id}>
            <PairTile state={stateOf("ar", keyOf(pair))} disabled={disabled} onClick={() => tap("ar", keyOf(pair))}>
              <span className="flex flex-col items-center">
                <span className="font-arabic text-[1.625rem] leading-[1.35]" dir="rtl" lang="ar">{pair.arabicText}</span>
                {matched.has(keyOf(pair)) && <Translit arabic={pair.arabicText} className="-mt-0.5 text-[0.75rem]" />}
              </span>
            </PairTile>
            <div className={cn(!meanings && "invisible")}>
              <PairTile state={stateOf("tr", keyOf(meaning))} disabled={disabled} onClick={() => tap("tr", keyOf(meaning))}>
                <span className="text-[0.9375rem] font-semibold leading-snug">{meaning.frenchText}</span>
              </PairTile>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
