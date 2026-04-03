import { cn } from "@/lib/utils";
import { useId } from "react";

type ShinyButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "green" | "gray" | "outline-green" | "yellow" | "dark";
};

export const ShinyButton = ({
  children,
  className,
  disabled,
  onClick,
  variant = "green",
}: ShinyButtonProps) => {
  const uid = useId();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full font-bold text-sm overflow-hidden transition-all rounded-2xl",
        variant === "green" && "text-white",
        variant === "yellow" && "text-white",
        variant === "dark" && "text-white",
        variant === "gray" && "bg-[#D4D4D4] text-brilliant-muted cursor-not-allowed",
        variant === "outline-green" && "text-brilliant-green",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      style={
        variant === "green"
          ? { background: "#6967fb", boxShadow: "0 4px 0 0 #4a48d4" }
          : variant === "dark"
            ? { background: "#1E1E1E", boxShadow: "0 4px 0 0 #0A0A0A" }
            : variant === "yellow"
              ? { background: "#EAB308", boxShadow: "0 4px 0 0 #CA8A04" }
              : variant === "outline-green"
              ? { background: "#f0f0ff", border: "2px solid #6967fb", boxShadow: "0 4px 0 0 #c8c7f0" }
              : variant === "gray"
                ? { boxShadow: "0 4px 0 0 #ABABAB" }
                : undefined
      }
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
