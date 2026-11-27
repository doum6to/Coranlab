"use client";

import { challengeOptions, challenges } from "@/db/schema";
import { Choice, WordPrompt } from "./choice";
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

export const VraiFaux = ({
  challenge,
  options,
  onSelect,
  selectedOption,
  status,
  disabled,
}: Props) => {
  const t = useT();
  // The voice comes once the answer is given; the phonetic reading is there from the start.
  const answered = status !== "none";
  useAutoPlayWord(challenge.arabicWord, answered, false, AFTER_ANSWER_MS);
  // Options keep their canonical "VRAI"/"FAUX" value (not translated), so this
  // lookup works in every language; only the displayed labels are localized.
  const vraiOption = options.find((o) => o.text === "VRAI");
  const fauxOption = options.find((o) => o.text === "FAUX");

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6">
      {/* The word and the meaning put to the learner, in one panel */}
      <WordPrompt arabic={challenge.arabicWord} revealAids={answered}>
        <span className="mr-1.5 font-medium text-brilliant-muted" aria-hidden>=</span>
        {challenge.frenchTranslation}
      </WordPrompt>

      {/* True / false */}
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {vraiOption && (
          <Choice selected={selectedOption === vraiOption.id} status={status} correct={vraiOption.correct} disabled={disabled} onClick={() => onSelect(vraiOption.id)} align="center">
            <span className="text-[1.0625rem] font-bold uppercase tracking-[0.04em]">{t.lesson.answerTrue}</span>
          </Choice>
        )}
        {fauxOption && (
          <Choice selected={selectedOption === fauxOption.id} status={status} correct={fauxOption.correct} disabled={disabled} onClick={() => onSelect(fauxOption.id)} align="center">
            <span className="text-[1.0625rem] font-bold uppercase tracking-[0.04em]">{t.lesson.answerFalse}</span>
          </Choice>
        )}
      </div>
    </div>
  );
};
