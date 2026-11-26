"use client";

import { useState } from "react";

import { challengeOptions, challenges } from "@/db/schema";
import { Choice, Choices, WordPrompt } from "./choice";
import { AFTER_ANSWER_MS, useAutoPlayWord } from "@/components/word-audio";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

type Level = "sure" | "hesitant" | "none";

type Props = {
  challenge: typeof challenges.$inferSelect;
  options: typeof challengeOptions.$inferSelect[];
  onSelect: (id: number) => void;
  selectedOption?: number;
  status: "correct" | "wrong" | "none";
  disabled?: boolean;
};

/**
 * The learner first says how well they know the word, then answers. Saying it before seeing
 * the choices is what makes the answer stick; nothing is won or lost on it.
 */
export const ConfidenceBet = ({ challenge, options, onSelect, selectedOption, status, disabled }: Props) => {
  const t = useT();
  // The reading aids (phonetics, voice) come once the answer is given: before, they would give it away.
  const answered = status !== "none";
  useAutoPlayWord(challenge.arabicWord, answered, false, AFTER_ANSWER_MS);
  const levels: [Level, string][] = [["sure", t.lesson.confident], ["hesitant", t.lesson.hesitant], ["none", t.exercises.noIdea]];
  const [level, setLevel] = useState<Level | null>(null);
  const [phase, setPhase] = useState<"ask" | "answer">("ask");

  const say = (l: Level) => {
    if (level) return;
    setLevel(l);
    setTimeout(() => setPhase("answer"), 350);
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      <WordPrompt arabic={challenge.arabicWord} revealAids={answered} />

      {phase === "ask" ? (
        <>
          <p className="text-center text-[0.9375rem] leading-snug text-brilliant-muted">{t.lesson.betIntro}</p>
          <div className="flex w-full max-w-sm flex-col gap-2.5" role="group">
            {levels.map(([l, label]) => (
              <Choice key={l} selected={level === l} status="none" correct={false} disabled={disabled} onClick={() => say(l)} align="center">
                {label}
              </Choice>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="rounded-full bg-[#F1F1F4] px-3 py-1 text-[0.8125rem] font-semibold text-brilliant-muted">
            {tpl(t.exercises.yourGuess, { label: levels.find(([l]) => l === level)?.[1] ?? "" })}
          </p>
          <Choices label={t.lesson.whatTranslation}>
            {options.map((option, i) => (
              <Choice key={option.id} index={i + 1} selected={selectedOption === option.id} status={status} correct={option.correct} disabled={disabled} onClick={() => onSelect(option.id)}>
                {option.frenchText || option.text}
              </Choice>
            ))}
          </Choices>
        </>
      )}
    </div>
  );
};
