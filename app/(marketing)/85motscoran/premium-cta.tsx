"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

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
 * Premium CTA button — minimal pill with hover lift and a subtle color
 * shift on hover. No continuous animation.
 */
export function PremiumCta(props: Props) {
  const { children, className, variant = "dark", loading, disabled, arrow = true } = props;

  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-transform duration-200 will-change-transform";

  const variantClasses =
    variant === "dark"
      ? "bg-neutral-950 text-white hover:scale-[1.02] active:scale-[0.99]"
      : "bg-white text-neutral-950 hover:scale-[1.02] active:scale-[0.99]";

  const inner = (
    <span className="relative z-[2] flex items-center gap-2">
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
      {arrow && !loading && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </span>
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
