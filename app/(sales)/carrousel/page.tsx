"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, Download, Heart } from "lucide-react";

/* ═════════════════════════════════════════════════════════════════════
 *  /carrousel — 5 Instagram slides 1080×1350
 *
 *  Everything is positioned with absolute coordinates in pixels so
 *  spacing is predictable at export time. Content must stay between
 *  y=180 and y=1190 to avoid colliding with the branded header/footer.
 * ═════════════════════════════════════════════════════════════════════ */

const SLIDE_W = 1080;
const SLIDE_H = 1350;
const PREVIEW_SCALE = 0.34;

// Safe content zones (y coordinates)
const HEADER_BOTTOM = 170; // content starts at/after this
const FOOTER_TOP = 1190; // content ends at/before this

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

function Grain({ opacity = 0.08 }: { opacity?: number }) {
  // Use a unique filter id per instance so multiple Grain SVGs don't collide
  const id = "grain-" + Math.random().toString(36).slice(2, 8);
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    >
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

function RuledPaper({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      width={SLIDE_W}
      height={SLIDE_H}
      viewBox={`0 0 ${SLIDE_W} ${SLIDE_H}`}
    >
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line
          key={i}
          x1={SLIDE_W * (i / 8)}
          y1={0}
          x2={SLIDE_W * (i / 8)}
          y2={SLIDE_H}
          stroke={COLOR.ink}
          strokeWidth={1}
          strokeOpacity={opacity}
        />
      ))}
    </svg>
  );
}

type HeaderProps = {
  theme: "cream" | "ink";
  pageNum: number;
  totalPages: number;
};

