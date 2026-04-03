"use client";

import { useState } from "react";

type Word = {
  arabic: string;
  french: string;
};

const Flashcard = ({ word }: { word: Word }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="cursor-pointer select-none"
      style={{ perspective: "800px" }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front — Arabic word */}
        <div
          className="rounded-2xl border-2 border-[#E0E0E0] bg-white px-3 py-6 sm:px-4 sm:py-8 flex flex-col items-center justify-center text-center overflow-hidden"
          style={{
            boxShadow: "0 4px 0 0 #D4D4D4",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            minHeight: "120px",
          }}
        >
          <p
            className="text-xl sm:text-2xl md:text-3xl font-bold text-brilliant-text leading-tight font-arabic"
            dir="rtl"
            style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
          >
            {word.arabic}
          </p>
          <p className="text-[9px] sm:text-[10px] text-brilliant-muted mt-2 uppercase tracking-wider">
            Retourner
          </p>
        </div>

        {/* Back — French translation */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-[#6967fb] bg-[#f5f5ff] px-3 py-6 sm:px-4 sm:py-8 flex flex-col items-center justify-center text-center overflow-hidden"
          style={{
            boxShadow: "0 4px 0 0 #4a48d4",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p
            className="text-xs sm:text-sm md:text-base font-bold text-[#6967fb] leading-snug"
            style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
          >
            {word.french}
          </p>
          <div className="w-8 h-px bg-[#6967fb]/20 my-1.5" />
          <p
            className="text-base sm:text-lg md:text-xl font-bold text-brilliant-text leading-tight font-arabic"
            dir="rtl"
            style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
          >
            {word.arabic}
          </p>
        </div>
      </div>
    </div>
  );
};

export const FlashcardGrid = ({ words }: { words: Word[] }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {words.map((word, i) => (
        <Flashcard key={i} word={word} />
      ))}
    </div>
  );
};
