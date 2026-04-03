import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  variant?: "default" | "purple";
  /** Show a "Réviser" button linking to leçons page */
  showReviser?: boolean;
};

export const UnitBanner = ({
  title,
  description,
  variant = "default",
  showReviser = false,
}: Props) => {
  const isPurple = variant === "purple";

  return (
    <div
      className={cn(
        "w-full rounded-2xl p-5 sm:p-6 flex items-center justify-between overflow-hidden relative",
        isPurple
          ? "bg-[#6967FB] text-white border-2 border-[#5755E0]"
          : "bg-white border-2 border-[#E0E0E0]"
      )}
      style={{
        boxShadow: isPurple ? "0 4px 0 0 #5250D4" : "0 4px 0 0 #D4D4D4",
      }}
    >
      {/* Shiny reflets for purple variant */}
      {isPurple && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-10 left-[20%] w-[60px] h-[150px] rotate-[30deg] opacity-[0.12]"
            style={{
              background: "linear-gradient(180deg, #F5EFFF 27%, rgba(255,255,255,0) 71%)",
            }}
          />
          <div
            className="absolute -top-10 left-[55%] w-[30px] h-[150px] rotate-[30deg] opacity-[0.12]"
            style={{
              background: "linear-gradient(180deg, #F5EFFF 8%, rgba(255,255,255,0) 57%)",
            }}
          />
        </div>
      )}

      <div className="min-w-0 flex-1 relative z-10">
        <h3 className={cn(
          "text-base sm:text-lg font-bold truncate",
          isPurple ? "text-white" : "text-brilliant-text"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-xs sm:text-sm line-clamp-1",
          isPurple ? "text-white/70" : "text-brilliant-muted"
        )}>
          {description}
        </p>
      </div>

      {/* Réviser button */}
      {showReviser && (
        <Link
          href="/lecons"
          className="relative z-10 shrink-0 ml-3 px-4 py-1.5 rounded-xl text-xs font-bold border-2 transition-all hover:opacity-90 bg-[#6967FB] text-white border-[#5755E0]"
          style={{ boxShadow: "0 2px 0 0 #5250D4" }}
        >
          Réviser
        </Link>
      )}
    </div>
  );
};
