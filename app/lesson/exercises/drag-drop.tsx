"use client";

import { challengeOptions, challenges } from "@/db/schema";
import { Choice, Choices, WordPrompt } from "./choice";
import { AFTER_ANSWER_MS, useAutoPlayWord } from "@/components/word-audio";

type Props = {
  challenge: typeof challenges.$inferSelect;
  options: typeof challengeOptions.$inferSelect[];
  onSelect: (id: number) => void;
  selectedOption?: number;
  status: "correct" | "wrong" | "none";
  disabled?: boolean;
};

export const DragDrop = ({
  challenge,
  options,
  onSelect,
  selectedOption,
  status,
  disabled,
}: Props) => {
  // The reading aids (phonetics, voice) come once the answer is given: before, they would give it away.
  const answered = status !== "none";
  useAutoPlayWord(challenge.arabicWord, answered, false, AFTER_ANSWER_MS);
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      {/* Arabic word in center */}
      <WordPrompt arabic={challenge.arabicWord} revealAids={answered} />


      {/* Translation boxes */}
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
