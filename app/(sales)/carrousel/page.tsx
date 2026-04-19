"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ArrowDown, Check, Download, Heart } from "lucide-react";

/* ═════════════════════════════════════════════════════════════════════
 *  /carrousel
 *
 *  5-slide Instagram carousel (1080×1350) designed in an editorial
 *  "journal" style. Each slide is self-contained and brandable so the
 *  series feels like a mini-magazine rather than disconnected cards.
 *
 *  Design DNA (synthesised from the user's inspiration images +
 *  Brilliant-style brand guidelines the Quranlab app already follows):
 *
 *    • Palette: cream (#F5F1E8), ink (#1A1A1A), brand violet (#6967fb),
 *      warm coral (#E85D3C) reserved for hand-drawn annotations.
 *    • Typography: Fraunces italic for emotional headlines, Inter for
 *      metadata, IBM Plex Arabic for the calligraphy.
 *    • Every slide carries the same branded header and footer so the
 *      carousel reads as one object.
 *    • Hand-drawn SVG annotations (circles, arrows, underlines, sticker
 *      labels) in coral — the "human" layer over an editorial base.
 *    • Subtle vertical ruled lines + grain on cream slides; glow + grain
 *      on ink slides. Alternating rhythm cream/ink/cream/ink/cream.
 * ═════════════════════════════════════════════════════════════════════ */

const SLIDE_W = 1080;
const SLIDE_H = 1350;
const PREVIEW_SCALE = 0.34;

const COLOR = {
  cream: "#F5F1E8",
  ink: "#1A1A1A",
  violet: "#6967fb",
  coral: "#E85D3C",
};

