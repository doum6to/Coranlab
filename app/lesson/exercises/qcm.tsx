"use client";

import { challengeOptions, challenges } from "@/db/schema";
import { Choice, Choices, WordPrompt } from "./choice";
import { AFTER_ANSWER_MS, SpeakButton, useAutoPlayWord } from "@/components/word-audio";
import { useT } from "@/lib/i18n/use-t";

type Props = {
  challenge: typeof challenges.$inferSelect;
  options: typeof challengeOptions.$inferSelect[];
  onSelect: (id: number) => void;
  selectedOption?: number;
  status: "correct" | "wrong" | "none";
  disabled?: boolean;
  /** Listening variant: the word is heard, not shown, until the answer is checked. */
  listen?: boolean;
};

export const QCM = ({
  challenge,
  options,
  onSelect,
  selectedOption,
  status,
  disabled,
  listen = false,
}: Props) => {
  const t = useT();
  // The voice comes once the answer is given; the phonetic reading is there from the start.
  const answered = status !== "none";
  // Listening variant: the word is the question, so it is heard at once. Otherwise it is read out after the answer.
  useAutoPlayWord(challenge.arabicWord, listen || answered, listen, listen ? 250 : AFTER_ANSWER_MS);
  const hidden = listen && !answered;
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      {/* Arabic word display */}
      {hidden ? (
        <div className="flex flex-col items-center gap-2 py-1">
          <SpeakButton arabic={challenge.arabicWord} size="lg" />
          <span className="text-xs font-semibold text-brilliant-muted">{t.audio.tapToListen}</span>
        </div>
      ) : (
      <WordPrompt arabic={challenge.arabicWord} revealAids={answered} />
      )}


      {/* French options */}
      <Choices>
        {options.map((option, i) => (
          <Choice key={option.id} index={i + 1} selected={selectedOption === option.id} status={status} correct={option.correct} disabled={disabled} onClick={() => onSelect(option.id)}>
            {option.frenchText || option.text}
          </Choice>
        ))}
      </Choices>
    </div>
  );
};
