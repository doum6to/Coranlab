import { cn } from "@/lib/utils";
import { useId } from "react";

type ShinyButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "green" | "gray" | "outline-green" | "yellow" | "dark";
};

export const ShinyButton = ({
  children,
  className,
  disabled,
  onClick,
  type = "button",
  variant = "green",
}: ShinyButtonProps) => {
  const uid = useId();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full font-bold text-sm overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-100 will-change-transform",
        !disabled && "active:translate-y-[4px] active:!shadow-none",
        variant === "green" &&
          "bg-[#6967fb] text-white shadow-[0_4px_0_0_#4a48d4]",
        variant === "dark" &&
          "bg-[#1E1E1E] text-white shadow-[0_4px_0_0_#0A0A0A]",
        variant === "yellow" &&
          "bg-[#EAB308] text-white shadow-[0_4px_0_0_#CA8A04]",
        variant === "outline-green" &&
          "bg-[#f0f0ff] text-brilliant-green border-2 border-[#6967fb] shadow-[0_4px_0_0_#c8c7f0]",
        variant === "gray" &&
          "bg-[#D4D4D4] text-brilliant-muted shadow-[0_4px_0_0_#ABABAB] cursor-not-allowed",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {/* Text layer */}
      <div className="px-5 py-3">
        <span className="relative z-10">{children}</span>
      </div>

      {/* Animated shiny diagonal streaks — original Brilliant shape */}
      {variant !== "gray" && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none animate-shiny-sweep"
        >
          <svg
            viewBox="0 0 150 56"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`${uid}-g1`} x1="100.5" y1="-58.63" x2="100.5" y2="91.37" gradientUnits="userSpaceOnUse">
                <stop offset="0.27" stopColor="white" stopOpacity="0.35" />
                <stop offset="0.71" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`${uid}-g2`} x1="140.83" y1="-28.13" x2="140.83" y2="121.87" gradientUnits="userSpaceOnUse">
                <stop offset="0.08" stopColor="white" stopOpacity="0.3" />
                <stop offset="0.57" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <clipPath id={`${uid}-clip`}>
                <rect width="150" height="56" fill="white" />
              </clipPath>
            </defs>
            <g clipPath={`url(#${uid}-clip)`}>
              <rect
                opacity="0.4"
                x="75"
                y="-58.63"
                width="51"
                height="150"
                transform="rotate(30 75 -58.63)"
                fill={`url(#${uid}-g1)`}
              />
              <rect
                opacity="0.4"
                x="127.83"
                y="-28.13"
                width="26"
                height="150"
                transform="rotate(30 127.83 -28.13)"
                fill={`url(#${uid}-g2)`}
              />
            </g>
          </svg>
        </div>
      )}
    </button>
  );
};
