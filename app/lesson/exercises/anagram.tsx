"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { challengeOptions, challenges } from "@/db/schema";
import { ShinyButton } from "@/components/ui/shiny-button";

type Props = {
  challenge: typeof challenges.$inferSelect;
  options: typeof challengeOptions.$inferSelect[];
  onCorrect: () => void;
  onWrong: () => void;
  disabled?: boolean;
};

export const Anagram = ({
  challenge,
  options,
  onCorrect,
  onWrong,
  disabled,
}: Props) => {
  const letters = useMemo(() => {
    return options.map((o, idx) => ({
      id: idx,
      letter: o.arabicText || o.text,
    }));
  }, [options]);

  // Shuffle ONCE on mount — stable across re-renders
  const shuffledLetters = useMemo(
    () => [...letters].sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [availableLetters, setAvailableLetters] = useState(
    shuffledLetters.map((l) => l.id)
  );
  const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");

  const handleLetterClick = (letterId: number) => {
    if (disabled || status !== "none") return;
    setSelectedLetters((prev) => [...prev, letterId]);
    setAvailableLetters((prev) => prev.filter((id) => id !== letterId));
  };

  const handleRemoveLetter = (index: number) => {
    if (disabled || status !== "none") return;
    const letterId = selectedLetters[index];
    setSelectedLetters((prev) => prev.filter((_, i) => i !== index));
    setAvailableLetters((prev) => [...prev, letterId]);
  };

  const handleCheck = () => {
    if (disabled) return;
    const target = challenge.arabicWord?.replace(/\s/g, "") || "";
    const assembled = selectedLetters
      .map((id) => letters.find((l) => l.id === id)?.letter || "")
      .join("");

    if (assembled === target) {
      setStatus("correct");
      setTimeout(() => onCorrect(), 500);
    } else {
      setStatus("wrong");
      setTimeout(() => {
        setStatus("none");
        onWrong();
      }, 800);
    }
  };

  const handleReset = () => {
    setSelectedLetters([]);
    setAvailableLetters(shuffledLetters.map((l) => l.id));
    setStatus("none");
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* French translation prompt */}
      <div
        className="flex items-center justify-center p-4 sm:p-5 bg-[#f0f0ff] rounded-2xl border-2 border-[#6967FB]/30 w-full max-w-[280px]"
        style={{ boxShadow: "0 4px 0 0 #c8c7f0" }}
      >
        <span className="text-lg sm:text-xl font-bold text-[#6967FB] text-center">
          {challenge.frenchTranslation}
        </span>
      </div>

      <p className="text-sm text-brilliant-muted">Reconstituez le mot arabe</p>

      {/* Answer zone */}
      <div className={cn(
        "flex flex-row-reverse gap-2 min-h-[56px] p-3 sm:p-4 rounded-2xl border-2 w-full max-w-md justify-center flex-wrap items-center",
        status === "correct" && "border-brilliant-green bg-brilliant-success",
        status === "wrong" && "border-red-400 bg-red-50",
        status === "none" && "border-[#E0E0E0] bg-white"
      )}>
        {selectedLetters.length === 0 && (
          <span className="text-brilliant-muted text-sm">Cliquez sur les lettres ci-dessous</span>
        )}
        {selectedLetters.map((letterId, idx) => {
          const letter = letters.find((l) => l.id === letterId);
          return (
            <button
              key={`sel-${idx}`}
              onClick={() => handleRemoveLetter(idx)}
              className="h-10 sm:h-12 px-3 bg-[#6967FB] text-white rounded-xl font-arabic text-xl sm:text-2xl hover:bg-[#6967FB]/90 transition"
              style={{ boxShadow: "0 3px 0 0 #4a48d4" }}
            >
              {letter?.letter}
            </button>
          );
        })}
      </div>

      {/* Available letters */}
      <div className="flex flex-row-reverse gap-2 flex-wrap justify-center">
        {shuffledLetters.map((letter) => (
          <button
            key={`avail-${letter.id}`}
            onClick={() => handleLetterClick(letter.id)}
            disabled={!availableLetters.includes(letter.id) || disabled || status !== "none"}
            className={cn(
              "h-10 sm:h-12 px-3 sm:px-4 rounded-xl border-2 font-arabic text-xl sm:text-2xl transition",
              availableLetters.includes(letter.id)
                ? "bg-white border-[#E0E0E0] hover:border-[#6967FB]/40 hover:bg-gray-50 text-brilliant-text"
                : "bg-[#F5F5F5] border-[#F5F5F5] text-transparent"
            )}
            style={{
              boxShadow: availableLetters.includes(letter.id) ? "0 3px 0 0 #D4D4D4" : "none"
            }}
          >
            {letter.letter}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-xs">
        <div className="w-1/2">
          <ShinyButton
            variant="outline-green"
            onClick={handleReset}
            disabled={disabled || selectedLetters.length === 0}
          >
            Réinitialiser
          </ShinyButton>
        </div>
        <div className="w-1/2">
          <ShinyButton
            variant={availableLetters.length === 0 && status === "none" ? "green" : "gray"}
            onClick={handleCheck}
            disabled={disabled || availableLetters.length > 0 || status !== "none"}
          >
            Vérifier
          </ShinyButton>
        </div>
      </div>
    </div>
  );
};
