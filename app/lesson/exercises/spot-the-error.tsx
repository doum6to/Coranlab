"use client";

import { Equal } from "lucide-react";

import { cn } from "@/lib/utils";
import { challengeOptions } from "@/db/schema";
import { Translit } from "@/components/translit";
import { Choice } from "./choice";

type Props = {
  options: typeof challengeOptions.$inferSelect[];
  onSelect: (id: number) => void;
  selectedOption?: number;
  status: "correct" | "wrong" | "none";
  disabled?: boolean;
};

/**
 * A list of word = meaning pairs, one of which is false: the learner picks the false one.
 * In the data, `correct` says whether the PAIR is true, so the answer to find is the option
 * where it is false.
 */
export const SpotTheError = ({ options, onSelect, selectedOption, status, disabled }: Props) => {
  const judged = status !== "none";

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-md flex-col gap-2.5" role="group">
        {options.map((option) => (
          <Choice key={option.id} className="min-h-[68px]" selected={selectedOption === option.id} status={status} correct={!option.correct} disabled={disabled} onClick={() => onSelect(option.id)}>
            <span className="flex items-center gap-3">
              <span className="flex min-w-[4.5rem] flex-col items-center">
                <span className="font-arabic text-[1.5rem] leading-[1.4]" dir="rtl" lang="ar">{option.arabicText}</span>
                {judged && <Translit arabic={option.arabicText} className="-mt-0.5 text-[0.75rem]" />}
              </span>
              <Equal className="h-4 w-4 shrink-0 text-[#B4B4C2]" strokeWidth={2.4} aria-hidden />
              {/* Once judged, the false meaning is struck through: nobody should leave with it in mind. */}
              <span className={cn("flex-1 text-[0.9375rem] font-semibold leading-snug", judged && !option.correct && "line-through decoration-2")}>{option.frenchText}</span>
            </span>
          </Choice>
        ))}
      </div>
    </div>
  );
};
