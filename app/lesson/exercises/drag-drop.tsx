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

export const DragDrop = ({
  challenge,
  options,
  onSelect,
  selectedOption,
  status,
  disabled,
}: Props) => {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Arabic word in center */}
      <div
        className="flex items-center justify-center p-5 sm:p-6 bg-white rounded-2xl border-2 border-[#E0E0E0] w-full max-w-[280px]"
        style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
      >
        <span className="font-arabic text-3xl sm:text-4xl text-brilliant-text" dir="rtl">
          {challenge.arabicWord}
        </span>
      </div>

      <p className="text-sm text-brilliant-muted">Choisissez la bonne traduction</p>

      {/* Translation boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-md">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={cn(
              "h-14 sm:h-16 px-4 rounded-2xl border-2 font-semibold text-sm transition flex items-center justify-center",
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
            {option.frenchText || option.text}
          </button>
        ))}
      </div>
    </div>
  );
};
