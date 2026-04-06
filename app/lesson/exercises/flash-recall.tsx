"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { challengeOptions, challenges } from "@/db/schema";

type Props = {
  challenge: typeof challenges.$inferSelect;
  options: typeof challengeOptions.$inferSelect[];
  onSelect: (id: number) => void;
  selectedOption?: number;
  status: "correct" | "wrong" | "none";
  disabled?: boolean;
};

export const FlashRecall = ({
  challenge,
  options,
  onSelect,
  selectedOption,
  status,
  disabled,
}: Props) => {
  const [phase, setPhase] = useState<"show" | "fade" | "answer">("show");

  useEffect(() => {
    // Show the word for 2 seconds
    const fadeTimer = setTimeout(() => setPhase("fade"), 2000);
    const answerTimer = setTimeout(() => setPhase("answer"), 2500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(answerTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-6">
      {/* Arabic word — visible briefly then fades */}
      <div
        className={cn(
          "flex items-center justify-center p-4 sm:p-6 bg-white rounded-2xl border-2 border-[#E0E0E0] w-full max-w-[280px] transition-all duration-500",
          phase === "show" && "opacity-100 scale-100",
          phase === "fade" && "opacity-0 scale-95",
          phase === "answer" && "opacity-0 scale-95 h-0 p-0 border-0 overflow-hidden"
        )}
        style={{ boxShadow: phase === "show" ? "0 4px 0 0 #D4D4D4" : "none" }}
      >
        <span className="font-arabic text-3xl sm:text-5xl text-brilliant-text" dir="rtl">
          {challenge.arabicWord}
        </span>
      </div>

      {/* Timer / prompt */}
      {phase === "show" && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs sm:text-sm text-brilliant-muted font-medium">
            Mémorise ce mot...
          </p>
          <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6967FB] rounded-full"
              style={{
                animation: "shrink 2s linear forwards",
              }}
            />
          </div>
        </div>
      )}

      {phase === "fade" && (
        <p className="text-sm text-brilliant-muted animate-pulse">...</p>
      )}

      {/* Answer choices — appear after the word disappears */}
      {phase === "answer" && (
        <>
          <div className="flex items-center justify-center p-3 sm:p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 w-full max-w-[280px]">
            <span className="text-sm sm:text-base text-gray-400 font-medium">
              Quel était ce mot ?
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brilliant-muted">
            Choisis la bonne traduction
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3 w-full max-w-md">
            {options.map((option, i) => (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                disabled={disabled}
                className={cn(
                  "h-12 sm:h-16 px-4 rounded-2xl border-2 font-semibold text-sm transition flex items-center gap-3",
                  selectedOption === option.id && status === "none" &&
                    "border-[#6967FB] bg-[#f0f0ff] text-brilliant-text",
                  selectedOption === option.id && status === "correct" &&
                    "border-brilliant-green bg-brilliant-success text-brilliant-green",
                  selectedOption === option.id && status === "wrong" &&
                    "border-red-400 bg-red-50 text-red-600",
                  selectedOption !== option.id && status === "none" &&
                    "border-[#E0E0E0] bg-white hover:bg-gray-50 text-brilliant-text",
                  selectedOption !== option.id && status !== "none" &&
                    option.correct && "border-brilliant-green bg-brilliant-success text-brilliant-green",
                  selectedOption !== option.id && status !== "none" &&
                    !option.correct && "border-[#E0E0E0] bg-white opacity-40",
                  disabled && "cursor-not-allowed"
                )}
                style={{
                  boxShadow: selectedOption === option.id ? "none" :
                    status !== "none" ? "none" : "0 4px 0 0 #D4D4D4"
                }}
              >
                <span className={cn(
                  "w-6 h-6 rounded-lg border-2 border-[#E0E0E0] flex items-center justify-center text-xs shrink-0 text-brilliant-muted",
                  selectedOption === option.id && status === "none" && "border-[#6967FB] text-[#6967FB]",
                  selectedOption === option.id && status === "correct" && "border-brilliant-green text-brilliant-green",
                  selectedOption === option.id && status === "wrong" && "border-red-400 text-red-600",
                )}>
                  {i + 1}
                </span>
                <span className="text-left">{option.frenchText || option.text}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
