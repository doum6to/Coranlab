"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { challengeOptions, challenges } from "@/db/schema";

type BetLevel = "sure" | "hesitant" | "fifty";

const BET_CONFIG: Record<BetLevel, { label: string; emoji: string; description: string; color: string; borderColor: string; bgColor: string }> = {
  sure: {
    label: "Je suis sûr(e)",
    emoji: "🔥",
    description: "+20 XP si correct, -10 XP si faux",
    color: "text-emerald-600",
    borderColor: "border-emerald-400",
    bgColor: "bg-emerald-50",
  },
  hesitant: {
    label: "J'hésite",
    emoji: "🤔",
    description: "+10 XP si correct, -5 XP si faux",
    color: "text-amber-600",
    borderColor: "border-amber-400",
    bgColor: "bg-amber-50",
  },
  fifty: {
    label: "50/50",
    emoji: "🎲",
    description: "+5 XP si correct, 0 XP si faux",
    color: "text-gray-600",
    borderColor: "border-gray-400",
    bgColor: "bg-gray-50",
  },
};

type Props = {
  challenge: typeof challenges.$inferSelect;
  options: typeof challengeOptions.$inferSelect[];
  onSelect: (id: number) => void;
  selectedOption?: number;
  status: "correct" | "wrong" | "none";
  disabled?: boolean;
};

export const ConfidenceBet = ({
  challenge,
  options,
  onSelect,
  selectedOption,
  status,
  disabled,
}: Props) => {
  const [bet, setBet] = useState<BetLevel | null>(null);
  const [phase, setPhase] = useState<"bet" | "answer">("bet");

  const handleBet = (level: BetLevel) => {
    setBet(level);
    setTimeout(() => setPhase("answer"), 400);
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-6">
      {/* Arabic word always visible */}
      <div
        className="flex items-center justify-center p-3 sm:p-6 bg-white rounded-2xl border-2 border-[#E0E0E0] w-full max-w-[280px]"
        style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
      >
        <span className="font-arabic text-3xl sm:text-4xl text-brilliant-text" dir="rtl">
          {challenge.arabicWord}
        </span>
      </div>

      {phase === "bet" && (
        <>
          <p className="text-xs sm:text-sm text-brilliant-muted text-center font-medium">
            Avant de voir les réponses, parie sur ta confiance !
          </p>
          <p className="text-[10px] sm:text-xs text-gray-400 text-center">
            Tu peux gagner plus d&apos;XP... ou en perdre
          </p>

          <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-sm">
            {(Object.entries(BET_CONFIG) as [BetLevel, typeof BET_CONFIG.sure][]).map(
              ([level, config]) => (
                <button
                  key={level}
                  onClick={() => handleBet(level)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 sm:py-4 rounded-2xl border-2 transition-all",
                    "border-[#E0E0E0] bg-white hover:bg-gray-50",
                    bet === level && `${config.borderColor} ${config.bgColor}`
                  )}
                  style={{
                    boxShadow: bet === level ? "none" : "0 4px 0 0 #D4D4D4",
                  }}
                >
                  <span className="text-xl sm:text-2xl">{config.emoji}</span>
                  <div className="flex flex-col items-start">
                    <span className={cn("font-bold text-sm sm:text-base", config.color)}>
                      {config.label}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      {config.description}
                    </span>
                  </div>
                </button>
              )
            )}
          </div>
        </>
      )}

      {phase === "answer" && bet && (
        <>
          {/* Bet indicator */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
            BET_CONFIG[bet].bgColor,
            BET_CONFIG[bet].color
          )}>
            <span>{BET_CONFIG[bet].emoji}</span>
            <span>{BET_CONFIG[bet].label}</span>
          </div>

          <p className="text-xs sm:text-sm text-brilliant-muted">
            Quelle est la traduction ?
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
    </div>
  );
};
