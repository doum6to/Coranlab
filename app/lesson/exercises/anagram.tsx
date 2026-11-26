"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { challengeOptions, challenges } from "@/db/schema";
import { useT } from "@/lib/i18n/use-t";
import { AFTER_ANSWER_MS, SpeakButton, useAutoPlayWord } from "@/components/word-audio";
import { Translit } from "@/components/translit";
import { MeaningPrompt, type ExerciseAction } from "./choice";

type Props = {
  challenge: typeof challenges.$inferSelect;
  options: typeof challengeOptions.$inferSelect[];
  /** The lesson's verdict on this exercise, once the word has been checked. */
  status: "correct" | "wrong" | "none";
  onCorrect: () => void;
  onWrong: () => void;
  /** Tells the lesson what its footer button does for this exercise. */
  onAction: (action: ExerciseAction) => void;
  disabled?: boolean;
};

// Tatweel and spaces are dropped when the letter tiles are generated, so the target must drop
// them too: otherwise a prefix written with a tatweel could never be matched.
const normalize = (s: string) => s.replace(/[\sـ​-‏]/g, "");

/** The meaning is given; the learner rebuilds the Arabic word from its letters, right to left. */
export const Anagram = ({ challenge, options, status, onCorrect, onWrong, onAction, disabled }: Props) => {
  const t = useT();
  const letters = useMemo(() => options.map((o, id) => ({ id, letter: o.arabicText || o.text })), [options]);
  // Mixed after mount: an order drawn during server rendering would not match the browser's.
  const [bank, setBank] = useState<typeof letters | null>(null);
  useEffect(() => {
    setBank([...letters].sort(() => Math.random() - 0.5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [placed, setPlaced] = useState<number[]>([]);

  const judged = status !== "none";
  const locked = disabled || judged;
  const complete = letters.length > 0 && placed.length === letters.length;
  const word = placed.map((id) => letters[id]?.letter ?? "").join("");

  useEffect(() => {
    onAction({
      label: "check",
      disabled: !complete,
      run: () => (normalize(word) === normalize(challenge.arabicWord || "") ? onCorrect() : onWrong()),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, word]);

  // The word is read out once judged, right or wrong: that is the moment it sticks.
  useAutoPlayWord(challenge.arabicWord, judged, false, AFTER_ANSWER_MS);

  const tile = "flex h-12 min-w-[48px] select-none items-center justify-center rounded-xl border-2 px-3 font-arabic text-[1.625rem] leading-none transition-[transform,background-color,border-color] duration-100";

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      <MeaningPrompt>{challenge.frenchTranslation}</MeaningPrompt>

      {/* The word being built */}
      <div
        className={cn(
          "relative flex min-h-[72px] w-full max-w-md flex-row-reverse flex-wrap items-center justify-center gap-2 rounded-2xl border-2 p-3",
          !judged && (placed.length ? "border-[#E0E0E0] bg-white" : "border-dashed border-[#D2D2DC] bg-white"),
          status === "correct" && "border-[#1F9D4D] bg-[#F1FBF3]",
          status === "wrong" && "border-[#D93A3A] bg-[#FEF5F5]",
        )}
        dir="ltr"
      >
        {status === "correct" ? (
          <span className="flex flex-col items-center">
            <span className="font-arabic text-[2rem] leading-[1.4] text-brilliant-text" dir="rtl" lang="ar">{challenge.arabicWord}</span>
            <Translit arabic={challenge.arabicWord} className="text-[0.8125rem]" />
            <SpeakButton arabic={challenge.arabicWord} size="sm" className="absolute left-2 top-1/2 -translate-y-1/2 !bg-white" />
          </span>
        ) : placed.length === 0 ? (
          <span className="text-[0.9375rem] text-brilliant-muted">{t.lesson.anagramInstruction}</span>
        ) : (
          placed.map((id, at) => (
            <button
              key={id}
              type="button"
              disabled={locked}
              onClick={() => setPlaced((p) => p.filter((_, i) => i !== at))}
              className={cn(tile, status === "wrong" ? "border-[#EFB4B4] bg-white text-[#B42323]" : "border-[#6967FB] bg-[#6967FB] text-white active:translate-y-[3px] active:!shadow-none")}
              style={{ boxShadow: status === "wrong" ? "none" : "0 3px 0 0 #4A48D4" }}
            >
              {letters[id]?.letter}
            </button>
          ))
        )}
      </div>

      {/* The letters to pick from: a used letter leaves its slot, so the others never move */}
      <div className={cn("flex flex-row-reverse flex-wrap justify-center gap-2", (!bank || judged) && "invisible")} dir="ltr" aria-hidden={judged}>
        {(bank ?? letters).map(({ id, letter }) => {
          const used = placed.includes(id);
          return (
            <button
              key={id}
              type="button"
              disabled={used || locked}
              onClick={() => setPlaced((p) => [...p, id])}
              className={cn(tile, used ? "border-transparent bg-[#F1F1F4] text-transparent" : "border-[#E0E0E0] bg-white text-brilliant-text hover:bg-gray-50 active:translate-y-[3px] active:!shadow-none")}
              style={{ boxShadow: used ? "none" : "0 3px 0 0 #D4D4D4" }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setPlaced([])}
        disabled={locked || placed.length === 0}
        className={cn("flex min-h-[44px] select-none items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-brilliant-muted transition-opacity hover:bg-neutral-100", (judged || placed.length === 0) && "invisible")}
      >
        <RotateCcw className="h-4 w-4" strokeWidth={2.4} aria-hidden />
        {t.exercises.reset}
      </button>
    </div>
  );
};
