"use client";

import { useEffect, useState } from "react";

import { createApprendreCoranCheckout } from "@/actions/apprendre-coran-checkout";
import type { ApprendreCoranContent, OnbStep, OnbPlan } from "@/lib/apprendre-coran-content";

/* Brand palette (adapted from the reference onboarding, in Quranlab colors) */
const C = {
  primary: "#6967FB",
  ink: "#2D1F4F",
  cream: "#FFF9F0",
  text: "#171326",
  muted: "#8A86A0",
  border: "#E9E5F7",
  green: "#22C55E",
};

export function Onboarding({ content }: { content: ApprendreCoranContent }) {
  const STEPS = content.steps;
  const total = STEPS.length + 1; // + paywall
  const [index, setIndex] = useState(0);
  const [multi, setMulti] = useState<Record<number, string[]>>({});
  const [single, setSingle] = useState<Record<number, string>>({});
  const [pct, setPct] = useState(0);

  const isPaywall = index >= STEPS.length;
  const step: OnbStep | null = isPaywall ? null : STEPS[index];
  const isFirst = index === 0;
  const showChrome = !isFirst && !isPaywall;

  const go = () => setIndex((i) => Math.min(i + 1, total - 1));
  const back = () => setIndex((i) => Math.max(i - 1, 0));

  const toggleMulti = (opt: string) =>
    setMulti((m) => {
      const cur = m[index] ?? [];
      return { ...m, [index]: cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt] };
    });

  const pickSingle = (opt: string) => {
    setSingle((s) => ({ ...s, [index]: opt }));
    window.setTimeout(go, 200);
  };

  // Loading step auto-advances 0 → 100%.
  useEffect(() => {
    if (!step || step.type !== "loading") return;
    setPct(0);
    const started = Date.now();
    const id = window.setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - started) / 2200) * 100));
      setPct(p);
      if (p >= 100) {
        window.clearInterval(id);
        window.setTimeout(go, 350);
      }
    }, 40);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const bg = isPaywall || (step && step.type === "hero") ? C.cream : "#FFFFFF";

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: bg, color: C.text }}>
      {showChrome && (
        <div className="shrink-0 flex items-center gap-3 px-4 pt-3 sm:px-6">
          <button onClick={back} aria-label="Retour" className="p-1 -ml-1 text-2xl leading-none" style={{ color: C.muted }}>
            ‹
          </button>
          <div className="h-2 flex-1 rounded-full" style={{ background: C.border }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(index / (total - 1)) * 100}%`, background: C.primary }} />
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-5">
        {isPaywall ? <Paywall paywall={content.paywall} /> : renderStep(step!)}
      </div>
    </div>
  );

  function renderStep(step: OnbStep) {
    switch (step.type) {
      case "hero":
        return (
          <Shell footer={<PrimaryButton onClick={go}>{step.cta ?? "Commencer"}</PrimaryButton>}>
            <Img url={step.image} label={step.headline} />
            <h1 className="shrink-0 font-serif text-[26px] leading-tight whitespace-pre-line">{step.headline}</h1>
            {step.sub && <p className="shrink-0 text-sm" style={{ color: C.muted }}>{step.sub}</p>}
          </Shell>
        );

      case "message":
        return (
          <Shell footer={<PrimaryButton onClick={go}>{step.cta ?? "Continuer"}</PrimaryButton>}>
            <Img url={step.image} label={step.headline} />
            <h1 className="shrink-0 font-serif text-[26px] leading-tight whitespace-pre-line">{step.headline}</h1>
            {step.sub && <p className="shrink-0 text-sm" style={{ color: C.muted }}>{step.sub}</p>}
          </Shell>
        );

      case "comparison": {
        const cols = [step.left, step.right].filter(Boolean) as NonNullable<OnbStep["left"]>[];
        return (
          <Shell footer={<PrimaryButton onClick={go}>Continuer</PrimaryButton>}>
            <h1 className="shrink-0 font-serif text-2xl leading-tight">{step.headline}</h1>
            <div className="grid w-full grid-cols-2 gap-3">
              {cols.map((col) => (
                <div key={col.title} className="rounded-2xl border-2 p-3 text-left" style={{ borderColor: col.good ? C.primary : C.border, background: col.good ? `${C.primary}0D` : "#FAFAFA" }}>
                  <p className="mb-2 text-sm font-bold">{col.title}</p>
                  <ul className="space-y-1.5">
                    {col.items.map((it) => (
                      <li key={it} className="flex items-center gap-2 text-[13px]">
                        <span>{col.good ? "✅" : "⚠️"}</span>
                        <span style={{ color: col.good ? C.text : C.muted }}>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Shell>
        );
      }

      case "checklist":
        return (
          <Shell footer={<PrimaryButton onClick={go}>Continuer</PrimaryButton>}>
            <h1 className="shrink-0 font-serif text-2xl leading-tight">{step.headline}</h1>
            <ul className="w-full space-y-2">
              {(step.items ?? []).map((it) => (
                <li key={it} className="flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-left" style={{ borderColor: C.border }}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white" style={{ background: C.primary }}>✓</span>
                  <span className="text-sm">{it}</span>
                </li>
              ))}
            </ul>
          </Shell>
        );

      case "single":
        return (
          <Shell>
            <Heading headline={step.headline} sub={step.sub} />
            <div className="w-full space-y-2.5">
              {(step.options ?? []).map((opt) => {
                const active = single[index] === opt;
                return (
                  <button key={opt} onClick={() => pickSingle(opt)} className="w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition" style={{ borderColor: active ? C.primary : C.border, background: active ? `${C.primary}12` : "#fff" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </Shell>
        );

      case "multi": {
        const selected = multi[index] ?? [];
        return (
          <Shell footer={<PrimaryButton onClick={go} disabled={selected.length === 0}>Continuer</PrimaryButton>}>
            <Heading headline={step.headline} sub={step.sub} />
            <div className="w-full space-y-2.5">
              {(step.options ?? []).map((opt) => {
                const active = selected.includes(opt);
                return (
                  <button key={opt} onClick={() => toggleMulti(opt)} className="flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition" style={{ borderColor: active ? C.primary : C.border, background: active ? `${C.primary}12` : "#fff" }}>
                    <span>{opt}</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white" style={{ background: active ? C.primary : "transparent", border: active ? "none" : `2px solid ${C.border}` }}>
                      {active ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </Shell>
        );
      }

      case "chart":
        return (
          <Shell footer={<PrimaryButton onClick={go}>Continuer</PrimaryButton>}>
            <h1 className="shrink-0 font-serif text-2xl leading-tight">{step.headline}</h1>
            <GrowthChart />
            {step.sub && <p className="shrink-0 text-sm" style={{ color: C.muted }}>{step.sub}</p>}
          </Shell>
        );

      case "reviews":
        return (
          <Shell footer={<PrimaryButton onClick={go}>Continuer</PrimaryButton>}>
            <div className="shrink-0 text-lg" style={{ color: "#F5C842" }}>★★★★★</div>
            <h1 className="shrink-0 font-serif text-2xl leading-tight">{step.headline}</h1>
            <div className="w-full space-y-2">
              {(step.reviews ?? []).map((r) => (
                <div key={r.name + r.text} className="rounded-2xl border px-4 py-2.5 text-left" style={{ borderColor: C.border }}>
                  <div className="text-xs" style={{ color: "#F5C842" }}>★★★★★</div>
                  <p className="mt-1 text-[13px] italic">« {r.text} »</p>
                  <p className="mt-0.5 text-xs font-semibold" style={{ color: C.muted }}>— {r.name}</p>
                </div>
              ))}
            </div>
          </Shell>
        );

      case "loading":
        return (
          <Shell>
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke={C.border} strokeWidth="8" />
                <circle cx="50" cy="50" r="44" fill="none" stroke={C.primary} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 276} 276`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold">{pct}%</div>
            </div>
            <h1 className="shrink-0 font-serif text-2xl leading-tight">{step.headline}</h1>
          </Shell>
        );

      case "stat":
        return (
          <Shell footer={<PrimaryButton onClick={go}>Continuer</PrimaryButton>}>
            <div className="shrink-0 text-lg" style={{ color: "#F5C842" }}>★★★★★</div>
            <div className="shrink-0 font-serif text-5xl font-bold" style={{ color: C.primary }}>{step.big}</div>
            <h1 className="shrink-0 font-serif text-2xl leading-tight">{step.headline}</h1>
            {step.sub && <p className="shrink-0 text-sm" style={{ color: C.muted }}>{step.sub}</p>}
          </Shell>
        );

      case "ready":
        return (
          <Shell footer={<PrimaryButton onClick={go}>{step.cta ?? "Voir mon offre"}</PrimaryButton>}>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-4xl text-white" style={{ background: C.green }}>✓</div>
            <h1 className="shrink-0 font-serif text-2xl leading-tight">{step.headline}</h1>
            {step.sub && <p className="shrink-0 text-sm" style={{ color: C.muted }}>{step.sub}</p>}
          </Shell>
        );

      default:
        return null;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Layout helpers — everything fits the viewport, no scroll.           */

/** Fills the available height: content vertically centered, CTA pinned bottom. */
function Shell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 py-3 text-center">
        {children}
      </div>
      {footer && <div className="shrink-0 pb-5 pt-2">{footer}</div>}
    </div>
  );
}

