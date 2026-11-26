"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";
import {
  Baby, Bell, Book, BookOpen, Bookmark, Calendar, CalendarCheck, Check as CheckIcon, Clock, Coffee, CreditCard, Flag, Ghost,
  GraduationCap, Hand, HeartHandshake, Heart, Hourglass, Instagram, Landmark, Laptop, Layers, Mail, MessageCircle, Moon, MoonStar,
  MoreHorizontal, Music2, Plus, Puzzle, Repeat, Signal, SignalHigh, SignalLow, SignalMedium, SignalZero, Smile, Sparkles, Star as StarIcon,
  Sun, Sunrise, Sunset, Target, ThumbsDown, ThumbsUp, Timer, Unlock, ShieldCheck, Users, Wrench, Youtube, Zap, type LucideIcon,
} from "lucide-react";

import { ShinyButton } from "@/components/ui/shiny-button";
import type { IconKey } from "@/lib/commencer-shared";

/* ------------------------------------------------------------------ */
/* Palette — the Quranlab app DA (see tailwind `brilliant`)             */

export const P = {
  purple: "#6967FB",
  purpleDark: "#4A48D4",
  purpleSoft: "#F0F0FF",
  purpleLine: "#C8C7F0",
  text: "#1A1A1A",
  muted: "#999999",
  soft: "#555555",
  surface: "#F5F5F5",
  border: "#E8E8E8",
  success: "#22C55E",
  successSoft: "#E8F8E8",
  danger: "#EF4444",
} as const;

/** Quranic words: Amiri (served from /public/fonts) with the app Arabic font as fallback. */
export const AR_FONT = "'Amiri', var(--font-arabic), serif";
export const AMIRI_CSS = `@font-face{font-family:'Amiri';src:url('/fonts/amiri-arabic-400-normal.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Amiri';src:url('/fonts/amiri-arabic-700-normal.woff2') format('woff2');font-weight:700;font-display:swap}`;

/* ------------------------------------------------------------------ */
/* Icons — one monochrome SVG line family, never emoji                  */

const ICONS: Record<IconKey, LucideIcon> = {
  heart: Heart, "book-open": BookOpen, book: Book, bookmark: Bookmark, moon: Moon, "moon-star": MoonStar, sparkles: Sparkles, users: Users,
  baby: Baby, hands: HeartHandshake, hand: Hand, message: MessageCircle, more: MoreHorizontal, plus: Plus, clock: Clock, timer: Timer,
  hourglass: Hourglass, calendar: Calendar, "calendar-check": CalendarCheck, sun: Sun, sunrise: Sunrise, sunset: Sunset, coffee: Coffee,
  target: Target, wrench: Wrench, puzzle: Puzzle, layers: Layers, zap: Zap, repeat: Repeat, graduation: GraduationCap, landmark: Landmark,
  flag: Flag, smile: Smile, star: StarIcon, check: CheckIcon, "signal-0": SignalZero, "signal-1": SignalLow, "signal-2": SignalMedium,
  "signal-3": SignalHigh, "signal-4": Signal, "thumbs-up": ThumbsUp, "thumbs-down": ThumbsDown, mail: Mail, laptop: Laptop, unlock: Unlock,
  bell: Bell, "credit-card": CreditCard, instagram: Instagram, youtube: Youtube, music: Music2, ghost: Ghost, shield: ShieldCheck,
};

export function Icon({ name, size = 20, className, strokeWidth = 2, duo }: { name?: string; size?: number; className?: string; strokeWidth?: number; duo?: boolean }) {
  const C = name && name in ICONS ? ICONS[name as IconKey] : null;
  if (!C) return null;
  // Duotone: the same glyph, softly filled. Reads as an illustration rather than a UI glyph.
  return <C size={size} strokeWidth={strokeWidth} className={className} aria-hidden {...(duo ? { fill: "currentColor", fillOpacity: 0.14 } : {})} />;
}

