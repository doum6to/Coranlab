"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ArrowDown, Check, Download, Heart } from "lucide-react";

/* ═════════════════════════════════════════════════════════════════════
 *  /carrousel
 *  5-slide Instagram-feed carousel (1080×1350) with per-slide PNG
 *  export. Designed premium & trending — dark/cream rhythm, Fraunces
 *  serif, Arabic calligraphy as hero element.
 * ═════════════════════════════════════════════════════════════════════ */

const SLIDE_W = 1080;
const SLIDE_H = 1350;
const PREVIEW_SCALE = 0.34;

export default function CarrouselPage() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingIdx, setExportingIdx] = useState<number | null>(null);

  async function exportSlide(idx: number, filename: string) {
    const node = refs.current[idx];
    if (!node) return;
    setExportingIdx(idx);
    try {
      // pixelRatio stays at 1 because the node is already at 1080×1350 natively.
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
        // Small delay between downloads so browsers don't swallow them.
        await new Promise((r) => setTimeout(r, 350));
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
            <p className="mt-3 text-sm text-neutral-600 max-w-lg">
              Clique &quot;Télécharger&quot; sur chaque slide ou &quot;Tout
              exporter&quot; pour générer les 5 PNG haute résolution.
            </p>
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
                    style={{
                      width: SLIDE_W,
                      height: SLIDE_H,
                    }}
                  >
                    <s.Component />
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
 *  SLIDES — each is a pure render (no hooks) so the PNG export is
 *  deterministic and instant. Font sizes/spacing are in absolute px
 *  because the container is a fixed 1080×1350 canvas.
 * ───────────────────────────────────────────────────────────────────── */

// Shared grain overlay — subtle noise for premium texture
function Grain({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <filter id="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

function Kicker({
  children,
  color = "neutral-500",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <p
      className={`text-[22px] tracking-[0.25em] uppercase text-${color} font-medium`}
    >
      {children}
    </p>
  );
}

// ── SLIDE 1 — HOOK (scroll stopper) ──────────────────────────────────
function Slide1() {
  return (
    <div
      className="relative w-full h-full bg-[#F5F1E8] text-neutral-950 overflow-hidden"
      style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
    >
      <Grain opacity={0.08} />

      {/* Big Arabic calligraphy as hero element */}
      <div
        dir="rtl"
        className="absolute left-1/2 top-[200px] -translate-x-1/2 font-arabic font-bold text-[260px] leading-[1] text-neutral-950 whitespace-nowrap"
        style={{ fontFamily: "var(--font-arabic)" }}
      >
        الْحَمْدُ لِلَّهِ
      </div>

      {/* Top brand line */}
      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 flex items-center gap-4">
        <span className="h-px w-16 bg-neutral-900" />
        <Kicker>Quranlab</Kicker>
        <span className="h-px w-16 bg-neutral-900" />
      </div>

      {/* Main copy */}
      <div className="absolute top-[620px] inset-x-[80px] text-center">
        <p
          className="text-[90px] leading-[1.05] text-neutral-950"
          style={{ fontStyle: "italic" }}
        >
          Tu le récites.
        </p>
        <p className="mt-5 text-[90px] leading-[1.05] font-semibold text-[#6967fb]">
          Tu le comprends ?
        </p>
      </div>

      {/* Swipe indicator */}
      <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <div
          className="font-sans text-[20px] tracking-[0.3em] uppercase text-neutral-600"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Swipe
        </div>
        <ArrowDown className="h-7 w-7 text-neutral-600" strokeWidth={1.5} />
      </div>
    </div>
  );
}

// ── SLIDE 2 — REVEAL (answer the hook) ───────────────────────────────
function Slide2() {
  return (
    <div
      className="relative w-full h-full bg-neutral-950 text-[#F5F1E8] overflow-hidden"
      style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
    >
      <Grain opacity={0.10} />

      {/* Glow accent */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full blur-3xl"
        style={{ background: "rgba(105, 103, 251, 0.25)" }}
      />

      {/* Top kicker */}
      <div className="absolute top-[90px] inset-x-0 text-center">
        <p
          className="text-[22px] tracking-[0.25em] uppercase text-[#F5F1E8]/50 font-medium"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          La traduction
        </p>
      </div>

      {/* Arabic verse */}
      <div
        dir="rtl"
        className="absolute top-[230px] inset-x-0 text-center font-arabic font-bold text-[170px] leading-[1.1] text-[#F5F1E8]"
        style={{ fontFamily: "var(--font-arabic)" }}
      >
        الْحَمْدُ لِلَّهِ
      </div>

      {/* Divider */}
      <div className="absolute top-[500px] left-1/2 -translate-x-1/2 flex items-center gap-4">
        <span className="h-px w-12 bg-[#F5F1E8]/40" />
        <span
          className="text-[18px] tracking-[0.3em] uppercase text-[#F5F1E8]/60"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          signifie
        </span>
        <span className="h-px w-12 bg-[#F5F1E8]/40" />
      </div>

      {/* Translation */}
      <div className="absolute top-[580px] inset-x-[60px] text-center">
        <p
          className="text-[84px] leading-[1.1] text-[#F5F1E8]"
          style={{ fontStyle: "italic" }}
        >
          Toute louange
        </p>
        <p className="mt-2 text-[84px] leading-[1.1] font-semibold text-[#F5F1E8]">
          appartient à Allah.
        </p>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-[96px] inset-x-[80px] text-center">
        <p
          className="text-[28px] leading-[1.4] text-[#F5F1E8]/70"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 500 }}
        >
          Tu l&apos;as prononcé ~1 800 fois cette année.
        </p>
        <p
          className="mt-1 text-[28px] text-[#F5F1E8]/70 font-medium italic"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Sans le savoir.
        </p>
      </div>
    </div>
  );
}

// ── SLIDE 3 — 3 beautiful words ───────────────────────────────────────
function Slide3() {
  const words: { ar: string; fr: string; count: string }[] = [
    { ar: "رَحْمَة", fr: "Miséricorde", count: "339 ×" },
    { ar: "نُور", fr: "Lumière", count: "194 ×" },
    { ar: "قَلْب", fr: "Cœur", count: "132 ×" },
  ];
  return (
    <div
      className="relative w-full h-full bg-[#F5F1E8] text-neutral-950 overflow-hidden"
      style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
    >
      <Grain opacity={0.08} />

      {/* Top header */}
      <div className="absolute top-[90px] inset-x-0 text-center">
        <p
          className="text-[22px] tracking-[0.25em] uppercase text-neutral-500 font-medium"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Trois mots qui reviennent
        </p>
        <p className="mt-5 text-[76px] leading-[1] text-neutral-950 italic">
          des centaines de fois.
        </p>
      </div>

      {/* Words list */}
      <div className="absolute top-[430px] inset-x-[70px] flex flex-col gap-[40px]">
        {words.map((w, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between pb-[32px] border-b border-neutral-900/15"
          >
            <span
              dir="rtl"
              className="font-arabic font-bold text-[130px] leading-none text-neutral-950"
              style={{ fontFamily: "var(--font-arabic)" }}
            >
              {w.ar}
            </span>
            <div className="flex flex-col items-end">
              <span
                className="text-[48px] leading-none text-neutral-950 italic"
                style={{ fontStyle: "italic" }}
              >
                {w.fr}
              </span>
              <span
                className="mt-3 text-[20px] tracking-[0.2em] uppercase text-neutral-500 font-medium"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {w.count}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Swipe indicator */}
      <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div
          className="text-[18px] tracking-[0.3em] uppercase text-neutral-500"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Continue
        </div>
        <ArrowDown className="h-6 w-6 text-neutral-500" strokeWidth={1.5} />
      </div>
    </div>
  );
}

// ── SLIDE 4 — STAT PUNCH ─────────────────────────────────────────────
function Slide4() {
  const rows: { mots: string; pct: string }[] = [
    { mots: "100 mots", pct: "50%" },
    { mots: "300 mots", pct: "70%" },
    { mots: "500 mots", pct: "85%" },
  ];
  return (
    <div
      className="relative w-full h-full bg-neutral-950 text-[#F5F1E8] overflow-hidden"
      style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
    >
      <Grain opacity={0.1} />

      <div
        className="absolute bottom-0 left-0 right-0 h-[500px] blur-3xl"
        style={{
          background:
            "linear-gradient(0deg, rgba(105,103,251,0.20) 0%, rgba(105,103,251,0) 100%)",
        }}
      />

      {/* Top */}
      <div className="absolute top-[90px] inset-x-0 text-center">
        <p
          className="text-[22px] tracking-[0.25em] uppercase text-[#F5F1E8]/50 font-medium"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          La règle des 500 mots
        </p>
      </div>

      {/* Stats stack */}
      <div className="absolute top-[250px] inset-x-[90px] flex flex-col gap-[14px]">
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between py-[28px] border-b border-[#F5F1E8]/20"
          >
            <span
              className="text-[68px] text-[#F5F1E8] italic"
              style={{ fontStyle: "italic" }}
            >
              {r.mots}
            </span>
            <span
              className="text-[150px] leading-none font-semibold text-[#6967fb]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {r.pct}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom statement */}
      <div className="absolute bottom-[130px] inset-x-[80px] text-center">
        <p
          className="text-[64px] leading-[1.1] text-[#F5F1E8]"
          style={{ fontStyle: "italic" }}
        >
          du Coran. Compris.
        </p>
        <p
          className="mt-4 text-[26px] tracking-[0.2em] uppercase text-[#F5F1E8]/60 font-medium"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          En deux mois · 5 minutes par jour
        </p>
      </div>
    </div>
  );
}

// ── SLIDE 5 — CTA + app mockup ───────────────────────────────────────
function Slide5() {
  return (
    <div
      className="relative w-full h-full bg-[#F5F1E8] text-neutral-950 overflow-hidden"
      style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
    >
      <Grain opacity={0.08} />

      {/* Top */}
      <div className="absolute top-[90px] inset-x-0 text-center">
        <p
          className="text-[22px] tracking-[0.25em] uppercase text-neutral-500 font-medium"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          L&apos;application
        </p>
        <p
          className="mt-5 text-[96px] leading-[1] italic text-neutral-950"
          style={{ fontStyle: "italic" }}
        >
          On commence ?
        </p>
      </div>

      {/* Phone mockup */}
      <div className="absolute top-[360px] left-1/2 -translate-x-1/2">
        <PhoneMockup />
      </div>

      {/* CTA + URL */}
      <div className="absolute bottom-[100px] inset-x-[80px] flex flex-col items-center gap-5">
        <div
          className="px-10 py-5 rounded-full bg-neutral-950 text-[#F5F1E8] text-[32px] font-semibold tracking-wide"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          7 jours gratuits
        </div>
        <p
          className="text-[26px] tracking-[0.15em] uppercase text-neutral-600 font-medium"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          quranlab.app/85motscoran
        </p>
      </div>
    </div>
  );
}

// Small phone mockup for slide 5 — fits inside 1080×1350 canvas
function PhoneMockup() {
  return (
    <div
      className="relative rounded-[68px] bg-neutral-950 p-[16px]"
      style={{ width: 420, height: 640 }}
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
          className="px-[22px] pt-[24px]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <p className="text-[13px] font-bold text-neutral-400 text-center mb-[18px] tracking-wide">
            SÉLECTIONNE LA BONNE TRADUCTION
          </p>
          <div
            className="bg-white rounded-[20px] border-2 border-neutral-200 p-[20px] text-center mb-[22px]"
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
  { id: 1, Component: Slide1, title: "Hook", filename: "quranlab-slide-1-hook.png" },
  { id: 2, Component: Slide2, title: "Reveal", filename: "quranlab-slide-2-reveal.png" },
  { id: 3, Component: Slide3, title: "3 mots", filename: "quranlab-slide-3-mots.png" },
  { id: 4, Component: Slide4, title: "Stats", filename: "quranlab-slide-4-stats.png" },
  { id: 5, Component: Slide5, title: "CTA + app", filename: "quranlab-slide-5-cta.png" },
];
