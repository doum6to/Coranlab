"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Interlude chart: brand (solid, rising) vs others (dashed, flat)      */

const PW = 320;
const PH = 168;
const P_LEFT = 20;
const P_RIGHT = 302;
const P_BOTTOM = 140;
const P_TOP = 24;

const P_BRAND_LINE = `M${P_LEFT} ${P_BOTTOM} L${P_RIGHT} ${P_TOP}`;
const P_BRAND_AREA = `${P_BRAND_LINE} L${P_RIGHT} ${P_BOTTOM} L${P_LEFT} ${P_BOTTOM} Z`;
const P_OTHERS_LINE = `M${P_LEFT} ${P_BOTTOM} C 100 138, 160 126, 220 122 S 280 116, ${P_RIGHT} 114`;
const P_OTHERS_AREA = `${P_OTHERS_LINE} L${P_RIGHT} ${P_BOTTOM} L${P_LEFT} ${P_BOTTOM} Z`;

export function ProgressChart({
  chartLabel,
  brandLabel,
  othersLabel,
  xStart,
  xEnd,
  checkTitle,
  checklist,
}: {
  chartLabel: string;
  brandLabel: string;
  othersLabel: string;
  xStart: string;
  xEnd: string;
  checkTitle: string;
  checklist: string[];
}) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const clipId = `cm-clip-${uid}`;
  const maskId = `cm-mask-${uid}`;
  const tw = (delay: number, duration: number) => (reduce ? { duration: 0 } : { delay, duration, ease: "easeInOut" as const });
  const fade = (delay: number) => (reduce ? { duration: 0 } : { delay, duration: 0.35 });

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[15px] font-semibold" style={{ color: "#1A1A1A" }}>{chartLabel}</span>
        <span className="rounded-[8px] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.16em]" style={{ background: "#6967FB", color: "#FFFFFF" }}>{brandLabel}</span>
      </div>

      <svg viewBox={`0 0 ${PW} ${PH}`} className="block w-full" role="img" aria-label={`${chartLabel} : ${brandLabel} vs ${othersLabel}`}>
        <defs>
          <clipPath id={clipId}>
            <motion.rect x={P_LEFT} y="0" height={PH} initial={{ width: 0 }} animate={{ width: P_RIGHT - P_LEFT + 2 }} transition={tw(1.35, 0.8)} />
          </clipPath>
          <mask id={maskId}>
            <motion.rect x={P_LEFT} y="0" height={PH} fill="#fff" initial={{ width: 0 }} animate={{ width: P_RIGHT - P_LEFT + 2 }} transition={tw(0.55, 0.9)} />
          </mask>
        </defs>

        {/* grid */}
        {[60, 100].map((y) => (
          <line key={y} x1={P_LEFT} x2={P_RIGHT} y1={y} y2={y} stroke="#E8E8E8" strokeDasharray="3 4" strokeWidth="1" />
        ))}
        <motion.line x1={P_LEFT} x2={P_RIGHT} y1={P_BOTTOM} y2={P_BOTTOM} stroke="#E8E8E8" strokeWidth="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade(0.3)} />

        {/* others (dashed + grey area), revealed with a mask */}
        <g mask={`url(#${maskId})`}>
          <path d={P_OTHERS_AREA} fill="#F5F5F5" />
          <path d={P_OTHERS_LINE} fill="none" stroke="#555555" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
        </g>

        {/* brand (solid + pink area), area revealed with a clip, line drawn via pathLength */}
        <g clipPath={`url(#${clipId})`}>
          <path d={P_BRAND_AREA} fill="rgba(243,182,196,.55)" />
        </g>
        <motion.path d={P_BRAND_LINE} fill="none" stroke="#6967FB" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={tw(1.35, 0.8)} />

        {/* origin ring, fills */}
        <circle cx={P_LEFT} cy={P_BOTTOM} r="5" fill="#FFFFFF" stroke="#6967FB" strokeWidth="2" />
        <motion.circle cx={P_LEFT} cy={P_BOTTOM} r="5" fill="#6967FB" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={fade(0.3)} style={{ transformBox: "fill-box", transformOrigin: "center" }} />

        {/* labels */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade(0.5)}>
          <text x={P_RIGHT} y={104} textAnchor="end" fontSize="11" fontFamily="inherit" fill="#999999">{othersLabel}</text>
          <text x={P_LEFT} y={PH - 6} fontSize="11" fontFamily="inherit" fill="#999999">{xStart}</text>
          <text x={P_RIGHT} y={PH - 6} textAnchor="end" fontSize="11" fontFamily="inherit" fill="#999999">{xEnd}</text>
        </motion.g>
      </svg>

      {/* checklist */}
      <motion.p className="mt-4 flex items-center gap-2 text-[16px] font-semibold" style={{ color: "#1A1A1A" }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={fade(0.7)}>
        <span style={{ color: "#6967FB" }} aria-hidden>✦</span>
        {checkTitle}
      </motion.p>
      <ul className="mt-2.5 space-y-2.5">
        {checklist.map((item, i) => {
          const d = 0.85 + i * 0.18;
          return (
            <motion.li key={item} className="flex items-center gap-3 text-[15px] leading-snug" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade(d)}>
              <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ border: "1.5px solid #E8E8E8" }} aria-hidden>
                <motion.span
                  className="absolute inset-0 flex items-center justify-center rounded-full"
                  style={{ background: "#6967FB", color: "#FFFFFF" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={reduce ? { duration: 0 } : { delay: d + 0.15, type: "spring", stiffness: 500, damping: 22 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </motion.span>
              </span>
              <span style={{ color: "#1A1A1A" }}>{item}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Daily-time projection chart (goal line, "alone" line, S-curve)      */

const TW = 320;
const TH = 160;
const T_LEFT = 14;
const T_RIGHT = 306;
const T_TOP = 22;
const T_BOTTOM = 132;
const T_GOAL = 42;
const N_POINTS = 48;
const MAX_WEEKS = 13; // ≈ 3 months

const sigmoid = (v: number) => 1 / (1 + Math.exp(-v));

/**
 * Logistic curve with a CONSTANT number of points (so `d` morphs cleanly),
 * parameterised so that it crosses the goal line at `weeks` (x-axis = 13 weeks).
 * Returns the polyline points and the exact goal intersection x.
 */
function buildCurve(weeks: number | null) {
  const flat = Array.from({ length: N_POINTS }, (_, i) => ({ x: T_LEFT + ((T_RIGHT - T_LEFT) * i) / (N_POINTS - 1), y: T_BOTTOM }));
  if (weeks === null) return { pts: flat, xi: null as number | null };

  const tGoal = Math.min(0.95, Math.max(0.15, weeks / MAX_WEEKS));
  const fGoal = (T_BOTTOM - T_GOAL) / (T_BOTTOM - T_TOP);
  const k = 0.16 * tGoal;
  // Normalised logistic (starts at exactly 0): n(t) = (s(t) - s(0)) / (1 - s(0)).
  const norm = (t: number, t0: number) => {
    const s0 = sigmoid(-t0 / k);
    return (sigmoid((t - t0) / k) - s0) / (1 - s0);
  };
  // Bisection on t0 so that n(tGoal) = fGoal.
  let lo = -1;
  let hi = 2;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (norm(tGoal, mid) > fGoal) lo = mid;
    else hi = mid;
  }
  const t0 = (lo + hi) / 2;
  const pts = flat.map((p, i) => {
    const t = i / (N_POINTS - 1);
    return { x: p.x, y: T_BOTTOM - (T_BOTTOM - T_TOP) * norm(t, t0) };
  });
  // Intersection of the polyline with the goal line.
  let xi: number | null = null;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (a.y >= T_GOAL && b.y <= T_GOAL) {
      const r = (a.y - T_GOAL) / (a.y - b.y || 1);
      xi = a.x + (b.x - a.x) * r;
      break;
    }
  }
  return { pts, xi };
}

const toLine = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

export function TimeChart({
  goalLabel,
  aloneLabel,
  xStart,
  xEnd,
  weeks,
  dateLabel,
}: {
  goalLabel: string;
  aloneLabel: string;
  xStart: string;
  xEnd: string;
  /** Selected projection (null = nothing selected yet). */
  weeks: number | null;
  /** Goal date label shown in the tooltip pill (e.g. "19 nov."). */
  dateLabel: string | null;
}) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const clipId = `cm-tclip-${uid}`;
  const maskId = `cm-tmask-${uid}`;
  const { pts, xi } = useMemo(() => buildCurve(weeks), [weeks]);
  const lineD = toLine(pts);
  const areaD = `${lineD} L${T_RIGHT} ${T_BOTTOM} L${T_LEFT} ${T_BOTTOM} Z`;
  const has = weeks !== null && xi !== null;
  const px = xi ?? T_LEFT;
  const pillLeft = Math.min(T_RIGHT - 38, Math.max(T_LEFT + 38, px));
  // First selection: the curve is revealed left → right by the clip (no morph from the flat baseline);
  // later selections morph the path in 0.6s.
  const hadCurve = useRef(false);
  useEffect(() => {
    hadCurve.current = has;
  }, [has]);
  const morph = reduce || !hadCurve.current ? { duration: 0 } : { duration: 0.6, ease: "easeInOut" as const };
  const tw = (delay: number, duration: number) => (reduce ? { duration: 0 } : { delay, duration, ease: "easeInOut" as const });

  return (
    <div className="relative w-full" style={{ aspectRatio: `${TW} / ${TH}` }}>
      <svg viewBox={`0 0 ${TW} ${TH}`} className="absolute inset-0 h-full w-full" role="img" aria-label={goalLabel}>
        <defs>
          <clipPath id={clipId}>
            <motion.rect x={T_LEFT} y="0" height={TH} initial={{ width: 0 }} animate={{ width: has ? T_RIGHT - T_LEFT + 2 : 0 }} transition={tw(0, 0.7)} />
          </clipPath>
          <mask id={maskId}>
            <motion.rect x={T_LEFT} y="0" height={TH} fill="#fff" initial={{ width: 0 }} animate={{ width: T_RIGHT - T_LEFT + 2 }} transition={tw(0.55, 0.6)} />
          </mask>
        </defs>

        {/* baseline */}
        <line x1={T_LEFT} x2={T_RIGHT} y1={T_BOTTOM} y2={T_BOTTOM} stroke="#E8E8E8" strokeWidth="1" />

        {/* "alone" gentle solid line, drawn left → right */}
        <motion.path d={`M${T_LEFT} ${T_BOTTOM - 2} L${T_RIGHT} 104`} fill="none" stroke="#555555" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={tw(0.1, 0.6)} />
        <motion.text x={T_RIGHT} y={96} textAnchor="end" fontSize="11" fontFamily="inherit" fontWeight="500" fill="#555555" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tw(0.6, 0.3)}>{aloneLabel}</motion.text>

        {/* goal: dashed line revealed by a mask + flag label */}
        <g mask={`url(#${maskId})`}>
          <line x1={T_LEFT} x2={T_RIGHT} y1={T_GOAL} y2={T_GOAL} stroke="#6967FB" strokeWidth="1.5" strokeDasharray="4 5" strokeLinecap="round" />
        </g>
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tw(0.7, 0.3)}>
          <path d={`M${T_LEFT + 1} ${T_GOAL - 22} v13 M${T_LEFT + 1} ${T_GOAL - 22} h8 l-2 3 2 3 h-8`} fill="none" stroke="#6967FB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x={T_LEFT + 14} y={T_GOAL - 12} fontSize="11" fontFamily="inherit" fontWeight="700" fill="#1A1A1A">{goalLabel}</text>
        </motion.g>

        {/* S-curve + area (clip reveals on first selection; d morphs afterwards) */}
        <g clipPath={`url(#${clipId})`}>
          <motion.path initial={false} animate={{ d: areaD }} transition={morph} fill="rgba(243,182,196,.5)" />
          <motion.path initial={false} animate={{ d: lineD }} transition={morph} fill="none" stroke="#6967FB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* intersection point */}
        <motion.circle
          cy={T_GOAL}
          r="5.5"
          fill="#6967FB"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          initial={false}
          animate={{ cx: px, opacity: has ? 1 : 0, scale: has ? 1 : 0.5 }}
          transition={reduce ? { duration: 0 } : { cx: { duration: 0.5, ease: "easeInOut" }, opacity: { delay: 0.45, duration: 0.25 }, scale: { delay: 0.45, type: "spring", stiffness: 400, damping: 20 } }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />

        {/* axes */}
        <text x={T_LEFT} y={TH - 6} fontSize="11" fontFamily="inherit" fill="#999999">{xStart}</text>
        <text x={T_RIGHT} y={TH - 6} textAnchor="end" fontSize="11" fontFamily="inherit" fill="#999999">{xEnd}</text>
      </svg>

      {/* date tooltip pill (HTML, positioned in % of the chart box) */}
      {has && dateLabel && (
        <motion.div
          className="pointer-events-none absolute"
          style={{ top: `${(T_GOAL / TH) * 100}%`, transform: "translate(-50%, calc(-100% - 12px))" }}
          initial={{ left: `${(pillLeft / TW) * 100}%` }}
          animate={{ left: `${(pillLeft / TW) * 100}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: "easeInOut" }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { delay: 0.5, type: "spring", stiffness: 420, damping: 24 }}
            className="relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-bold"
            style={{ background: "#6967FB", color: "#FFFFFF", boxShadow: "0 8px 20px -10px rgba(58,40,31,.6)" }}
          >
            <span style={{ color: "#E6E5FF" }} aria-hidden>✦</span>
            <span>{dateLabel}</span>
            <span className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45" style={{ background: "#6967FB" }} aria-hidden />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
