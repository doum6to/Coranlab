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

export const QCMInverse = ({
  challenge,
  options,
  onSelect,
  selectedOption,
  status,
  disabled,
}: Props) => {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* French translation display */}
      <div
        className="flex items-center justify-center p-5 sm:p-6 bg-[#f0f0ff] rounded-2xl border-2 border-[#6967FB]/30 w-full max-w-[280px]"
        style={{ boxShadow: "0 4px 0 0 #c8c7f0" }}
      >
        <span className="text-xl sm:text-2xl font-bold text-[#6967FB] text-center">
          {challenge.frenchTranslation}
        </span>
      </div>

      <p className="text-sm text-brilliant-muted">Trouvez le mot arabe correspondant</p>

      {/* Arabic options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-md">
        {options.map((option, i) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={cn(
              "h-14 sm:h-16 px-4 rounded-2xl border-2 transition flex items-center gap-3",
              selectedOption === option.id && status === "none" &&
                "border-[#6967FB] bg-[#f0f0ff]",
              selectedOption === option.id && status === "correct" &&
                "border-brilliant-green bg-brilliant-success",
              selectedOption === option.id && status === "wrong" &&
                "border-red-400 bg-red-50",
              selectedOption !== option.id && status === "none" &&
                "border-[#E0E0E0] bg-white hover:bg-gray-50",
              selectedOption !== option.id && status !== "none" &&
                option.correct && "border-brilliant-green bg-brilliant-success",
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
              "w-6 h-6 rounded-lg border-2 border-[#E0E0E0] flex items-center justify-center text-xs text-brilliant-muted shrink-0",
              selectedOption === option.id && status === "none" && "border-[#6967FB] text-[#6967FB]",
              selectedOption === option.id && status === "correct" && "border-brilliant-green text-brilliant-green",
              selectedOption === option.id && status === "wrong" && "border-red-400 text-red-600",
            )}>
              {i + 1}
            </span>
            <span className="font-arabic text-xl sm:text-2xl text-brilliant-text" dir="rtl">
              {option.arabicText || option.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