function Heading({ headline, sub }: { headline?: string; sub?: string }) {
  return (
    <div className="shrink-0 text-center">
      <h1 className="font-serif text-xl sm:text-2xl leading-tight">{headline}</h1>
      {sub && <p className="mt-1.5 text-sm" style={{ color: C.muted }}>{sub}</p>}
    </div>
  );
}

/** Renders the image URL if set (WHOLE image visible, never cropped), otherwise a
 *  dashed placeholder. `undefined` url = the step has no image slot → nothing. */
function Img({ url, label }: { url?: string; label?: string }) {
  if (url === undefined) return null;
  if (url) {
    return (
      <div className="flex min-h-0 w-full flex-1 items-center justify-center py-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={label ?? ""} className="max-h-full max-w-full rounded-3xl object-contain" />
      </div>
    );
  }
  return (
    <div className="flex min-h-0 w-full flex-1 items-center justify-center py-1">
      <div
        className="flex h-full max-h-[34vh] min-h-[120px] w-full items-center justify-center rounded-3xl border-2 border-dashed p-6"
        style={{ borderColor: `${C.primary}55`, background: `${C.primary}0A` }}
      >
        <span className="text-center text-sm font-medium" style={{ color: C.primary }}>
          🖼️ Image
          <br />
          <span className="text-xs opacity-60">(à importer depuis l&apos;admin)</span>
        </span>
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-full rounded-2xl py-3.5 text-base font-bold text-white transition active:scale-[0.98] disabled:opacity-40" style={{ background: C.primary, boxShadow: `0 5px 0 0 ${C.ink}40` }}>
      {children}
    </button>
  );
}