function BrandHeader({ theme }: HeaderProps) {
  const fg = theme === "cream" ? COLOR.ink : COLOR.cream;
  return (
    <div
      className="absolute top-[60px] left-[60px] right-[60px] flex items-center justify-between"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center text-[24px] font-bold"
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
            className="text-[13px] tracking-[0.2em] uppercase"
            style={{ color: fg, opacity: 0.5 }}
          >
            Comprends le Coran
          </div>
        </div>
      </div>

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
          className="text-[13px] tracking-[0.2em] uppercase"
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
          style={{ color: fg, opacity: 0.55 }}
        >
          {page} / {total}
        </span>
        {pageNum < totalPages && (
          <div
            className="flex items-center gap-2 rounded-full px-5 py-2.5"
            style={{ background: COLOR.coral, color: COLOR.cream }}
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
 *  HAND-DRAWN ANNOTATIONS — position-explicit (left/top/width/height).
 *  Every mark takes absolute pixel coordinates inside the 1080×1350
 *  slide. `vector-effect="non-scaling-stroke"` keeps the marker weight
 *  visually constant regardless of stretch.
 * ───────────────────────────────────────────────────────────────────── */

type MarkPos = {
  left: number;
  top: number;
  width: number;
  height: number;
  stroke?: string;
  strokeWidth?: number;
};

function HandCircle({
  left,
  top,
  width,
  height,
  stroke = COLOR.coral,
  strokeWidth = 7,
}: MarkPos) {
  return (
    <svg
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        pointerEvents: "none",
        zIndex: 2,
      }}
      viewBox="0 0 300 150"
      preserveAspectRatio="none"
    >
      <path
        d="M 30,75 Q 15,30 100,18 Q 190,8 265,25 Q 292,40 282,80 Q 275,120 200,132 Q 125,142 45,125 Q 18,108 32,70"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function HandUnderline({
  left,
  top,
  width,
  height,
  stroke = COLOR.coral,
  strokeWidth = 6,
}: MarkPos) {
  return (
    <svg
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        pointerEvents: "none",
        zIndex: 2,
      }}
      viewBox="0 0 400 30"
      preserveAspectRatio="none"
    >
      <path
        d="M 10,22 Q 100,6 200,16 T 390,14"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

type ArrowDirection = "down-right" | "down-left" | "right";

function HandArrow({
  left,
  top,
  width,
  height,
  direction = "down-right",
  stroke = COLOR.coral,
  strokeWidth = 4,
}: MarkPos & { direction?: ArrowDirection }) {
  const paths: Record<ArrowDirection, { curve: string; head: string }> = {
    "down-right": {
      curve: "M 30,15 Q 20,80 90,105 Q 155,125 205,170",
      head: "M 195,158 L 207,172 L 190,175",
    },
    "down-left": {
      curve: "M 210,15 Q 220,80 150,105 Q 90,125 35,170",
      head: "M 47,158 L 35,172 L 52,175",
    },
    right: {
      curve: "M 18,90 Q 100,45 180,115 Q 215,135 255,100",
      head: "M 245,90 L 257,100 L 247,112",
    },
  };
  const p = paths[direction];
  return (
    <svg
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        pointerEvents: "none",
        zIndex: 2,
      }}
      viewBox="0 0 250 190"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={p.curve}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={p.head}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Sticker({
  children,
  left,
  top,
  rotate = -4,
  bg = COLOR.coral,
  color = COLOR.cream,
  fontSize = 26,
}: {
  children: React.ReactNode;
  left: number;
  top: number;
  rotate?: number;
  bg?: string;
  color?: string;
  fontSize?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "center center",
        zIndex: 3,
      }}
    >
      <span
        className="inline-block px-5 py-2 rounded-[8px] font-bold tracking-wide uppercase whitespace-nowrap"
        style={{
          background: bg,
          color,
          boxShadow: "0 6px 0 0 rgba(0,0,0,0.15)",
          fontFamily: "var(--font-inter)",
          fontSize,
          letterSpacing: "0.05em",
        }}
      >
        {children}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  SLIDES
 * ───────────────────────────────────────────────────────────────────── */

type SlideProps = { pageNum: number; totalPages: number };

// ── SLIDE 1 — HOOK ────────────────────────────────────────────────────
// Arabic is the visual hero, question below. Coral circle around Arabic,
// curly arrow pointing to the swipe footer.
function Slide1({ pageNum, totalPages }: SlideProps) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: COLOR.cream, fontFamily: "var(--font-serif)" }}
    >
      <RuledPaper />
      <Grain opacity={0.08} />
      <BrandHeader theme="cream" pageNum={pageNum} totalPages={totalPages} />

      {/* Kicker : small sans uppercase */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "var(--font-inter)",
          fontSize: 22,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: COLOR.ink,
          opacity: 0.5,
          fontWeight: 600,
        }}
      >
        × 5 fois par jour
      </div>

      {/* Arabic hero : y=310-540 */}
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 310,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "var(--font-arabic)",
          fontSize: 210,
          fontWeight: 700,
          color: COLOR.ink,
          lineHeight: 1.1,
        }}
      >
        الْحَمْدُ لِلَّهِ
      </div>

      {/* Coral circle around the Arabic text */}
      <HandCircle
        left={100}
        top={270}
        width={880}
        height={330}
        strokeWidth={7}
      />

      {/* Question : y=680-870 */}
      <div
        style={{
          position: "absolute",
          top: 680,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 82,
          fontStyle: "italic",
          color: COLOR.ink,
          lineHeight: 1,
        }}
      >
        Tu sais
      </div>
      <div
        style={{
          position: "absolute",
          top: 770,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 82,
          fontWeight: 700,
          color: COLOR.coral,
          lineHeight: 1,
        }}
      >
        ce que ça veut dire&nbsp;?
      </div>

      {/* Curly arrow pointing down-right */}
      <HandArrow
        left={620}
        top={920}
        width={180}
        height={140}
        direction="down-right"
        strokeWidth={4}
      />

      {/* Small reveal text */}
      <div
        style={{
          position: "absolute",
          top: 1070,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: "var(--font-inter)",
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: COLOR.ink,
          opacity: 0.55,
        }}
      >
        Réponse dans 4 slides
      </div>

      <BrandFooter theme="cream" pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

