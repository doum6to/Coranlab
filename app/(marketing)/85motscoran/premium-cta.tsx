"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  /** `dark` = black pill on light bg, `light` = white pill on dark bg */
  variant?: "dark" | "light";
  loading?: boolean;
  disabled?: boolean;
  arrow?: boolean;
};

type LinkProps = CommonProps & {
  as: "link";
  href: string;
  onClick?: () => void;
};

type ButtonProps = CommonProps & {
  as: "button";
  onClick?: () => void;
  type?: "button" | "submit";
};

type Props = LinkProps | ButtonProps;

/**
 * Premium CTA button — minimal pill shape with a subtle diagonal sheen
 * sweeping across at a slow rhythm. Uses the same `shinySweep` keyframes
 * as the rest of the app, but with more refined SVG gradients sized for
 * an editorial look (no 3D push-down).
 */
export function PremiumCta(props: Props) {
  const { children, className, variant = "dark", loading, disabled, arrow = true } = props;
  const uid = useId();

  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-transform will-change-transform";

  const variantClasses =
    variant === "dark"
      ? "bg-neutral-950 text-white hover:scale-[1.02] active:scale-[0.99]"
      : "bg-white text-neutral-950 hover:scale-[1.02] active:scale-[0.99]";

  const inner = (
    <>
      {/* Pulsing outer glow (ambient attention) */}
      <span
        aria-hidden
        className={cn(
          "absolute -inset-px rounded-full blur-md opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          variant === "dark" ? "bg-[#6967fb]" : "bg-white"
        )}
      />

      {/* Sheen sweep (loops every ~4s) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full overflow-hidden"
      >
        <span className="absolute inset-0 animate-premium-sheen">
          <svg
            viewBox="0 0 200 50"
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id={`${uid}-sheen`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor={variant === "dark" ? "#ffffff" : "#000000"}
                  stopOpacity="0"
                />
                <stop
                  offset="45%"
                  stopColor={variant === "dark" ? "#ffffff" : "#000000"}
                  stopOpacity={variant === "dark" ? "0.18" : "0.08"}
                />
                <stop
                  offset="55%"
                  stopColor={variant === "dark" ? "#ffffff" : "#000000"}
                  stopOpacity={variant === "dark" ? "0.18" : "0.08"}
                />
                <stop
                  offset="100%"
                  stopColor={variant === "dark" ? "#ffffff" : "#000000"}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <rect
              x="-40"
              y="-10"
              width="80"
              height="70"
              fill={`url(#${uid}-sheen)`}
              transform="skewX(-20)"
            />
          </svg>
        </span>
      </span>

      {/* Label + icon */}
      <span className="relative z-[2] flex items-center gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
        {arrow && !loading && (
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>

      {/* Local keyframes — slow, wider sheen than the app's tight version */}
      <style>{`
        @keyframes premium-sheen-kf {
          0%   { transform: translateX(-50%); }
          60%, 100% { transform: translateX(180%); }
        }
        .animate-premium-sheen {
          animation: premium-sheen-kf 4.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-premium-sheen { animation: none; }
        }
      `}</style>
    </>
  );

  if (props.as === "link") {
    return (
      <Link
        href={props.href}
        onClick={props.onClick}
        className={cn(base, variantClasses, className)}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={props.type || "button"}
      onClick={props.onClick}
      disabled={disabled || loading}
      className={cn(
        base,
        variantClasses,
        (disabled || loading) && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {inner}
    </button>
  );
}
