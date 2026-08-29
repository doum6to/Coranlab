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
    window.setTimeout(go, 220);
  };

  // Loading step auto-advances 0 → 100%.
  useEffect(() => {
    if (!step || step.type !== "loading") return;
    setPct(0);
    const started = Date.now();
    const id = window.setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - started) / 2400) * 100));
      setPct(p);
      if (p >= 100) {
        window.clearInterval(id);
        window.setTimeout(go, 400);
      }
    }, 40);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const bg = isPaywall || (step && step.type === "hero") ? C.cream : "#FFFFFF";

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto" style={{ background: bg, color: C.text }}>
      {showChrome && (
        <div className="shrink-0 flex items-center gap-3 px-4 pt-4 sm:px-6">
          <button onClick={back} aria-label="Retour" className="p-1 -ml-1 text-2xl leading-none" style={{ color: C.muted }}>
            ‹
          </button>
          <div className="h-2 flex-1 rounded-full" style={{ background: C.border }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(index / (total - 1)) * 100}%`, background: C.primary }} />
          </div>
        </div>
      )}

      <div className="flex-1 mx-auto flex w-full max-w-md flex-col px-6 pb-8">
        {isPaywall ? <Paywall paywall={content.paywall} /> : renderStep(step!)}
      </div>
    </div>
  );

  function renderStep(step: OnbStep) {
    switch (step.type) {
      case "hero":
        return (
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-6 py-10">
            <Img url={step.image} label={step.headline} ratio="aspect-[3/4]" />
            <h1 className="font-serif text-3xl sm:text-4xl leading-tight whitespace-pre-line">{step.headline}</h1>
            {step.sub && <p className="text-base" style={{ color: C.muted }}>{step.sub}</p>}
            <PrimaryButton onClick={go}>{step.cta ?? "Commencer"}</PrimaryButton>
          </div>
        );

      case "message":
        return (
          <CenteredStep>
            <Img url={step.image} label={step.headline} />
            <h1 className="font-serif text-3xl sm:text-4xl leading-tight whitespace-pre-line">{step.headline}</h1>
            {step.sub && <p className="text-base" style={{ color: C.muted }}>{step.sub}</p>}
            <FooterCTA onClick={go} label={step.cta ?? "Continuer"} />
          </CenteredStep>
        );

      case "comparison": {
        const cols = [step.left, step.right].filter(Boolean) as NonNullable<OnbStep["left"]>[];
        return (
          <CenteredStep>
            <h1 className="font-serif text-2xl sm:text-3xl leading-tight text-center">{step.headline}</h1>
            <div className="grid grid-cols-2 gap-3 w-full">
              {cols.map((col) => (
                <div key={col.title} className="rounded-2xl border-2 p-4" style={{ borderColor: col.good ? C.primary : C.border, background: col.good ? `${C.primary}0D` : "#FAFAFA" }}>
                  <p className="text-sm font-bold mb-3">{col.title}</p>
                  <ul className="space-y-2">
                    {col.items.map((it) => (
                      <li key={it} className="flex items-center gap-2 text-sm">
                        <span>{col.good ? "✅" : "⚠️"}</span>
                        <span style={{ color: col.good ? C.text : C.muted }}>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <FooterCTA onClick={go} />
          </CenteredStep>
        );
      }

      case "checklist":
        return (
          <CenteredStep>
            <h1 className="font-serif text-2xl sm:text-3xl leading-tight text-center">{step.headline}</h1>
            <ul className="w-full space-y-3">
              {(step.items ?? []).map((it) => (
                <li key={it} className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: C.border }}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-sm" style={{ background: C.primary }}>✓</span>
                  <span className="text-sm">{it}</span>
                </li>
              ))}
            </ul>
            <FooterCTA onClick={go} />
          </CenteredStep>
        );

      case "single":
        return (
          <div className="flex flex-1 flex-col justify-center gap-6 py-8">
            <Heading headline={step.headline} sub={step.sub} />
            <div className="space-y-3">
              {(step.options ?? []).map((opt) => {
                const active = single[index] === opt;
                return (
                  <button key={opt} onClick={() => pickSingle(opt)} className="w-full rounded-2xl border-2 px-5 py-4 text-left text-sm font-medium transition" style={{ borderColor: active ? C.primary : C.border, background: active ? `${C.primary}12` : "#fff" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "multi": {
        const selected = multi[index] ?? [];
        return (
          <div className="flex flex-1 flex-col justify-center gap-6 py-8">
            <Heading headline={step.headline} sub={step.sub} />
            <div className="space-y-3">
              {(step.options ?? []).map((opt) => {
                const active = selected.includes(opt);
                return (
                  <button key={opt} onClick={() => toggleMulti(opt)} className="flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-sm font-medium transition" style={{ borderColor: active ? C.primary : C.border, background: active ? `${C.primary}12` : "#fff" }}>
                    <span>{opt}</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white" style={{ background: active ? C.primary : "transparent", border: active ? "none" : `2px solid ${C.border}` }}>
                      {active ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
            <FooterCTA onClick={go} disabled={selected.length === 0} />
          </div>
        );
      }

      case "chart":
        return (
          <CenteredStep>
            <h1 className="font-serif text-2xl sm:text-3xl leading-tight text-center">{step.headline}</h1>
            <GrowthChart />
            {step.sub && <p className="text-center text-sm" style={{ color: C.muted }}>{step.sub}</p>}
            <FooterCTA onClick={go} />
          </CenteredStep>
        );

      case "reviews":
        return (
          <CenteredStep>
            <div className="text-lg" style={{ color: "#F5C842" }}>★★★★★</div>
            <h1 className="font-serif text-2xl sm:text-3xl leading-tight text-center">{step.headline}</h1>
            <div className="w-full space-y-3">
              {(step.reviews ?? []).map((r) => (
                <div key={r.name + r.text} className="rounded-2xl border px-4 py-3 text-left" style={{ borderColor: C.border }}>
                  <div className="text-sm" style={{ color: "#F5C842" }}>★★★★★</div>
                  <p className="mt-1 text-sm italic">« {r.text} »</p>
                  <p className="mt-1 text-xs font-semibold" style={{ color: C.muted }}>— {r.name}</p>
                </div>
              ))}
            </div>
            <FooterCTA onClick={go} />
          </CenteredStep>
        );

      case "loading":
        return (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <div className="relative h-28 w-28">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke={C.border} strokeWidth="8" />
                <circle cx="50" cy="50" r="44" fill="none" stroke={C.primary} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 276} 276`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold">{pct}%</div>
            </div>
            <h1 className="font-serif text-2xl leading-tight">{step.headline}</h1>
          </div>
        );

      case "stat":
        return (
          <CenteredStep>
            <div className="text-lg" style={{ color: "#F5C842" }}>★★★★★</div>
            <div className="font-serif text-5xl font-bold" style={{ color: C.primary }}>{step.big}</div>
            <h1 className="font-serif text-2xl leading-tight text-center">{step.headline}</h1>
            {step.sub && <p className="text-center text-sm" style={{ color: C.muted }}>{step.sub}</p>}
            <FooterCTA onClick={go} />
          </CenteredStep>
        );

      case "ready":
        return (
          <CenteredStep>
            <div className="flex h-24 w-24 items-center justify-center rounded-full text-5xl text-white" style={{ background: C.green }}>✓</div>
            <h1 className="font-serif text-3xl leading-tight text-center">{step.headline}</h1>
            {step.sub && <p className="text-center text-base" style={{ color: C.muted }}>{step.sub}</p>}
            <FooterCTA onClick={go} label={step.cta ?? "Voir mon offre"} />
          </CenteredStep>
        );

      default:
        return null;
    }
  }
}