// ── SLIDE 2 — REVEAL ──────────────────────────────────────────────────
// Dark ground. Arabic repeated (visual callback to slide 1). Underline in
// coral. Translation below. Sticker with frequency punch at the bottom.
function Slide2({ pageNum, totalPages }: SlideProps) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: COLOR.ink, fontFamily: "var(--font-serif)" }}
    >
      <Grain opacity={0.12} />

      {/* Violet glow top */}
      <div
        style={{
          position: "absolute",
          top: -140,
          left: "50%",
          transform: "translateX(-50%)",
          width: 720,
          height: 720,
          borderRadius: "50%",
          background: "rgba(105, 103, 251, 0.25)",
          filter: "blur(100px)",
        }}
      />

      <BrandHeader theme="ink" pageNum={pageNum} totalPages={totalPages} />

      {/* Kicker with horizontal lines */}
      <div
        style={{
          position: "absolute",
          top: 210,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <span
          style={{
            width: 56,
            height: 1,
            background: COLOR.cream,
            opacity: 0.3,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 20,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: COLOR.cream,
            opacity: 0.7,
            fontWeight: 600,
          }}
        >
          Traduction
        </span>
        <span
          style={{
            width: 56,
            height: 1,
            background: COLOR.cream,
            opacity: 0.3,
          }}
        />
      </div>

      {/* Arabic (same as slide 1 for visual echo) — y=290-470 */}
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 290,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "var(--font-arabic)",
          fontSize: 180,
          fontWeight: 700,
          color: COLOR.cream,
          lineHeight: 1,
        }}
      >
        الْحَمْدُ لِلَّهِ
      </div>

      {/* Coral underline BELOW the Arabic — safely past its baseline */}
      <HandUnderline
        left={180}
        top={500}
        width={720}
        height={40}
        strokeWidth={9}
      />

      {/* Big equals sign */}
      <div
        style={{
          position: "absolute",
          top: 600,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 72,
          color: COLOR.cream,
          opacity: 0.4,
          lineHeight: 1,
        }}
      >
        =
      </div>

      {/* Translation */}
      <div
        style={{
          position: "absolute",
          top: 720,
          left: 60,
          right: 60,
          textAlign: "center",
          fontSize: 80,
          fontStyle: "italic",
          color: COLOR.cream,
          lineHeight: 1.05,
        }}
      >
        Toute louange
      </div>
      <div
        style={{
          position: "absolute",
          top: 820,
          left: 60,
          right: 60,
          textAlign: "center",
          fontSize: 80,
          fontWeight: 700,
          color: COLOR.cream,
          lineHeight: 1.05,
        }}
      >
        appartient à Allah.
      </div>

      {/* Sticker — frequency punch */}
      <Sticker left={260} top={1030} rotate={-4} fontSize={26}>
        + 1 800× par an · sans savoir
      </Sticker>

      <BrandFooter theme="ink" pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

// ── SLIDE 3 — THREE WORDS ─────────────────────────────────────────────
// Editorial list. Each row: number · Arabic · French italic · count.
// Coral underline under the emphasised French word.
function Slide3({ pageNum, totalPages }: SlideProps) {
  const words: {
    ar: string;
    fr: string;
    count: string;
    emphasise?: boolean;
  }[] = [
    { ar: "رَحْمَة", fr: "Miséricorde", count: "339×", emphasise: true },
    { ar: "نُور", fr: "Lumière", count: "194×" },
    { ar: "قَلْب", fr: "Cœur", count: "132×" },
  ];

  // Row layout: each row is 140px tall, first at y=540, gap 40 → 540, 720, 900
  const rowTops = [540, 720, 900];

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: COLOR.cream, fontFamily: "var(--font-serif)" }}
    >
      <RuledPaper />
      <Grain opacity={0.08} />
      <BrandHeader theme="cream" pageNum={pageNum} totalPages={totalPages} />

      {/* Kicker */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 70,
          right: 70,
          fontFamily: "var(--font-inter)",
          fontSize: 22,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: COLOR.ink,
          opacity: 0.5,
          fontWeight: 600,
        }}
      >
        Trois mots du Coran
      </div>

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: 270,
          left: 70,
          right: 70,
          fontSize: 88,
          fontStyle: "italic",
          color: COLOR.ink,
          lineHeight: 1,
        }}
      >
        Tu les connais
      </div>
      <div
        style={{
          position: "absolute",
          top: 370,
          left: 70,
          right: 70,
          fontSize: 88,
          fontWeight: 700,
          color: COLOR.ink,
          lineHeight: 1,
        }}
      >
        sans le savoir.
      </div>

      {/* Rows */}
      {words.map((w, i) => {
        const top = rowTops[i];
        return (
          <div key={i}>
            {/* Index number */}
            <div
              style={{
                position: "absolute",
                top: top + 30,
                left: 70,
                fontFamily: "var(--font-inter)",
                fontSize: 22,
                color: COLOR.ink,
                opacity: 0.35,
                fontWeight: 500,
              }}
            >
              0{i + 1}
            </div>

            {/* Arabic word left-center */}
            <div
              dir="rtl"
              style={{
                position: "absolute",
                top: top + 10,
                left: 140,
                fontFamily: "var(--font-arabic)",
                fontSize: 96,
                fontWeight: 700,
                color: COLOR.ink,
                lineHeight: 1,
              }}
            >
              {w.ar}
            </div>

            {/* French italic + count right-aligned */}
            <div
              style={{
                position: "absolute",
                top: top + 20,
                right: 70,
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontStyle: "italic",
                  color: COLOR.ink,
                  lineHeight: 1,
                }}
              >
                {w.fr}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 18,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: COLOR.ink,
                  opacity: 0.5,
                  marginTop: 14,
                  fontWeight: 600,
                }}
              >
                {w.count}
              </div>
            </div>

            {/* Hairline divider below the row */}
            <div
              style={{
                position: "absolute",
                top: top + 140,
                left: 70,
                right: 70,
                height: 1,
                background: COLOR.ink,
                opacity: 0.15,
              }}
            />

            {/* Underline under emphasised French word */}
            {w.emphasise && (
              <HandUnderline
                left={685}
                top={top + 68}
                width={325}
                height={18}
                strokeWidth={7}
              />
            )}
          </div>
        );
      })}

      {/* Bottom sticker — positioned clear of last row (y=1040, row ends y=1040) */}
      <Sticker left={550} top={1100} rotate={3} bg={COLOR.ink} fontSize={22}>
        + 84 000 occurrences
      </Sticker>

      <BrandFooter theme="cream" pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