function GrowthChart() {
  return (
    <svg viewBox="0 0 300 130" className="w-full max-h-[26vh]">
      <defs>
        <linearGradient id="qc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.primary} stopOpacity="0.25" />
          <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M10 115 C 80 110, 130 72, 180 48 S 260 16, 290 12 L 290 122 L 10 122 Z" fill="url(#qc)" />
      <path d="M10 115 C 80 110, 130 72, 180 48 S 260 16, 290 12" fill="none" stroke={C.primary} strokeWidth="4" strokeLinecap="round" />
      {[["S1", 10], ["S2", 80], ["S3", 150], ["S4", 220], ["S5", 285]].map(([l, x]) => (
        <text key={l as string} x={x as number} y={129} fontSize="9" fill={C.muted} textAnchor="middle">{l as string}</text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Paywall — same structure as the reference, in EUROS, fits viewport  */

function Paywall({ paywall }: { paywall: ApprendreCoranContent["paywall"] }) {
  const plans: { id: "weekly" | "annual"; cfg: OnbPlan }[] = [
    { id: "weekly", cfg: paywall.weekly },
    { id: "annual", cfg: paywall.annual },
  ];
  const [selected, setSelected] = useState<"weekly" | "annual">(paywall.annual.popular ? "annual" : "weekly");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const checkout = async () => {
    setBusy(true);
    setErr(null);
    const res = await createApprendreCoranCheckout(selected);
    if ("url" in res && res.url) {
      window.location.href = res.url;
    } else {
      setBusy(false);
      setErr(("error" in res && res.error) || "Une erreur est survenue.");
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col py-4">
      <h1 className="shrink-0 text-center font-serif text-[28px] leading-[1.08] whitespace-pre-line">{paywall.title}</h1>

      {paywall.image !== undefined && (
        <div className="my-3 flex min-h-0 flex-1 items-center justify-center">
          {paywall.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={paywall.image} alt="" className="max-h-[26vh] max-w-full rounded-3xl object-contain" />
          ) : (
            <div className="flex h-[22vh] w-full items-center justify-center rounded-3xl border-2 border-dashed" style={{ borderColor: `${C.primary}55`, background: `${C.primary}0A`, color: C.primary }}>
              🖼️ Image (admin)
            </div>
          )}
        </div>
      )}

      <ul className="shrink-0 space-y-1.5 px-1">
        {paywall.bullets.map((b) => (
          <li key={b} className="flex items-center gap-3 text-sm">
            <span style={{ color: C.primary }}>✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 shrink-0 space-y-2.5">
        {plans.map(({ id, cfg }) => {
          const active = selected === id;
          return (
            <button key={id} onClick={() => setSelected(id)} className="relative flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-left transition" style={{ borderColor: active ? C.primary : C.border, background: active ? `${C.primary}10` : "#fff" }}>
              {cfg.popular && (
                <span className="absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white" style={{ background: C.primary }}>
                  Le plus populaire
                </span>
              )}
              <div>
                <div className="text-[15px] font-bold">{cfg.title}</div>
                {cfg.sub && <div className="text-xs" style={{ color: C.muted }}>{cfg.sub}</div>}
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold">{cfg.priceLabel}</div>
                <div className="text-xs" style={{ color: C.muted }}>{cfg.per}</div>
              </div>
            </button>
          );
        })}
      </div>

      {paywall.reassurance && (
        <div className="mt-3 flex shrink-0 items-center justify-center gap-2 text-xs" style={{ color: C.muted }}>
          <span style={{ color: C.text }}>✓</span> {paywall.reassurance}
        </div>
      )}

      {err && <p className="mt-2 shrink-0 text-center text-sm text-rose-500">{err}</p>}

      <div className="mt-3 shrink-0">
        <PrimaryButton onClick={checkout} disabled={busy}>{busy ? "Redirection…" : "Continuer"}</PrimaryButton>
      </div>

      <div className="mt-2 flex shrink-0 items-center justify-center gap-3 pb-3 text-[11px]" style={{ color: C.muted }}>
        <a href="/conditions" className="underline">Conditions</a>
        <span>·</span>
        <a href="/confidentialite" className="underline">Confidentialité</a>
      </div>
    </div>
  );
}