/* ------------------------------------------------------------------ */

function Heading({ headline, sub }: { headline?: string; sub?: string }) {
  return (
    <div className="text-center">
      <h1 className="font-serif text-2xl sm:text-3xl leading-tight">{headline}</h1>
      {sub && <p className="mt-2 text-sm" style={{ color: C.muted }}>{sub}</p>}
    </div>
  );
}

function CenteredStep({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">{children}</div>;
}

/** Renders the image URL if set, otherwise a dashed placeholder (import later).
 *  `undefined` url means "this step has no image slot" → renders nothing. */
function Img({ url, label, ratio = "aspect-[4/3]" }: { url?: string; label?: string; ratio?: string }) {
  if (url === undefined) return null;
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={label ?? ""} className={`w-full ${ratio} rounded-3xl object-cover`} />;
  }
  return (
    <div className={`w-full ${ratio} rounded-3xl border-2 border-dashed flex items-center justify-center p-6`} style={{ borderColor: `${C.primary}55`, background: `${C.primary}0A` }}>
      <span className="text-center text-sm font-medium" style={{ color: C.primary }}>
        🖼️ Image
        <br />
        <span className="text-xs opacity-60">(à importer depuis l&apos;admin)</span>
      </span>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-full rounded-2xl py-4 text-base font-bold text-white transition active:scale-[0.98] disabled:opacity-40" style={{ background: C.primary, boxShadow: `0 6px 0 0 ${C.ink}40` }}>
      {children}
    </button>
  );
}

