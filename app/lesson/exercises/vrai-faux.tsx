"use client";

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

export const VraiFaux = ({
  challenge,
  options,
  onSelect,
  selectedOption,
  status,
  disabled,
}: Props) => {
  const vraiOption = options.find((o) => o.text === "VRAI");
  const fauxOption = options.find((o) => o.text === "FAUX");

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-6">
      {/* Arabic word */}
      <div
        className="flex items-center justify-center p-3 sm:p-6 bg-white rounded-2xl border-2 border-[#E0E0E0] w-full max-w-[280px]"
        style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
      >
        <span className="font-arabic text-3xl sm:text-4xl text-brilliant-text" dir="rtl">
          {challenge.arabicWord}
        </span>
      </div>

      {/* Proposed translation */}
      <div
        className="flex items-center justify-center p-4 bg-[#f0f0ff] rounded-2xl border-2 border-[#6967FB]/30 w-full max-w-[280px]"
        style={{ boxShadow: "0 4px 0 0 #c8c7f0" }}
      >
        <span className="text-lg sm:text-xl font-bold text-[#6967FB] text-center">
          = &quot;{challenge.frenchTranslation}&quot; ?
        </span>
      </div>

      <p className="text-xs sm:text-sm text-brilliant-muted">Cette traduction est-elle correcte ?</p>

      {/* VRAI / FAUX buttons */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-sm">
        {vraiOption && (
          <button
            onClick={() => onSelect(vraiOption.id)}
            disabled={disabled}
            className={cn(
              "h-14 sm:h-20 rounded-2xl border-2 font-bold text-lg sm:text-xl transition",
              selectedOption === vraiOption.id && status === "none" &&
                "border-[#6967FB] bg-[#f0f0ff] text-[#6967FB]",
              selectedOption === vraiOption.id && status === "correct" &&
                "border-brilliant-green bg-brilliant-success text-brilliant-green",
              selectedOption === vraiOption.id && status === "wrong" &&
                "border-red-400 bg-red-50 text-red-600",
              selectedOption !== vraiOption.id && status === "none" &&
                "border-[#E0E0E0] bg-white text-brilliant-green hover:border-[#6967FB]/40",
              selectedOption !== vraiOption.id && status !== "none" &&
                vraiOption.correct && "border-brilliant-green bg-brilliant-success text-brilliant-green",
              selectedOption !== vraiOption.id && status !== "none" &&
                !vraiOption.correct && "opacity-40",
              disabled && "cursor-not-allowed"
            )}
            style={{
              boxShadow: selectedOption === vraiOption.id ? "none" :
                status !== "none" ? "none" : "0 4px 0 0 #D4D4D4"
            }}
          >
            VRAI
          </button>
        )}
        {fauxOption && (
          <button
            onClick={() => onSelect(fauxOption.id)}
            disabled={disabled}
            className={cn(
              "h-14 sm:h-20 rounded-2xl border-2 font-bold text-lg sm:text-xl transition",
              selectedOption === fauxOption.id && status === "none" &&
                "border-[#6967FB] bg-[#f0f0ff] text-[#6967FB]",
              selectedOption === fauxOption.id && status === "correct" &&
                "border-brilliant-green bg-brilliant-success text-brilliant-green",
              selectedOption === fauxOption.id && status === "wrong" &&
                "border-red-400 bg-red-50 text-red-600",
              selectedOption !== fauxOption.id && status === "none" &&
                "border-[#E0E0E0] bg-white text-rose-500 hover:border-[#6967FB]/40",
              selectedOption !== fauxOption.id && status !== "none" &&
                fauxOption.correct && "border-brilliant-green bg-brilliant-success text-brilliant-green",
              selectedOption !== fauxOption.id && status !== "none" &&
                !fauxOption.correct && "opacity-40",
              disabled && "cursor-not-allowed"
            )}
            style={{
              boxShadow: selectedOption === fauxOption.id ? "none" :
                status !== "none" ? "none" : "0 4px 0 0 #D4D4D4"
            }}
          >
            FAUX
          </button>
        )}
      </div>
    </div>
  );
};