// ── SLIDE 4 — STAT PUNCH ─────────────────────────────────────────────
// 100/300/500 → 50/70/85%. The last row (85%) is highlighted with a coral
// circle. Bottom two-line statement.
function Slide4({ pageNum, totalPages }: SlideProps) {
  const rows: { mots: string; pct: string; highlight?: boolean }[] = [
    { mots: "100 mots", pct: "50%" },
    { mots: "300 mots", pct: "70%" },
    { mots: "500 mots", pct: "85%", highlight: true },
  ];
  // Rows at y=520, 680, 840 — each 120px tall
  const rowTops = [520, 680, 840];

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: COLOR.ink, fontFamily: "var(--font-serif)" }}
    >
      <Grain opacity={0.12} />

      {/* Bottom coral glow */}
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: -100,
          right: -100,
          height: 700,
          background:
            "radial-gradient(ellipse at center, rgba(232,93,60,0.28) 0%, rgba(232,93,60,0) 70%)",
          filter: "blur(80px)",
        }}
      />

      <BrandHeader theme="ink" pageNum={pageNum} totalPages={totalPages} />

      {/* Kicker */}
      <div
        style={{
          position: "absolute",
          top: 210,
          left: 70,
          right: 70,
          fontFamily: "var(--font-inter)",
          fontSize: 22,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: COLOR.cream,
          opacity: 0.5,
          fontWeight: 600,
        }}
      >
        La règle des 500
      </div>

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 70,
          right: 70,
          fontSize: 84,
          fontStyle: "italic",
          color: COLOR.cream,
          lineHeight: 1,
        }}
      >
        Moins de mots
      </div>
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 70,
          right: 70,
          fontSize: 84,
          fontWeight: 700,
          color: COLOR.cream,
          lineHeight: 1,
        }}
      >
        que tu ne crois.
      </div>

      {/* Rows */}
      {rows.map((r, i) => {
        const top = rowTops[i];
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                top: top + 40,
                left: 70,
                fontFamily: "var(--font-inter)",
                fontSize: 22,
                color: COLOR.cream,
                opacity: 0.35,
                fontWeight: 500,
              }}
            >
              0{i + 1}
            </div>

            <div
              style={{
                position: "absolute",
                top: top + 30,
                left: 140,
                fontSize: 56,
                fontStyle: "italic",
                color: COLOR.cream,
                lineHeight: 1,
              }}
            >
              {r.mots}
            </div>

            {/* Percentage : right side, highlighted if 85% */}
            <div
              style={{
                position: "absolute",
                top: top - 10,
                right: 80,
                fontSize: 130,
                fontWeight: 700,
                color: r.highlight ? COLOR.coral : COLOR.cream,
                lineHeight: 1,
              }}
            >
              {r.pct}
            </div>

            {/* Circle around 85% */}
            {r.highlight && (
              <HandCircle
                left={700}
                top={top - 30}
                width={340}
                height={180}
                stroke={COLOR.coral}
                strokeWidth={8}
              />
            )}

            {/* Divider below row */}
            <div
              style={{
                position: "absolute",
                top: top + 130,
                left: 70,
                right: 70,
                height: 1,
                background: COLOR.cream,
                opacity: 0.2,
              }}
            />
          </div>
        );
      })}

      {/* Bottom statement */}
      <div
        style={{
          position: "absolute",
          top: 1060,
          left: 70,
          right: 70,
          fontFamily: "var(--font-inter)",
          fontSize: 34,
          fontWeight: 700,
          color: COLOR.cream,
          lineHeight: 1.25,
        }}
      >
        Tu y es en <span style={{ color: COLOR.coral }}>2 mois</span>.
      </div>
      <div
        style={{
          position: "absolute",
          top: 1105,
          left: 70,
          right: 70,
          fontFamily: "var(--font-inter)",
          fontSize: 26,
          fontWeight: 400,
          color: COLOR.cream,
          opacity: 0.6,
          lineHeight: 1.25,
        }}
      >
        À raison de 5 minutes par jour.
      </div>

      <BrandFooter theme="ink" pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