function FooterCTA({ onClick, label = "Continuer", disabled }: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <div className="w-full pt-2">
      <PrimaryButton onClick={onClick} disabled={disabled}>{label}</PrimaryButton>
    </div>
  );
}

function GrowthChart() {
  return (
    <svg viewBox="0 0 300 160" className="w-full">
      <defs>
        <linearGradient id="qc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.primary} stopOpacity="0.25" />
          <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M10 140 C 80 135, 130 90, 180 60 S 260 20, 290 15 L 290 150 L 10 150 Z" fill="url(#qc)" />
      <path d="M10 140 C 80 135, 130 90, 180 60 S 260 20, 290 15" fill="none" stroke={C.primary} strokeWidth="4" strokeLinecap="round" />
      {[["S1", 10], ["S2", 80], ["S3", 150], ["S4", 220], ["S5", 285]].map(([l, x]) => (
        <text key={l as string} x={x as number} y={158} fontSize="9" fill={C.muted} textAnchor="middle">{l as string}</text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Paywall — same structure as the reference, in EUROS                 */

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
    <div className="flex flex-1 flex-col py-8">
      <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] text-center whitespace-pre-line">{paywall.title}</h1>

      <div className="my-7">
        <Img url={paywall.image} label="Illustration" ratio="aspect-[4/3]" />
      </div>

      <ul className="space-y-3 px-1">
        {paywall.bullets.map((b) => (
          <li key={b} className="flex items-center gap-3 text-[15px]">
            <span style={{ color: C.primary }}>✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 space-y-3">
        {plans.map(({ id, cfg }) => {
          const active = selected === id;
          return (
            <button key={id} onClick={() => setSelected(id)} className="relative flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition" style={{ borderColor: active ? C.primary : C.border, background: active ? `${C.primary}10` : "#fff" }}>
              {cfg.popular && (
                <span className="absolute -top-3 right-4 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white" style={{ background: C.primary }}>
                  Le plus populaire
                </span>
              )}
              <div>
                <div className="text-base font-bold">{cfg.title}</div>
                {cfg.sub && <div className="text-xs" style={{ color: C.muted }}>{cfg.sub}</div>}
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold">{cfg.priceLabel}</div>
                <div className="text-xs" style={{ color: C.muted }}>{cfg.per}</div>
              </div>
            </button>
          );
        })}
      </div>

      {paywall.reassurance && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm" style={{ color: C.muted }}>
          <span style={{ color: C.text }}>✓</span> {paywall.reassurance}
        </div>
      )}

      {err && <p className="mt-3 text-center text-sm text-rose-500">{err}</p>}

      <div className="mt-4">
        <PrimaryButton onClick={checkout} disabled={busy}>{busy ? "Redirection…" : "Continuer"}</PrimaryButton>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3 text-[11px]" style={{ color: C.muted }}>
        <a href="/conditions" className="underline">Conditions</a>
        <span>·</span>
        <a href="/confidentialite" className="underline">Confidentialité</a>
      </div>
    </div>
  );
}
