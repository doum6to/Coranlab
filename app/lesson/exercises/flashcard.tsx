"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { challengeOptions } from "@/db/schema";
import { ShinyButton } from "@/components/ui/shiny-button";

type Props = {
  options: typeof challengeOptions.$inferSelect[];
  onComplete: () => void;
  disabled?: boolean;
};

type Phase = "learn" | "match";

export const Flashcard = ({ options, onComplete, disabled }: Props) => {
  const pairs = options.filter((o) => o.arabicText && o.frenchText);

  // Chunk size: 2 or 4 (always even). Use 2 if <= 4 pairs, else 4.
  const chunkSize = pairs.length <= 4 ? 2 : 4;
  const chunks: typeof pairs[] = [];
  for (let i = 0; i < pairs.length; i += chunkSize) {
    const chunk = pairs.slice(i, i + chunkSize);
    // If last chunk is odd and > 1, trim to even
    if (chunk.length > 1 && chunk.length % 2 !== 0) {
      chunks.push(chunk.slice(0, chunk.length - 1));
      // Push the remaining item with the next iteration if possible
      if (i + chunkSize < pairs.length) {
        // Will be picked up
      } else {
        // Last odd chunk — just include it
        chunks[chunks.length - 1] = chunk;
      }
    } else {
      chunks.push(chunk);
    }
  }

  const [chunkIndex, setChunkIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("learn");
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [selectedArabic, setSelectedArabic] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [wrongMatch, setWrongMatch] = useState<number | null>(null);

  const currentChunk = chunks[chunkIndex] || [];

  // Shuffle French ONCE per chunk (memoized by chunkIndex)
  const shuffledFrench = useMemo(
    () => [...currentChunk].sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chunkIndex]
  );

  const toggleFlip = (idx: number) => {
    if (disabled) return;
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const goToMatch = () => {
    setPhase("match");
    setFlippedCards(new Set());
    setSelectedArabic(null);
    setMatchedPairs(new Set());
    setWrongMatch(null);
  };

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

      if (newMatched.size === currentChunk.length) {
        setTimeout(() => {
          if (chunkIndex < chunks.length - 1) {
            setChunkIndex((prev) => prev + 1);
            setPhase("learn");
            setFlippedCards(new Set());
            setMatchedPairs(new Set());
          } else {
            onComplete();
          }
        }, 500);
      }
    } else {
      setWrongMatch(pairIndex);
      setTimeout(() => setWrongMatch(null), 800);
    }
  };

  if (phase === "learn") {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-sm font-semibold text-brilliant-muted">
          Découvrez les mots ({chunkIndex + 1}/{chunks.length})
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md">
          {currentChunk.map((pair, idx) => (
            <div
              key={pair.id}
              className="card-flip aspect-[4/3] cursor-pointer"
              onClick={() => toggleFlip(idx)}
            >
              <div className={cn(
                "card-flip-inner w-full h-full relative",
                flippedCards.has(idx) && "flipped"
              )}>
                <div
                  className="card-flip-front absolute inset-0 flex items-center justify-center bg-white border-2 border-[#E0E0E0] rounded-2xl p-3"
                  style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
                >
                  <span className="arabic-text text-brilliant-text">{pair.arabicText}</span>
                </div>
                <div
                  className="card-flip-back absolute inset-0 flex items-center justify-center bg-[#f0f0ff] border-2 border-[#6967FB]/30 rounded-2xl p-3"
                  style={{ boxShadow: "0 4px 0 0 #c8c7f0" }}
                >
                  <span className="text-sm sm:text-base font-bold text-[#6967FB]">{pair.frenchText}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 w-full max-w-[200px]">
          <ShinyButton variant="green" onClick={goToMatch} disabled={disabled}>
            Suivant
          </ShinyButton>
        </div>
      </div>
    );
  }

  // Match phase
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm font-semibold text-brilliant-muted">
        Reliez les paires ({chunkIndex + 1}/{chunks.length})
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md">
        {/* Left column: Arabic */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {currentChunk.map((pair) => (
            <button
              key={`ar-${pair.id}`}
              onClick={() => handleArabicClick(pair.pairIndex!)}
              disabled={matchedPairs.has(pair.pairIndex!)}
              className={cn(
                "h-14 sm:h-16 flex items-center justify-center rounded-2xl border-2 transition",
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
        {/* Right column: French (shuffled once) */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {shuffledFrench.map((pair) => (
            <button
              key={`fr-${pair.id}`}
              onClick={() => handleFrenchClick(pair.pairIndex!)}
              disabled={matchedPairs.has(pair.pairIndex!)}
              className={cn(
                "h-14 sm:h-16 flex items-center justify-center rounded-2xl border-2 transition px-2",
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