export default function CarrouselPage() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingIdx, setExportingIdx] = useState<number | null>(null);

  async function exportSlide(idx: number, filename: string) {
    const node = refs.current[idx];
    if (!node) return;
    setExportingIdx(idx);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } finally {
      setExportingIdx(null);
    }
  }

  async function exportAll() {
    setExportingAll(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        await exportSlide(i, slides[i].filename);
        await new Promise((r) => setTimeout(r, 400));
      }
    } finally {
      setExportingAll(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-6">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              Quranlab — Instagram carousel
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-neutral-950">
              5 slides · 1080×1350
            </h1>
          </div>
          <button
            type="button"
            onClick={exportAll}
            disabled={exportingAll}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:scale-[1.02] active:scale-[0.99] transition disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {exportingAll ? "Export..." : "Tout exporter"}
          </button>
        </header>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((s, i) => (
            <div key={s.id} className="flex flex-col items-start gap-3">
              <div
                className="shadow-xl shadow-neutral-900/10 rounded-sm overflow-hidden bg-white"
                style={{
                  width: SLIDE_W * PREVIEW_SCALE,
                  height: SLIDE_H * PREVIEW_SCALE,
                }}
              >
                <div
                  style={{
                    transform: `scale(${PREVIEW_SCALE})`,
                    transformOrigin: "top left",
                    width: SLIDE_W,
                    height: SLIDE_H,
                  }}
                >
                  <div
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    style={{ width: SLIDE_W, height: SLIDE_H }}
                  >
                    <s.Component pageNum={s.id} totalPages={slides.length} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500">
                    Slide {i + 1}
                  </p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {s.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => exportSlide(i, s.filename)}
                  disabled={exportingIdx === i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-900 hover:text-white transition disabled:opacity-60"
                >
                  <Download className="h-3.5 w-3.5" />
                  {exportingIdx === i ? "..." : "PNG"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  SHARED BRAND ELEMENTS
 * ───────────────────────────────────────────────────────────────────── */

// Subtle film-grain noise overlay
function Grain({ opacity = 0.08 }: { opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <filter id={`grain-${Math.random().toString(36).slice(2, 7)}`}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-abc)" />
      <filter id="grain-abc">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </svg>
  );
}

// Subtle vertical ruled lines like notebook paper — on cream slides
function RuledPaper({ stroke = "#1A1A1A", opacity = 0.04 }) {
  const lines = [];
  for (let i = 1; i < 8; i++) {
    lines.push(
      <line
        key={i}
        x1={SLIDE_W * (i / 8)}
        y1={0}
        x2={SLIDE_W * (i / 8)}
        y2={SLIDE_H}
        stroke={stroke}
        strokeWidth={1}
        strokeOpacity={opacity}
      />
    );
  }
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      width={SLIDE_W}
      height={SLIDE_H}
      viewBox={`0 0 ${SLIDE_W} ${SLIDE_H}`}
    >
      {lines}
    </svg>
  );
}

type HeaderProps = { theme: "cream" | "ink"; pageNum: number; totalPages: number };

function BrandHeader({ theme }: HeaderProps) {
  const fg = theme === "cream" ? COLOR.ink : COLOR.cream;
  return (
    <div
      className="absolute top-[60px] left-[60px] right-[60px] flex items-center justify-between"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center text-[22px] font-bold"
          style={{
            background: COLOR.violet,
            color: COLOR.cream,
            fontFamily: "var(--font-serif)",
          }}
        >
          Q
        </div>
        <div className="leading-tight">
          <div
            className="text-[20px] font-bold tracking-wide"
            style={{ color: fg }}
          >
            QURANLAB
          </div>
          <div
            className="text-[14px] tracking-[0.2em] uppercase"
            style={{ color: fg, opacity: 0.5 }}
          >
            Comprends le Coran
          </div>
        </div>
      </div>

      {/* Arabic geometric star ornament */}
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
        <path
          d="M21 2L26 16L40 16L29 25L33 39L21 31L9 39L13 25L2 16L16 16L21 2Z"
          stroke={fg}
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

function BrandFooter({ theme, pageNum, totalPages }: HeaderProps) {
  const fg = theme === "cream" ? COLOR.ink : COLOR.cream;
  const page = String(pageNum).padStart(2, "0");
  const total = String(totalPages).padStart(2, "0");
  return (
    <div
      className="absolute bottom-[60px] left-[60px] right-[60px] flex items-end justify-between"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <div>
        <div
          className="text-[14px] tracking-[0.2em] uppercase"
          style={{ color: fg, opacity: 0.5 }}
        >
          Made by
        </div>
        <div
          className="text-[22px] font-bold"
          style={{ color: fg }}
        >
          @quranlab.app
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span
          className="text-[18px] tracking-[0.15em] font-mono"
          style={{ color: fg, opacity: 0.6 }}
        >
          {page} / {total}
        </span>
        {pageNum < totalPages && (
          <div
            className="flex items-center gap-2 rounded-full px-5 py-2.5"
            style={{
              background: COLOR.coral,
              color: COLOR.cream,
              fontFamily: "var(--font-inter)",
            }}
          >
            <span className="text-[16px] font-bold tracking-wide uppercase">
              Swipe
            </span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M3 9H15M15 9L9 3M15 9L9 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  HAND-DRAWN ANNOTATIONS (SVG)
 *  Organic wobbly paths to give the "made with a marker" feel.
 * ───────────────────────────────────────────────────────────────────── */

// Imperfect circle around an element — coral ink marker feel
function HandCircle({
  className,
  stroke = COLOR.coral,
  strokeWidth = 8,
}: {
  className?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className || ""}`}
      viewBox="0 0 300 150"
      preserveAspectRatio="none"
    >
      <path
        // Starts mid-left, wobbles around, overshoots the closure like a marker would
        d="M 28,82 Q 10,40 80,18 Q 170,4 260,22 Q 295,35 285,82 Q 278,122 200,138 Q 120,148 40,128 Q 12,112 26,72"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Wavy underline — marker under a word
function HandUnderline({
  className,
  stroke = COLOR.coral,
  strokeWidth = 7,
}: {
  className?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className || ""}`}
      viewBox="0 0 400 30"
      preserveAspectRatio="none"
    >
      <path
        d="M 8,22 Q 100,8 200,18 T 392,14"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Curly arrow with arrowhead — points from anchor to target
function HandArrow({
  className,
  direction = "down-right",
  stroke = COLOR.coral,
  strokeWidth = 5,
}: {
  className?: string;
  direction?: "down-right" | "down-left" | "right";
  stroke?: string;
  strokeWidth?: number;
}) {
  const paths = {
    "down-right": {
      curve: "M 40,20 Q 30,80 90,100 Q 150,120 200,160",
      head: "M 190,150 L 200,160 L 188,168",
    },
    "down-left": {
      curve: "M 200,20 Q 210,80 140,110 Q 80,130 40,170",
      head: "M 50,160 L 40,170 L 52,178",
    },
    right: {
      curve: "M 20,100 Q 100,60 180,120 Q 220,140 260,100",
      head: "M 252,95 L 260,100 L 252,108",
    },
  };
  const p = paths[direction];
  return (
    <svg
      className={`absolute pointer-events-none ${className || ""}`}
      viewBox="0 0 280 200"
      fill="none"
    >
      <path
        d={p.curve}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={p.head}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Sticker label — rotated pill with drop shadow
function Sticker({
  children,
  rotate = -4,
  bg = COLOR.coral,
  color = COLOR.cream,
  className,
  fontSize = 26,
}: {
  children: React.ReactNode;
  rotate?: number;
  bg?: string;
  color?: string;
  className?: string;
  fontSize?: number;
}) {
  return (
    <span
      className={`inline-block px-5 py-2 rounded-[8px] font-bold tracking-wide uppercase ${className || ""}`}
      style={{
        background: bg,
        color,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 6px 0 0 rgba(0,0,0,0.15)",
        fontFamily: "var(--font-inter)",
        fontSize,
      }}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  SLIDES
 * ───────────────────────────────────────────────────────────────────── */

type SlideProps = { pageNum: number; totalPages: number };

// ── SLIDE 1 — HOOK (scroll stopper) ──────────────────────────────────
function Slide1({ pageNum, totalPages }: SlideProps) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: COLOR.cream, fontFamily: "var(--font-serif)" }}
    >
      <RuledPaper />
      <Grain opacity={0.09} />
      <BrandHeader theme="cream" pageNum={pageNum} totalPages={totalPages} />

      {/* Massive Arabic calligraphy floating behind, bottom-left */}
      <div
        dir="rtl"
        className="absolute -left-12 top-[440px] font-arabic font-bold whitespace-nowrap select-none"
        style={{
          fontFamily: "var(--font-arabic)",
          fontSize: 360,
          lineHeight: 1,
          color: COLOR.ink,
          opacity: 0.06,
        }}
      >
        اقْرَأْ
      </div>

      {/* Headline block */}
      <div className="absolute top-[260px] left-[70px] right-[70px]">
        <p
          className="text-[120px] leading-[1] text-[#1A1A1A]"
          style={{ fontStyle: "italic" }}
        >
          Tu récites
        </p>

        {/* Arabic word with hand-drawn circle around it */}
        <div className="relative inline-block mt-6">
          <div
            dir="rtl"
            className="font-arabic font-bold"
            style={{
              fontFamily: "var(--font-arabic)",
              fontSize: 200,
              lineHeight: 1,
              color: COLOR.ink,
              padding: "30px 60px",
            }}
          >
            الْحَمْدُ لِلَّهِ
          </div>
          <HandCircle stroke={COLOR.coral} strokeWidth={10} />
        </div>

        <p
          className="mt-10 text-[108px] leading-[1] font-semibold"
          style={{ color: COLOR.ink }}
        >
          chaque jour.
        </p>
      </div>

      {/* Hand-drawn arrow + question */}
      <HandArrow
        className="left-[380px] top-[940px] w-[220px] h-[160px]"
        direction="down-right"
      />
      <div
        className="absolute top-[1080px] left-[620px]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <p
          className="text-[44px] font-bold leading-[1.1]"
          style={{ color: COLOR.ink }}
        >
          Tu sais ce que
          <br />
          ça veut dire ?
        </p>
      </div>

      <BrandFooter theme="cream" pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

// ── SLIDE 2 — REVEAL ──────────────────────────────────────────────────
function Slide2({ pageNum, totalPages }: SlideProps) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: COLOR.ink, fontFamily: "var(--font-serif)" }}
    >
      <Grain opacity={0.12} />

      {/* Violet glow */}
      <div
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          width: 700,
          height: 700,
          background: "rgba(105, 103, 251, 0.22)",
        }}
      />

      <BrandHeader theme="ink" pageNum={pageNum} totalPages={totalPages} />

      {/* Kicker */}
      <div className="absolute top-[200px] left-0 right-0 flex items-center justify-center gap-5">
        <span
          className="h-px w-14"
          style={{ background: COLOR.cream, opacity: 0.3 }}
        />
        <span
          className="text-[18px] tracking-[0.35em] uppercase font-semibold"
          style={{
            fontFamily: "var(--font-inter)",
            color: COLOR.cream,
            opacity: 0.7,
          }}
        >
          Traduction
        </span>
        <span
          className="h-px w-14"
          style={{ background: COLOR.cream, opacity: 0.3 }}
        />
      </div>

      {/* Arabic verse with hand-drawn underline */}
      <div className="absolute top-[280px] left-0 right-0 text-center">
        <div className="relative inline-block px-10">
          <div
            dir="rtl"
            className="font-arabic font-bold leading-[1.1]"
            style={{
              fontFamily: "var(--font-arabic)",
              fontSize: 170,
              color: COLOR.cream,
            }}
          >
            الْحَمْدُ لِلَّهِ
          </div>
          <HandUnderline
            className="-bottom-8 left-4 right-4 h-[40px] top-auto"
            stroke={COLOR.coral}
            strokeWidth={10}
          />
        </div>
      </div>

      {/* Big = */}
      <div
        className="absolute top-[610px] left-0 right-0 text-center text-[80px]"
        style={{ color: COLOR.cream, opacity: 0.4 }}
      >
        =
      </div>

      {/* Translation */}
      <div className="absolute top-[740px] left-[70px] right-[70px] text-center">
        <p
          className="text-[92px] leading-[1.05]"
          style={{ fontStyle: "italic", color: COLOR.cream }}
        >
          Toute louange
        </p>
        <p
          className="mt-3 text-[92px] leading-[1.05] font-semibold"
          style={{ color: COLOR.cream }}
        >
          appartient à Allah.
        </p>
      </div>

      {/* Sticker — frequency */}
      <div className="absolute top-[1080px] left-1/2 -translate-x-1/2">
        <Sticker bg={COLOR.coral} rotate={-5} fontSize={30}>
          + 1 800× / an sans le savoir
        </Sticker>
      </div>

      <BrandFooter theme="ink" pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

// ── SLIDE 3 — THREE BEAUTIFUL WORDS ───────────────────────────────────
function Slide3({ pageNum, totalPages }: SlideProps) {
  const words: { ar: string; fr: string; count: string; emphasise?: boolean }[] =
    [
      { ar: "رَحْمَة", fr: "Miséricorde", count: "339×", emphasise: true },
      { ar: "نُور", fr: "Lumière", count: "194×" },
      { ar: "قَلْب", fr: "Cœur", count: "132×" },
    ];
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: COLOR.cream, fontFamily: "var(--font-serif)" }}
    >
      <RuledPaper />
      <Grain opacity={0.09} />
      <BrandHeader theme="cream" pageNum={pageNum} totalPages={totalPages} />

      {/* Top title */}
      <div className="absolute top-[220px] left-[70px] right-[70px]">
        <p
          className="text-[22px] tracking-[0.3em] uppercase font-semibold"
          style={{
            fontFamily: "var(--font-inter)",
            color: COLOR.ink,
            opacity: 0.5,
          }}
        >
          Trois mots qui reviennent
        </p>
        <p
          className="mt-3 text-[96px] leading-[1] italic"
          style={{ color: COLOR.ink }}
        >
          des centaines
        </p>
        <p
          className="mt-1 text-[96px] leading-[1]"
          style={{ color: COLOR.ink, fontWeight: 600 }}
        >
          de fois.
        </p>
      </div>

      {/* Words list */}
      <div className="absolute top-[620px] left-[70px] right-[70px] flex flex-col gap-[30px]">
        {words.map((w, i) => (
          <div
            key={i}
            className="flex items-center justify-between pb-[28px]"
            style={{ borderBottom: `1.5px solid ${COLOR.ink}20` }}
          >
            <div className="flex items-center gap-[36px]">
              <span
                className="text-[22px] font-mono"
                style={{
                  fontFamily: "var(--font-inter)",
                  color: COLOR.ink,
                  opacity: 0.35,
                }}
              >
                0{i + 1}
              </span>
              <span
                dir="rtl"
                className="font-arabic font-bold"
                style={{
                  fontFamily: "var(--font-arabic)",
                  fontSize: 110,
                  lineHeight: 1,
                  color: COLOR.ink,
                }}
              >
                {w.ar}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <div className="relative inline-block">
                <span
                  className="text-[46px] leading-none italic"
                  style={{ color: COLOR.ink }}
                >
                  {w.fr}
                </span>
                {w.emphasise && (
                  <HandUnderline
                    className="-bottom-4 left-0 right-0 h-[16px] top-auto"
                    stroke={COLOR.coral}
                    strokeWidth={6}
                  />
                )}
              </div>
              <span
                className="mt-3 text-[18px] tracking-[0.2em] uppercase font-semibold"
                style={{
                  fontFamily: "var(--font-inter)",
                  color: COLOR.ink,
                  opacity: 0.5,
                }}
              >
                {w.count}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sticker bottom-right */}
      <div className="absolute top-[1140px] right-[70px]">
        <Sticker bg={COLOR.ink} color={COLOR.cream} rotate={3}>
          + 84 000 occurrences
        </Sticker>
      </div>

      <BrandFooter theme="cream" pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

// ── SLIDE 4 — STAT PUNCH ─────────────────────────────────────────────
function Slide4({ pageNum, totalPages }: SlideProps) {
  const rows: { mots: string; pct: string; highlight?: boolean }[] = [
    { mots: "100 mots", pct: "50%" },
    { mots: "300 mots", pct: "70%" },
    { mots: "500 mots", pct: "85%", highlight: true },
  ];
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: COLOR.ink, fontFamily: "var(--font-serif)" }}
    >
      <Grain opacity={0.12} />

      {/* Bottom glow */}
      <div
        className="absolute bottom-[-200px] left-[-100px] right-[-100px] h-[700px] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232, 93, 60, 0.25) 0%, rgba(232, 93, 60, 0) 70%)",
        }}
      />

      <BrandHeader theme="ink" pageNum={pageNum} totalPages={totalPages} />

      {/* Kicker */}
      <div className="absolute top-[210px] left-[70px] right-[70px]">
        <p
          className="text-[22px] tracking-[0.3em] uppercase font-semibold"
          style={{
            fontFamily: "var(--font-inter)",
            color: COLOR.cream,
            opacity: 0.5,
          }}
        >
          La règle des 500
        </p>
        <p
          className="mt-3 text-[88px] leading-[1]"
          style={{ color: COLOR.cream, fontStyle: "italic" }}
        >
          Moins de mots
        </p>
        <p
          className="mt-1 text-[88px] leading-[1] font-semibold"
          style={{ color: COLOR.cream }}
        >
          que tu ne crois.
        </p>
      </div>

      {/* Stats rows */}
      <div className="absolute top-[600px] left-[70px] right-[70px] flex flex-col gap-[20px]">
        {rows.map((r, i) => (
          <div
            key={i}
            className="relative flex items-baseline justify-between py-[24px]"
            style={{ borderBottom: `1.5px solid ${COLOR.cream}25` }}
          >
            <div className="flex items-baseline gap-[28px]">
              <span
                className="text-[20px] font-mono"
                style={{
                  fontFamily: "var(--font-inter)",
                  color: COLOR.cream,
                  opacity: 0.35,
                }}
              >
                0{i + 1}
              </span>
              <span
                className="text-[60px] italic"
                style={{ color: COLOR.cream }}
              >
                {r.mots}
              </span>
            </div>
            <div className="relative inline-block">
              <span
                className="text-[140px] leading-none font-semibold"
                style={{ color: r.highlight ? COLOR.coral : COLOR.cream }}
              >
                {r.pct}
              </span>
              {r.highlight && (
                <HandCircle
                  className="-top-4 -left-8 -right-8 -bottom-4 w-auto h-auto"
                  stroke={COLOR.coral}
                  strokeWidth={10}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom statement */}
      <div className="absolute top-[1080px] left-[70px] right-[70px]">
        <p
          className="text-[36px] leading-[1.2] font-semibold"
          style={{
            fontFamily: "var(--font-inter)",
            color: COLOR.cream,
          }}
        >
          Tu y es en <span style={{ color: COLOR.coral }}>2 mois</span>.
          <br />
          <span style={{ opacity: 0.7, fontWeight: 400 }}>
            À raison de 5 minutes par jour.
          </span>
        </p>
      </div>

      <BrandFooter theme="ink" pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

// ── SLIDE 5 — CTA + APP MOCKUP ───────────────────────────────────────
function Slide5({ pageNum, totalPages }: SlideProps) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: COLOR.cream, fontFamily: "var(--font-serif)" }}
    >
      <RuledPaper />
      <Grain opacity={0.09} />
      <BrandHeader theme="cream" pageNum={pageNum} totalPages={totalPages} />

      {/* Top kicker + title */}
      <div className="absolute top-[210px] left-[70px] right-[70px]">
        <p
          className="text-[22px] tracking-[0.3em] uppercase font-semibold"
          style={{
            fontFamily: "var(--font-inter)",
            color: COLOR.ink,
            opacity: 0.5,
          }}
        >
          L&apos;application
        </p>
        <p
          className="mt-3 text-[110px] leading-[1] italic"
          style={{ color: COLOR.ink }}
        >
          On commence ?
        </p>
      </div>

      {/* Phone mockup */}
      <div className="absolute top-[480px] left-1/2 -translate-x-1/2">
        <PhoneMockup />
      </div>

      {/* Sticker above the phone pointing down */}
      <div className="absolute top-[430px] right-[100px]">
        <Sticker bg={COLOR.coral} rotate={8} fontSize={22}>
          7 jours gratuits
        </Sticker>
      </div>
      <HandArrow
        className="top-[460px] right-[190px] w-[140px] h-[100px]"
        direction="down-left"
        strokeWidth={5}
      />

      {/* Bottom CTA */}
      <div className="absolute bottom-[200px] left-0 right-0 flex flex-col items-center gap-4">
        <div
          className="px-12 py-6 rounded-full flex items-center gap-4"
          style={{
            background: COLOR.ink,
            color: COLOR.cream,
            fontFamily: "var(--font-inter)",
            boxShadow: "0 8px 0 0 rgba(0,0,0,0.15)",
          }}
        >
          <span className="text-[34px] font-bold tracking-wide">
            Commencer mon essai
          </span>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 16H26M26 16L16 6M26 16L16 26"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p
          className="text-[22px] tracking-[0.15em] uppercase font-semibold"
          style={{
            fontFamily: "var(--font-inter)",
            color: COLOR.ink,
            opacity: 0.5,
          }}
        >
          quranlab.app / 85motscoran
        </p>
      </div>

      <BrandFooter theme="cream" pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  iPhone mockup for slide 5 — faithful to the actual lesson UI
 * ───────────────────────────────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div
      className="relative rounded-[68px] bg-neutral-950 p-[16px]"
      style={{
        width: 420,
        height: 600,
        boxShadow: "0 40px 80px -30px rgba(0,0,0,0.4)",
      }}
    >
      <div className="relative rounded-[54px] overflow-hidden bg-white h-full flex flex-col">
        {/* Dynamic Island */}
        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 h-[24px] w-[100px] rounded-full bg-neutral-950 z-20" />

        {/* Status bar */}
        <div
          className="relative z-10 flex items-center justify-between px-[28px] pt-[16px] pb-[4px] text-[12px] font-semibold text-neutral-900"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <span>9:41</span>
          <span className="inline-block h-[8px] w-[14px] rounded-[2px] border border-neutral-900" />
        </div>

        {/* App header */}
        <div className="flex items-center gap-[12px] px-[22px] pt-[18px] pb-[10px]">
          <div className="h-[14px] w-[14px] rounded-full bg-neutral-400" />
          <div className="flex-1 h-[8px] rounded-full bg-neutral-200 overflow-hidden">
            <div className="h-full bg-[#6967fb]" style={{ width: "55%" }} />
          </div>
          <div
            className="flex items-center gap-[3px] text-[13px] font-bold text-rose-500"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <Heart className="h-[14px] w-[14px] fill-rose-500" />
            <span>4</span>
          </div>
        </div>

        <div
          className="px-[22px] pt-[20px]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <p className="text-[13px] font-bold text-neutral-400 text-center mb-[18px] tracking-wide">
            SÉLECTIONNE LA BONNE TRADUCTION
          </p>
          <div
            className="bg-white rounded-[20px] border-2 border-neutral-200 p-[20px] text-center mb-[20px]"
            style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
          >
            <p
              className="font-arabic text-[52px] leading-none text-neutral-900"
              dir="rtl"
              style={{ fontFamily: "var(--font-arabic)" }}
            >
              رَحْمَة
            </p>
          </div>

          <div className="flex flex-col gap-[10px]">
            {[
              { n: 1, t: "Livre", state: "" },
              { n: 2, t: "Miséricorde", state: "correct" },
              { n: 3, t: "Lumière", state: "" },
            ].map((o) => (
              <div
                key={o.n}
                className={`flex items-center gap-[12px] rounded-[18px] border-2 px-[16px] py-[12px] ${
                  o.state === "correct"
                    ? "border-green-500 bg-green-50"
                    : "border-neutral-200 bg-white"
                }`}
                style={
                  o.state
                    ? undefined
                    : { boxShadow: "0 4px 0 0 #D4D4D4" }
                }
              >
                <span
                  className={`flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border-2 text-[14px] font-bold ${
                    o.state === "correct"
                      ? "border-green-500 text-green-600"
                      : "border-neutral-200 text-neutral-400"
                  }`}
                >
                  {o.state === "correct" ? <Check className="h-4 w-4" /> : o.n}
                </span>
                <span
                  className={`text-[15px] font-semibold ${
                    o.state === "correct"
                      ? "text-green-700"
                      : "text-neutral-900"
                  }`}
                >
                  {o.t}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const slides = [
  {
    id: 1,
    Component: Slide1,
    title: "Hook",
    filename: "quranlab-slide-1-hook.png",
  },
  {
    id: 2,
    Component: Slide2,
    title: "Reveal",
    filename: "quranlab-slide-2-reveal.png",
  },
  {
    id: 3,
    Component: Slide3,
    title: "3 mots",
    filename: "quranlab-slide-3-mots.png",
  },
  {
    id: 4,
    Component: Slide4,
    title: "Stats",
    filename: "quranlab-slide-4-stats.png",
  },
  {
    id: 5,
    Component: Slide5,
    title: "CTA + app",
    filename: "quranlab-slide-5-cta.png",
  },
];
