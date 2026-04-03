import Image from "next/image";
import { Target } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  variant: "points" | "score";
};

export const ResultCard = ({ value, variant }: Props) => {
  return (
    <div className={cn(
      "rounded-2xl border-2 w-full",
      variant === "points" && "bg-orange-400 border-orange-400",
      variant === "score" && "bg-[#6967FB] border-[#6967FB]",
    )}>
      <div className={cn(
        "p-1.5 text-white rounded-t-xl font-bold text-center uppercase text-xs",
        variant === "score" && "bg-[#6967FB]",
        variant === "points" && "bg-orange-400"
      )}>
        {variant === "score" ? "Score" : "XP Total"}
      </div>
      <div className={cn(
        "rounded-2xl bg-white items-center flex justify-center p-6 font-bold text-lg",
        variant === "score" && "text-[#6967FB]",
        variant === "points" && "text-orange-400"
      )}>
        {variant === "points" ? (
          <Image alt="Points" src="/points.svg" height={30} width={30} className="mr-1.5" />
        ) : (
          <Target className="h-7 w-7 mr-1.5 text-[#6967FB]" />
        )}
        {variant === "score" ? `${value}%` : value}
      </div>
    </div>
  );
};
