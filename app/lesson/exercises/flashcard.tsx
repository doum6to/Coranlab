"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { challengeOptions } from "@/db/schema";
import { useT } from "@/lib/i18n/use-t";
import { SpeakButton, playWord } from "@/components/word-audio";
import { Translit } from "@/components/translit";
import { MatchBoard, type ExerciseAction } from "./choice";

type Props = {
  options: typeof challengeOptions.$inferSelect[];
  onComplete: () => void;
  /** Tells the lesson what its footer button does for this exercise. */
  onAction: (action: ExerciseAction) => void;
  disabled?: boolean;
};

type Phase = "learn" | "match";

/** Words are discovered a few at a time: 2 per round up to 4 words, 4 beyond. A lone last word joins the round before it. */
function rounds<T>(pairs: T[]): T[][] {
  const size = pairs.length <= 4 ? 2 : 4;
  const out: T[][] = [];
  for (let i = 0; i < pairs.length; i += size) out.push(pairs.slice(i, i + size));
  if (out.length > 1 && out[out.length - 1].length === 1) out[out.length - 2].push(...out.pop()!);
  return out;
}

export const Flashcard = ({ options, onComplete, onAction, disabled }: Props) => {
  const t = useT();
  const pairs = options.filter((o) => o.arabicText && o.frenchText);
  const chunks = rounds(pairs);

  const [chunkIndex, setChunkIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("learn");
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const chunk = chunks[chunkIndex] ?? [];

  // Discovering: the footer moves on to the pairing. Pairing: it waits for the last pair.
  useEffect(() => {
    onAction(
      phase === "learn"
        ? { label: "next", disabled: false, run: () => { setFlipped(new Set()); setPhase("match"); } }
        : { label: "next", disabled: true, run: () => {} },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, chunkIndex]);

  const flip = (id: number) => {
    if (disabled) return;
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const roundDone = () => {
    if (chunkIndex < chunks.length - 1) {
      setChunkIndex((i) => i + 1);
      setPhase("learn");
    } else {
      onComplete();
    }
  };

  // One line of guidance (the heading already names the exercise) and, when the words come in
  // several rounds, a segment per round.
  const step = (
    <div className="flex flex-col items-center gap-2.5">
      {chunks.length > 1 && (
        <div className="flex gap-1.5" role="img" aria-label={`${chunkIndex + 1} / ${chunks.length}`}>
          {chunks.map((_, i) => (
            <span key={i} className={cn("h-1.5 w-6 rounded-full", i < chunkIndex ? "bg-[#6967FB]" : i === chunkIndex ? "bg-[#6967FB]/50" : "bg-[#E9E9EF]")} />
          ))}
        </div>
      )}
      <p className="text-center text-[0.9375rem] leading-snug text-brilliant-muted">{phase === "learn" ? t.exercises.tapCard : t.lesson.matchPairs}</p>
    </div>
  );

  if (phase === "match") {
    return (
      <div className="flex flex-col items-center gap-4 sm:gap-6">
        {step}
        <MatchBoard key={chunkIndex} pairs={chunk} onDone={roundDone} disabled={disabled} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      {step}
      <div className={cn("w-full max-w-md gap-3", chunk.length === 1 ? "flex justify-center" : "grid grid-cols-2")}>
        {chunk.map((pair) => {
          const open = flipped.has(pair.id);
          const turn = () => { if (!open) void playWord(pair.arabicText); flip(pair.id); };
          return (
            <div
              key={pair.id}
              role="button"
              tabIndex={0}
              aria-pressed={open}
              aria-label={open ? pair.frenchText ?? undefined : pair.arabicText ?? undefined}
              className={cn("card-flip aspect-[4/3] cursor-pointer select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#6967FB] focus-visible:ring-offset-2", chunk.length === 1 && "w-1/2")}
              onClick={turn}
              onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); turn(); } }}
            >
              <div className={cn("card-flip-inner relative h-full w-full", open && "flipped")}>
                <div className="card-flip-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-[#E0E0E0] bg-white p-3" style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}>
                  <span className="font-arabic text-[2rem] leading-[1.5] text-brilliant-text" dir="rtl" lang="ar">{pair.arabicText}</span>
                  <Translit arabic={pair.arabicText} className="text-[0.8125rem]" />
                  <SpeakButton arabic={pair.arabicText} size="sm" className="absolute left-2 top-2" />
                  <RotateCw className="absolute bottom-2.5 right-2.5 h-4 w-4 text-[#B4B4C2]" strokeWidth={2.2} aria-hidden />
                </div>
                <div className="card-flip-back absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-[#6967FB]/30 bg-[#F4F4FF] p-3" style={{ boxShadow: "0 4px 0 0 #c8c7f0" }}>
                  <span className="text-center text-[1.0625rem] font-bold leading-snug text-[#5452E0]" style={{ textWrap: "balance" as never }}>{pair.frenchText}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
