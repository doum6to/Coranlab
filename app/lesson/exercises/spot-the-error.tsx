"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { challengeOptions, challenges } from "@/db/schema";

type Props = {
  challenge: typeof challenges.$inferSelect;
  options: typeof challengeOptions.$inferSelect[];
  onCorrect: () => void;
  onWrong: () => void;
  onSkip: () => void;
  disabled?: boolean;
};

export const SpotTheError = ({
  challenge,
  options,
  onCorrect,
  onWrong,
  onSkip,
  disabled,
}: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");

  // The incorrect pair is the one where correct === false
  const incorrectOption = options.find((o) => !o.correct);

  const handleSelect = (optionId: number) => {
    if (disabled || status !== "none") return;
    setSelectedId(optionId);
  };

  const handleVerify = () => {
    if (selectedId === null || status !== "none") return;

    const selectedOption = options.find((o) => o.id === selectedId);
    if (!selectedOption) return;

    if (!selectedOption.correct) {
      // User found the wrong pair — correct!
      setStatus("correct");
      setTimeout(() => onCorrect(), 800);
    } else {
      // User picked a correct pair — wrong answer
      setStatus("wrong");
      onWrong();
      // Don't reset — stay in "wrong" state showing the correct answer
    }
  };

  const handleContinue = () => {
    // Move to next exercise after seeing the answer (wrong path)
    onSkip();
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-6">
      {/* Instruction */}
      <p className="text-xs sm:text-sm text-brilliant-muted font-medium text-center">
        Une de ces paires est fausse. Trouve l&apos;erreur !
      </p>

      {/* Pairs list */}
      <div className="flex flex-col gap-1.5 sm:gap-2.5 w-full max-w-md">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={disabled || status !== "none"}
            className={cn(
              "flex items-center justify-between px-4 py-3 sm:py-4 rounded-2xl border-2 transition-all",
              // Default
              selectedId !== option.id && status === "none" &&
                "border-[#E0E0E0] bg-white hover:bg-gray-50",
              // Selected
              selectedId === option.id && status === "none" &&
                "border-[#6967FB] bg-[#f0f0ff]",
              // Correct (this was the wrong pair, user found it)
              selectedId === option.id && status === "correct" &&
                "border-brilliant-green bg-brilliant-success",
              // Wrong (this was a correct pair, user picked wrong)
              selectedId === option.id && status === "wrong" &&
                "border-red-400 bg-red-50",
              // Reveal the actual error when user picks wrong
              status === "wrong" && !option.correct &&
                "border-brilliant-green bg-brilliant-success ring-2 ring-brilliant-green",
              // Dim correct pairs after verification (except selected)
              selectedId !== option.id && status !== "none" && option.correct &&
                "opacity-50",
              disabled && "cursor-not-allowed"
            )}
            style={{
              boxShadow: selectedId === option.id || status !== "none"
                ? "none"
                : "0 4px 0 0 #D4D4D4",
            }}
          >
            <span className="font-arabic text-lg sm:text-xl text-brilliant-text" dir="rtl">
              {option.arabicText}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 mx-2">=</span>
            <span className="text-xs sm:text-sm font-semibold text-brilliant-text text-right flex-1">
              {option.frenchText}
            </span>
          </button>
        ))}
      </div>

      {/* Verify button — only when no answer yet */}
      {status === "none" && (
        <button
          onClick={handleVerify}
          disabled={selectedId === null || disabled}
          className={cn(
            "mt-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all",
            selectedId !== null
              ? "bg-[#6967FB] text-white hover:bg-[#5856d6] shadow-[0_4px_0_0_#4a49b8]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          C&apos;est celle-ci !
        </button>
      )}

      {/* Wrong answer: show correct answer + continue button */}
      {status === "wrong" && (
        <div className="w-full max-w-md flex flex-col items-center gap-3 mt-2">
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 w-full text-center">
            <p className="text-xs text-red-400 font-semibold mb-1">Pas tout à fait !</p>
            <p className="text-sm font-bold text-brilliant-text">
              La paire incorrecte était : <span className="font-arabic" dir="rtl">{incorrectOption?.arabicText}</span> = {incorrectOption?.frenchText}
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="px-8 py-3 rounded-2xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_0_0_#b91c1c] transition-all active:translate-y-[3px] active:!shadow-none"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};
