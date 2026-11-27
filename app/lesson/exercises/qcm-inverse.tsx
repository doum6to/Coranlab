"use client";

import { challengeOptions, challenges } from "@/db/schema";
import { Choice, Choices, MeaningPrompt } from "./choice";
import { AFTER_ANSWER_MS, SpeakButton, useAutoPlayWord } from "@/components/word-audio";
import { listenWord } from "@/lib/word-audio";
import { useT } from "@/lib/i18n/use-t";
import { Translit } from "@/components/translit";

type Props = {
  challenge: typeof challenges.$inferSelect;
  options: typeof challengeOptions.$inferSelect[];
  onSelect: (id: number) => void;
  selectedOption?: number;
  status: "correct" | "wrong" | "none";
  disabled?: boolean;
  /** Listening variant: the word is heard and the learner picks how it is written. */
  listen?: boolean;
};

export const QCMInverse = ({
  challenge,
  options,
  onSelect,
  selectedOption,
  status,
  disabled,
  listen = false,
}: Props) => {
  const t = useT();
  const answered = status !== "none";
  // The word of the right answer: the question itself in the listening variant, read out after the answer otherwise.
  const heard = listenWord({ ...challenge, challengeOptions: options });
  useAutoPlayWord(heard, listen || answered, listen, listen ? 250 : AFTER_ANSWER_MS);
  const hidden = listen && !answered;
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      {/* French translation display */}
      {hidden ? (
        <div className="flex flex-col items-center gap-2 py-1">
          <SpeakButton arabic={heard} size="lg" />
          <span className="text-xs font-semibold text-brilliant-muted">{t.audio.tapToListen}</span>
        </div>
      ) : (
      <MeaningPrompt className="gap-3">
        {listen && <SpeakButton arabic={heard} size="sm" className="!bg-white" />}
        {challenge.frenchTranslation}
      </MeaningPrompt>
      )}


      {/* Arabic options */}
      <Choices>
        {options.map((option, i) => (
          <Choice key={option.id} className="min-h-[68px]" index={i + 1} selected={selectedOption === option.id} status={status} correct={option.correct} disabled={disabled} onClick={() => onSelect(option.id)}>
            <span className="flex flex-col items-start">
              <span className="font-arabic text-[1.625rem] leading-[1.35] text-brilliant-text" dir="rtl" lang="ar">{option.arabicText || option.text}</span>
              <Translit arabic={option.arabicText || option.text} className="-mt-0.5 text-[0.8125rem]" />
            </span>
          </Choice>
        ))}
      </Choices>
    </div>
  );
};
