import { Flame } from "lucide-react";

/**
 * Scarcity data for the lifetime launch offer (first 2000 students at the
 * monthly price). Update these two numbers to reflect current sign-ups.
 */
export const SPOTS_JOINED = 1902;
export const SPOTS_TOTAL = 2000;

const PCT = Math.round((SPOTS_JOINED / SPOTS_TOTAL) * 100);
const fmt = (n: number) => n.toLocaleString("fr-FR");

/** Thin sticky banner shown at the very top of the page. */
export function StickySpotsBar() {
  return (
    <div className="sticky top-0 z-50 bg-[#6967fb] text-white shadow-sm">
      <div className="mx-auto flex max-w-[1080px] items-center justify-center gap-2 px-4 py-2 text-center text-[12px] font-semibold sm:text-sm">
        <Flame className="h-4 w-4 shrink-0" strokeWidth={2.2} />
        <span>
          Offre limitée par places : {fmt(SPOTS_JOINED)}/{fmt(SPOTS_TOTAL)}{" "}
          élèves ont rejoint
        </span>
      </div>
    </div>
  );
}

/** Progress display placed under the pricing CTA. */
export function SpotsProgress({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const isDark = tone === "dark";
  return (
    <div className="mt-5">
      <div
        className={`flex items-center justify-between text-[11px] font-semibold ${
          isDark ? "text-white/75" : "text-neutral-500"
        }`}
      >
        <span>
          {fmt(SPOTS_JOINED)}/{fmt(SPOTS_TOTAL)} élèves ont rejoint
        </span>
        <span>{PCT}%</span>
      </div>
      <div
        className={`mt-1.5 h-2 w-full overflow-hidden rounded-full ${
          isDark ? "bg-white/15" : "bg-neutral-200"
        }`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${PCT}%`,
            backgroundColor: isDark ? "#a6a5ff" : "#6967fb",
          }}
        />
      </div>
      <p
        className={`mt-2 text-[11px] ${
          isDark ? "text-white/55" : "text-neutral-500"
        }`}
      >
        Plus que {fmt(SPOTS_TOTAL - SPOTS_JOINED)} places à 14,97€ à vie.
      </p>
    </div>
  );
}
