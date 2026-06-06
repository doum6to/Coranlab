const fmt = (n: number) => n.toLocaleString("fr-FR");
const pct = (joined: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((joined / total) * 100)) : 0;

/** Progress display placed under the pricing CTA. */
export function SpotsProgress({
  joined,
  total,
  priceLabel,
  compareLabel,
  tone = "dark",
}: {
  joined: number;
  total: number;
  priceLabel: string;
  compareLabel?: string;
  tone?: "dark" | "light";
}) {
  const isDark = tone === "dark";
  const left = Math.max(0, total - joined);
  return (
    <div className="mt-5">
      <div
        className={`flex items-center justify-between text-[11px] font-semibold ${
          isDark ? "text-white/75" : "text-neutral-500"
        }`}
      >
        <span>
          {fmt(joined)}/{fmt(total)} élèves ont rejoint
        </span>
        <span>{pct(joined, total)}%</span>
      </div>
      <div
        className={`mt-1.5 h-2 w-full overflow-hidden rounded-full ${
          isDark ? "bg-white/15" : "bg-neutral-200"
        }`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct(joined, total)}%`,
            backgroundColor: isDark ? "#a6a5ff" : "#6967fb",
          }}
        />
      </div>
      <p
        className={`mt-2 text-[11px] ${
          isDark ? "text-white/55" : "text-neutral-500"
        }`}
      >
        <span className="font-semibold">{priceLabel}</span>
        {compareLabel ? (
          <>
            {" "}
            <span className="line-through opacity-60">{compareLabel}</span>
          </>
        ) : null}{" "}
        — plus que {fmt(left)} places à vie.
      </p>
    </div>
  );
}