/** Round icon badge used in option cards, plan rows and the timeline. */
export function IconBadge({ name, active, size = 44 }: { name?: string; active?: boolean; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full transition-colors duration-150"
      style={{ width: size, height: size, background: active ? P.purple : P.purpleSoft, color: active ? "#fff" : P.purple }}
      aria-hidden
    >
      <Icon name={name} size={Math.round(size * 0.48)} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */

const ARABIC_RUN = /([؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿][؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿ً-ٟ\s]*)/g;
export const HAS_ARABIC = /[؀-ۿﭐ-﻿]/;

function withArabic(text: string, keyBase: string): ReactNode[] {
  return text.split(ARABIC_RUN).filter(Boolean).map((part, i) =>
    HAS_ARABIC.test(part) ? <span key={`${keyBase}-ar-${i}`} lang="ar" dir="rtl" style={{ fontFamily: AR_FONT }}>{part}</span> : part,
  );
}

function withBreaks(text: string, keyBase: string): ReactNode[] {
  const lines = text.split("\n");
  return lines.flatMap((line, i) => {
    const nodes = withArabic(line, `${keyBase}-l${i}`);
    return i < lines.length - 1 ? [...nodes, <br key={`${keyBase}-br${i}`} />] : nodes;
  });
}

/** French typography: narrow no-break space before ? ! : ; » (and after «). */
function nbsp(text: string): string {
  return text.replace(/ ?([?!:;»%])/g, " $1").replace(/(«) ?/g, "$1 ").replace(/(\d) (€|h|min)\b/g, "$1 $2");
}

/** `**mot**` → purple emphasis · `__mot__` → soft purple chip · Arabic → Amiri · `\n` → <br/>. */
export function rich(text: string): ReactNode[] {
  text = nbsp(text);
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean).map((tok, i) => {
    if (tok.startsWith("**")) return <span key={i} style={{ color: P.purple }}>{withBreaks(tok.slice(2, -2), `p${i}`)}</span>;
    if (tok.startsWith("__")) return <span key={i} className="rounded-md px-1.5" style={{ background: P.purpleSoft, color: P.purple }}>{withBreaks(tok.slice(2, -2), `e${i}`)}</span>;
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
const INTL: Record<string, string> = { fr: "fr-FR", en: "en-GB", es: "es-ES" };
export const fmtShort = (d: Date, locale = "fr") => new Intl.DateTimeFormat(INTL[locale] ?? "fr-FR", { day: "numeric", month: "short" }).format(d);
export const fmtLong = (d: Date, locale = "fr") => new Intl.DateTimeFormat(INTL[locale] ?? "fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(d);

export { CM_UI, type CmLocale, type CmUi } from "@/lib/commencer-ui";

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
/* Rive (mascot & feedback animations) — client-only, mounted-gated      */

function RiveInner({ src, className }: { src: string; className?: string }) {
  const { RiveComponent } = useRive({ src, autoplay: true, layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }) });
  return <RiveComponent className={className ?? "h-full w-full"} aria-hidden />;
}
/** Plays a .riv file (default animation). Server HTML = empty box → no hydration mismatch. */
export function RiveAnim({ src, className, crop }: { src: string; className?: string; crop?: CropBox }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <div className={className ?? "h-full w-full"}>{mounted && (crop ? <Crop box={crop}><RiveInner src={src} /></Crop> : <RiveInner src={src} />)}</div>;
}

/**
 * The mascot files are drawn on a frame far larger than the character (Koji
 * fills about 40 % of it), so fitting the whole frame makes Koji look tiny.
 * `Crop` zooms into the part of the frame that matters: `k` is the zoom,
 * `cx`/`cy` the centre of the character in the frame (0–1).
 */
export type CropBox = { k: number; cx?: number; cy?: number };
export const KOJI_CROP: CropBox = { k: 1.8, cx: 0.5, cy: 0.52 };
export const PEDESTAL_CROP: CropBox = { k: 1.35, cx: 0.5, cy: 0.565 };
export const FLAME_CROP: CropBox = { k: 1.45, cx: 0.5, cy: 0.55 };

export function Crop({ box, children }: { box: CropBox; children: ReactNode }) {
  const { k, cx = 0.5, cy = 0.5 } = box;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute" style={{ width: `${k * 100}%`, height: `${k * 100}%`, left: `${(0.5 - cx * k) * 100}%`, top: `${(0.5 - cy * k) * 100}%` }}>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell: scrollable content · sticky footer with white fade            */

export function Shell({ children, footer, center, align = "left" }: { children: ReactNode; footer?: ReactNode; center?: boolean; align?: "left" | "center" }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-8 pt-3" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className={`flex w-full flex-col ${center ? "my-auto" : ""} ${align === "center" ? "items-center text-center" : ""}`}>{children}</div>
      </div>
      {footer && (
        <div className="relative shrink-0 px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-2">
          <div className="pointer-events-none absolute inset-x-0 -top-10 h-10" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0), #fff)" }} aria-hidden />
          <div className="relative flex flex-col gap-3">{footer}</div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons — the app's ShinyButton                                     */

export function PrimaryButton({ children, onClick, disabled, type = "button", busy }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; busy?: boolean }) {
  const off = disabled || busy;
  return (
    <ShinyButton type={type} onClick={onClick} disabled={off} variant={disabled ? "gray" : "green"} className="text-[16px]">
      <span className="block py-1">{children}</span>
    </ShinyButton>
  );
}

/* ------------------------------------------------------------------ */
/* Option card (question screens) — app style + shiny sweep on select   */

export const cascade = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } },
  item: { hidden: { opacity: 0, scale: 0.88, y: 6 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 420, damping: 28 } } },
} as const;

export function OptionCard({ label, icon, selected, onClick, center, multi }: { label: string; icon?: string; selected: boolean; onClick: () => void; center?: boolean; multi?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      variants={reduce ? undefined : cascade.item}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      onClick={onClick}
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      className={`relative flex w-full select-none items-center gap-3.5 px-4 text-left ${center ? "justify-center" : ""}`}
      style={{
        minHeight: 62, borderRadius: 16,
        background: selected ? "#F5F5FF" : "#fff",
        color: P.text,
        // Ring drawn with shadows so selecting never shifts the layout.
        boxShadow: selected ? `inset 0 0 0 2px ${P.purple}, 0 2px 0 0 ${P.purpleLine}` : `inset 0 0 0 1.5px ${P.border}, 0 2px 0 0 #F0F0F0`,
        transition: "background-color .16s ease-out, box-shadow .16s ease-out",
      }}
    >
      {icon && <span className="flex w-7 shrink-0 justify-center" style={{ color: selected ? P.purple : "#7A79E8" }}><Icon name={icon} size={24} strokeWidth={1.75} duo /></span>}
      <span className={`flex-1 py-3 text-[16px] leading-snug ${selected ? "font-semibold" : "font-medium"} ${center ? "text-center" : ""}`}>{label}</span>
      {multi && (
        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full" style={{ boxShadow: selected ? "none" : `inset 0 0 0 1.5px #D4D4D4`, background: selected ? P.purple : "#fff", color: "#fff", transition: "background-color .16s ease-out" }} aria-hidden>
          {selected && <CheckIcon size={13} strokeWidth={3.2} />}
        </span>
      )}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Koji speaks: the mascot with a speech bubble (question, then reply)   */

export function Bubble({ children, tail = "left", className }: { children: ReactNode; tail?: "left" | "bottom" | "none"; className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`} style={{ background: "#F7F7FF", borderRadius: 18, boxShadow: "inset 0 0 0 1.5px #DCDBFF" }}>
      {tail !== "none" && (
        <svg width="14" height="16" viewBox="0 0 14 16" className={`absolute ${tail === "left" ? "-left-[11px] top-1/2 -translate-y-1/2" : "-bottom-[11px] left-1/2 -translate-x-1/2 -rotate-90"}`} aria-hidden>
          <path d="M13 1.5 2.6 7.1a1 1 0 0 0 0 1.8L13 14.5" fill="#F7F7FF" stroke="#DCDBFF" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      )}
      <div className="relative px-4 py-3.5">{children}</div>
    </div>
  );
}

/** Mascot on the left, bubble on the right. `mascot` is the Rive element. */
export function KojiSays({ mascot, children, size = 76 }: { mascot: ReactNode; children: ReactNode; size?: number }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="shrink-0" style={{ width: size, height: size }}><Crop box={KOJI_CROP}>{mascot}</Crop></div>
      <Bubble className="min-w-0 flex-1">{children}</Bubble>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small shared atoms                                                  */

export function Star({ size = 14, color = "#F5C842" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2.5l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.5l-6 3.3 1.3-6.7-5-4.6 6.8-.8z" />
    </svg>
  );
}
export function Stars({ size = 14, color }: { size?: number; color?: string }) {
  return <span className="inline-flex items-center gap-0.5" aria-label="5 étoiles">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={size} color={color} />)}</span>;
}
export function Check({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return <CheckIcon size={size} color={color} strokeWidth={3} aria-hidden />;
}

/** Headline block used by most screens (app heading font). */
export function Heading({ children, sub, size = "md", align = "left" }: { children: ReactNode; sub?: string; size?: "md" | "lg"; align?: "left" | "center" }) {
  return (
    <div className={`shrink-0 ${align === "center" ? "text-center" : ""}`}>
      <h1 className={`font-heading font-bold leading-tight ${size === "lg" ? "text-[30px] sm:text-[34px]" : "text-[25px] sm:text-[28px]"}`} style={{ color: P.text, textWrap: "balance" as never }}>{children}</h1>
      {sub && <p className="mt-2 text-[15px] leading-snug" style={{ color: P.muted }}>{sub}</p>}
    </div>
  );
}
