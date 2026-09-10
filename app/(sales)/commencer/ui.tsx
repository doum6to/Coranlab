"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */

const ARABIC_RUN = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u064B-\u065F\s]*)/g;
const HAS_ARABIC = /[\u0600-\u06FF\uFB50-\uFEFF]/;

/** Arabic runs → Jomhuria (.da-ar). Keeps surrounding Latin text untouched. */
function withArabic(text: string, keyBase: string): ReactNode[] {
  return text.split(ARABIC_RUN).filter(Boolean).map((part, i) =>
    HAS_ARABIC.test(part)
      ? <span key={`${keyBase}-ar-${i}`} className="da-ar" lang="ar" style={{ fontSize: "1.45em", lineHeight: 0.8 }}>{part}</span>
      : part,
  );
}

/** Line breaks (`\n`) → <br/>. */
function withBreaks(text: string, keyBase: string): ReactNode[] {
  const lines = text.split("\n");
  return lines.flatMap((line, i) => {
    const nodes = withArabic(line, `${keyBase}-l${i}`);
    return i < lines.length - 1 ? [...nodes, <br key={`${keyBase}-br${i}`} />] : nodes;
  });
}

/**
 * Editorial text renderer: `**mot**` → pink block, `__mot__` → espresso block,
 * Arabic runs → Jomhuria, `\n` → line break.
 */
/** French typography: a narrow no-break space before ? ! : ; » so the mark
 *  never gets orphaned on its own line on narrow screens. */
function nbsp(text: string): string {
  return text.replace(/ ?([?!:;»])/g, "\u202F$1").replace(/(«) ?/g, "$1\u202F");
}

export function rich(text: string): ReactNode[] {
  text = nbsp(text);
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean).map((tok, i) => {
    if (tok.startsWith("**")) return <span key={i} className="da-hl da-hl-pink">{withBreaks(tok.slice(2, -2), `p${i}`)}</span>;
    if (tok.startsWith("__")) return <span key={i} className="da-hl da-hl-espresso">{withBreaks(tok.slice(2, -2), `e${i}`)}</span>;
    return <span key={i}>{withBreaks(tok, `t${i}`)}</span>;
  });
}

/** Replaces `{key}` placeholders in a content template. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/* ------------------------------------------------------------------ */
/* Date helpers (only call from effects / handlers — never during SSR) */

export function addDays(d: Date, days: number): Date {
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + days);
  return out;
}

/** "19 nov." */
export function fmtShort(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(d);
}

/** "17 sept. 2026" */
export function fmtLong(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

/** `null` during SSR + first client render, then the client's "now". Hydration-safe. */
export function useToday(): Date | null {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
  }, []);
  return today;
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ */
/* Shell: scrollable content · sticky CTA with paper fade               */

export function Shell({
  children,
  footer,
  center,
  align = "left",
}: {
  children: ReactNode;
  footer?: ReactNode;
  /** Vertically centers the content when it is shorter than the viewport. */
  center?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-8 pt-3" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className={`flex w-full flex-col ${center ? "my-auto" : ""} ${align === "center" ? "items-center text-center" : ""}`}>{children}</div>
      </div>
      {footer && (
        <div className="relative shrink-0 px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-2">
          <div className="pointer-events-none absolute inset-x-0 -top-10 h-10" style={{ background: "linear-gradient(to bottom, rgba(239,233,222,0), var(--paper))" }} aria-hidden />
          <div className="relative flex flex-col gap-3">{footer}</div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  busy,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  busy?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className="da-btn da-btn-espresso w-full text-[16px] transition-opacity duration-300"
      style={{ minHeight: 54, opacity: disabled ? 0.45 : 1 }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Option card (question screens)                                      */

export const cascade = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } },
  item: {
    hidden: { opacity: 0, scale: 0.88, y: 6 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 420, damping: 28 } },
  },
} as const;

export function OptionCard({
  label,
  icon,
  selected,
  onClick,
  center,
  multi,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
  /** Centered text (no icon column). */
  center?: boolean;
  multi?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      variants={reduce ? undefined : cascade.item}
      whileTap={reduce ? undefined : { scale: 0.975 }}
      onClick={onClick}
      aria-pressed={selected}
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      className={`flex w-full items-center gap-3.5 px-4 text-left ${center ? "justify-center" : ""}`}
      style={{
        minHeight: 68,
        borderRadius: 18,
        border: `1px solid ${selected ? "var(--espresso)" : "var(--line)"}`,
        background: selected ? "var(--espresso)" : "#FBF8F2",
        color: selected ? "var(--paper)" : "var(--ink)",
        transition: "background-color .15s, color .15s, border-color .15s",
        boxShadow: selected ? "0 10px 24px -16px rgba(58,40,31,.6)" : "0 1px 0 rgba(58,40,31,.03)",
      }}
    >
      {icon && (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[19px]"
          style={{ background: selected ? "var(--paper)" : "rgba(243,182,196,.45)", color: selected ? "var(--espresso)" : "var(--espresso)", transition: "background-color .15s" }}
          aria-hidden
        >
          {HAS_ARABIC.test(icon) ? <span className="da-ar text-[28px]">{icon}</span> : icon}
        </span>
      )}
      <span className={`flex-1 py-3 text-[16px] font-medium leading-snug ${center ? "text-center" : ""}`}>{label}</span>
      {multi && (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px]"
          style={{ border: `1.5px solid ${selected ? "var(--paper)" : "var(--line)"}`, background: selected ? "var(--paper)" : "transparent", color: "var(--espresso)", transition: "background-color .15s" }}
          aria-hidden
        >
          {selected ? "✓" : ""}
        </span>
      )}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Small shared atoms                                                  */

export function Star({ size = 14, color = "var(--pink-deep)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2.5l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.5l-6 3.3 1.3-6.7-5-4.6 6.8-.8z" />
    </svg>
  );
}

export function Stars({ size = 14, color }: { size?: number; color?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label="5 étoiles">
      {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={size} color={color} />)}
    </span>
  );
}

export function Check({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Headline block used by most screens. */
export function Heading({ children, sub, size = "md", align = "left" }: { children: ReactNode; sub?: string; size?: "md" | "lg"; align?: "left" | "center" }) {
  return (
    <div className={`shrink-0 ${align === "center" ? "text-center" : ""}`}>
      <h1 className={`da-h ${size === "lg" ? "text-[34px] sm:text-[38px]" : "text-[28px] sm:text-[31px]"}`}>{children}</h1>
      {sub && <p className="mt-2.5 text-[15px] leading-snug" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>
  );
}