// ── SLIDE 5 — CTA + APP MOCKUP ───────────────────────────────────────
// Phone mockup centered. Coral sticker positioned OUTSIDE the phone.
// Arrow points from sticker to phone. Big pill CTA at the bottom.
function Slide5({ pageNum, totalPages }: SlideProps) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: COLOR.cream, fontFamily: "var(--font-serif)" }}
    >
      <RuledPaper />
      <Grain opacity={0.08} />
      <BrandHeader theme="cream" pageNum={pageNum} totalPages={totalPages} />

      {/* Kicker + title : y=210-400 */}
      <div
        style={{
          position: "absolute",
          top: 210,
          left: 70,
          right: 70,
          fontFamily: "var(--font-inter)",
          fontSize: 22,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: COLOR.ink,
          opacity: 0.5,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        L&apos;application
      </div>
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 70,
          right: 70,
          fontSize: 96,
          fontStyle: "italic",
          color: COLOR.ink,
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        On commence&nbsp;?
      </div>

      {/* Phone : y=430-960 (scaled 0.88 → 370×528) */}
      <div
        style={{
          position: "absolute",
          top: 430,
          left: "50%",
          transform: "translateX(-50%) scale(0.88)",
          transformOrigin: "top center",
        }}
      >
        <PhoneMockup />
      </div>

      {/* Sticker : OUTSIDE phone, top-right */}
      <Sticker left={720} top={430} rotate={8} bg={COLOR.coral} fontSize={26}>
        7 jours gratuits
      </Sticker>

      {/* Arrow from sticker to phone (down-left) */}
      <HandArrow
        left={660}
        top={500}
        width={130}
        height={110}
        direction="down-left"
        strokeWidth={4}
      />

      {/* Bottom CTA button : y=1000-1100 */}
      <div
        style={{
          position: "absolute",
          top: 1000,
          left: "50%",
          transform: "translateX(-50%)",
          background: COLOR.ink,
          color: COLOR.cream,
          borderRadius: 999,
          padding: "24px 54px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontFamily: "var(--font-inter)",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "0.02em",
          boxShadow: "0 6px 0 0 rgba(0,0,0,0.15)",
          whiteSpace: "nowrap",
        }}
      >
        Commencer mon essai
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M5 14H23M23 14L14 5M23 14L14 23"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* URL : y=1130 */}
      <div
        style={{
          position: "absolute",
          top: 1130,
          left: 70,
          right: 70,
          textAlign: "center",
          fontFamily: "var(--font-inter)",
          fontSize: 22,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: COLOR.ink,
          opacity: 0.5,
          fontWeight: 600,
        }}
      >
        quranlab.app · 85motscoran
      </div>

      <BrandFooter theme="cream" pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

/* iPhone mockup — fixed 420×600 internal size */
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
        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 h-[24px] w-[100px] rounded-full bg-neutral-950 z-20" />

        <div
          className="relative z-10 flex items-center justify-between px-[28px] pt-[16px] pb-[4px] text-[12px] font-semibold text-neutral-900"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <span>9:41</span>
          <span className="inline-block h-[8px] w-[14px] rounded-[2px] border border-neutral-900" />
        </div>

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
          className="px-[22px] pt-[22px]"
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
