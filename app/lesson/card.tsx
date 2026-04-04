import Image from "next/image";
import { useCallback } from "react";
import { useAudio, useKey } from "react-use";

import { cn } from "@/lib/utils";
import { challenges } from "@/db/schema";

type Props = {
  id: number;
  imageSrc: string | null;
  audioSrc: string | null;
  text: string;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  status?: "correct" | "wrong" | "none",
  type: typeof challenges.$inferSelect["type"];
};

export const Card = ({
  id,
  imageSrc,
  audioSrc,
  text,
  shortcut,
  selected,
  onClick,
  status,
  disabled,
  type,
}: Props) => {
  const [audio, _, controls] = useAudio({ src: audioSrc || "" });

  const handleClick = useCallback(() => {
    if (disabled) return;

    controls.play();
    onClick();
  }, [disabled, onClick, controls]);

  useKey(shortcut, handleClick, {}, [handleClick]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "h-full border-2 border-[#E0E0E0] rounded-2xl hover:bg-gray-50 p-4 lg:p-6 cursor-pointer transition-all active:scale-[0.97]",
        selected && "border-[#6967FB] bg-[#f0f0ff] hover:bg-[#f0f0ff]",
        selected && status === "correct"
          && "border-brilliant-green bg-brilliant-success hover:bg-brilliant-success",
        selected && status === "wrong"
          && "border-rose-400 bg-rose-50 hover:bg-rose-50",
        disabled && "pointer-events-none hover:bg-white",
        (type === "QCM" || type === "QCM_INVERSE" || type === "VRAI_FAUX") && "lg:p-3 w-full"
      )}
      style={{ boxShadow: selected ? "none" : "0 4px 0 0 #D4D4D4" }}
    >
      {audio}
      {imageSrc && (
        <div
          className="relative aspect-square mb-4 max-h-[80px] lg:max-h-[150px] w-full"
        >
          <Image src={imageSrc} fill alt={text} />
        </div>
      )}
      <div className={cn(
        "flex items-center justify-between",
        (type === "QCM" || type === "QCM_INVERSE" || type === "VRAI_FAUX") && "flex-row-reverse",
      )}>
        {(type === "QCM" || type === "QCM_INVERSE" || type === "VRAI_FAUX") && <div />}
        <p className={cn(
          "text-brilliant-text text-sm lg:text-base font-medium",
          selected && "text-[#6967FB]",
          selected && status === "correct"
            && "text-brilliant-green",
          selected && status === "wrong"
            && "text-rose-500",
        )}>
          {text}
        </p>
        <div className={cn(
          "lg:w-[30px] lg:h-[30px] w-[20px] h-[20px] border-2 border-[#E0E0E0] flex items-center justify-center rounded-lg text-brilliant-muted lg:text-[15px] text-xs font-semibold",
          selected && "border-[#6967FB] text-[#6967FB]",
          selected && status === "correct"
            && "border-brilliant-green text-brilliant-green",
          selected && status === "wrong"
            && "border-rose-500 text-rose-500",
        )}>
          {shortcut}
        </div>
      </div>
    </div>
  );
};
