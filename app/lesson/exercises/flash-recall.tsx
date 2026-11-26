"use client";

import { useEffect, useState } from "react";

import { challengeOptions, challenges } from "@/db/schema";
import { Choice, Choices, WordPrompt } from "./choice";
import { AFTER_ANSWER_MS, useAutoPlayWord } from "@/components/word-audio";
import { useT } from "@/lib/i18n/use-t";

type Props = {
  challenge: typeof challenges.$inferSelect;
  options: typeof challengeOptions.$inferSelect[];
  onSelect: (id: number) => void;
  selectedOption?: number;
  status: "correct" | "wrong" | "none";
  disabled?: boolean;
};

/** How long the word stays on screen before it has to be recalled. */
const SHOW_MS = 2000;

/** The word is shown for two seconds, hidden, then asked for; it comes back once the answer is given. */
export const FlashRecall = ({ challenge, options, onSelect, selectedOption, status, disabled }: Props) => {
  const t = useT();
  const answered = status !== "none";
  // Read out once the answer is given (before, the sound would give it away).
  useAutoPlayWord(challenge.arabicWord, answered, false, AFTER_ANSWER_MS);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShown(false), SHOW_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      {/* The panel never moves: the word leaves it, then returns with its reading aids */}
      <WordPrompt arabic={challenge.arabicWord} revealAids={answered} size="lg" concealed={!shown && !answered ? t.lesson.whatWord : undefined} />

      {shown ? (
        // The heading already says to memorise: here, only the time left.
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#E9E9EF]" role="img" aria-label={t.exercises.memorize}>
          <div className="h-full origin-left rounded-full bg-[#6967FB]" style={{ animation: `recall-countdown ${SHOW_MS}ms linear forwards` }} />
        </div>
      ) : (
        <Choices label={t.lesson.chooseTranslation}>
          {options.map((option, i) => (
            <Choice key={option.id} index={i + 1} selected={selectedOption === option.id} status={status} correct={option.correct} disabled={disabled} onClick={() => onSelect(option.id)}>
              {option.frenchText || option.text}
            </Choice>
          ))}
        </Choices>
      )}

      <style jsx>{`
        @keyframes recall-countdown {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};
