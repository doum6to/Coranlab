"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { challengeOptions } from "@/db/schema";

type Props = {
  options: typeof challengeOptions.$inferSelect[];
  onComplete: () => void;
  disabled?: boolean;
};

export const Matching = ({ options, onComplete, disabled }: Props) => {
  const pairs = options.filter((o) => o.arabicText && o.frenchText);

  // Shuffle French ONCE on mount — stable across re-renders
  const shuffledFrench = useMemo(
    () => [...pairs].sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [selectedArabic, setSelectedArabic] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [wrongMatch, setWrongMatch] = useState<number | null>(null);

  const handleArabicClick = (pairIndex: number) => {
    if (disabled || matchedPairs.has(pairIndex)) return;
    setSelectedArabic(pairIndex);
    setWrongMatch(null);
  };

  const handleFrenchClick = (pairIndex: number) => {
    if (disabled || matchedPairs.has(pairIndex) || selectedArabic === null) return;

    if (selectedArabic === pairIndex) {
      const newMatched = new Set(matchedPairs);
      newMatched.add(pairIndex);
      setMatchedPairs(newMatched);
      setSelectedArabic(null);
      setWrongMatch(null);

      if (newMatched.size === pairs.length) {
        setTimeout(() => onComplete(), 500);
      }
    } else {
      setWrongMatch(pairIndex);
      setTimeout(() => setWrongMatch(null), 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-6">
      <p className="text-xs sm:text-sm font-semibold text-brilliant-muted">
        Reliez chaque mot à sa traduction
      </p>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full max-w-md">
        {/* Left column: Arabic */}
        <div className="flex flex-col gap-1.5 sm:gap-3">
          <div className="text-[10px] text-brilliant-muted font-bold uppercase text-center mb-0.5">
            Arabe
          </div>
          {pairs.map((pair) => (
            <button
              key={`ar-${pair.id}`}
              onClick={() => handleArabicClick(pair.pairIndex!)}
              disabled={matchedPairs.has(pair.pairIndex!) || disabled}
              className={cn(
                "h-11 sm:h-16 flex items-center justify-center rounded-2xl border-2 transition",
                matchedPairs.has(pair.pairIndex!)
                  ? "bg-brilliant-success border-brilliant-green/30 opacity-60"
                  : selectedArabic === pair.pairIndex
                    ? "bg-[#f0f0ff] border-[#6967FB]"
                    : "bg-white border-[#E0E0E0] hover:bg-gray-50"
              )}
              style={{
                boxShadow: matchedPairs.has(pair.pairIndex!) ? "none" :
                  selectedArabic === pair.pairIndex ? "none" : "0 4px 0 0 #D4D4D4"
              }}
            >
              <span className="font-arabic text-xl sm:text-2xl text-brilliant-text" dir="rtl">
                {pair.arabicText}
              </span>
            </button>
          ))}
        </div>
        {/* Right column: French (shuffled once, stable) */}
        <div className="flex flex-col gap-1.5 sm:gap-3">
          <div className="text-[10px] text-brilliant-muted font-bold uppercase text-center mb-0.5">
            Français
          </div>
          {shuffledFrench.map((pair) => (
            <button
              key={`fr-${pair.id}`}
              onClick={() => handleFrenchClick(pair.pairIndex!)}
              disabled={matchedPairs.has(pair.pairIndex!) || disabled}
              className={cn(
                "h-11 sm:h-16 flex items-center justify-center rounded-2xl border-2 transition px-2",
                matchedPairs.has(pair.pairIndex!)
                  ? "bg-brilliant-success border-brilliant-green/30 opacity-60"
                  : wrongMatch === pair.pairIndex
                    ? "bg-red-50 border-red-400"
                    : "bg-white border-[#E0E0E0] hover:bg-gray-50"
              )}
              style={{
                boxShadow: matchedPairs.has(pair.pairIndex!) || wrongMatch === pair.pairIndex
                  ? "none" : "0 4px 0 0 #D4D4D4"
              }}
            >
              <span className="text-xs sm:text-sm font-semibold text-brilliant-text text-center leading-tight">
                {pair.frenchText}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
