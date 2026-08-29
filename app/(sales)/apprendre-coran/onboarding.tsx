"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Brand palette (adapted from GirlWalk's onboarding, in Quranlab colors) */
const C = {
  primary: "#6967FB", // brand indigo
  ink: "#2D1F4F", // deep violet (app icon bg)
  cream: "#FFF9F0",
  text: "#171326",
  muted: "#8A86A0",
  border: "#E9E5F7",
  green: "#22C55E",
};

/* ------------------------------------------------------------------ */
/* Step definitions — edit the content here.                           */
type Col = { title: string; items: string[]; good: boolean };

type Step =
  | { type: "hero"; headline: string; sub: string; image: string; cta: string }
  | { type: "message"; headline: string; sub?: string; image?: string; cta?: string }
  | { type: "comparison"; headline: string; left: Col; right: Col }
  | { type: "checklist"; headline: string; sub?: string; items: string[] }
  | { type: "single"; headline: string; sub?: string; options: string[] }
  | { type: "multi"; headline: string; sub?: string; options: string[] }
  | { type: "chart"; headline: string; sub?: string }
  | { type: "reviews"; headline: string; reviews: { name: string; text: string }[] }
  | { type: "loading"; headline: string }
  | { type: "stat"; headline: string; big: string; sub: string }
  | { type: "ready"; headline: string; sub: string }
  | { type: "paywall" };

const STEPS: Step[] = [
  {
    type: "hero",
    headline: "Comprends le Coran,\ncomme tu l'as toujours voulu.",
    sub: "5 minutes par jour. Mot à mot.",
    image: "Personne lisant le Coran, lumière douce",
    cta: "Commencer",
  },
  {
    type: "message",
    headline: "Pas d'arabe scolaire.\nPas de découragement.",
    sub: "Une méthode douce, pensée pour durer.",
  },
  {
    type: "message",
    headline: "Dis adieu au « je lis sans rien comprendre »",
    image: "Avant / après : lire vs comprendre",
  },
  {
    type: "comparison",
    headline: "En faire plus n'est pas toujours mieux",
    left: { title: "Tout mémoriser d'un coup", good: false, items: ["Surcharge", "Découragement", "Vite oublié"] },
    right: { title: "Un peu chaque jour", good: true, items: ["Léger", "Motivant", "Ancré durablement"] },
  },
  {
    type: "message",
    headline: "La régularité bat l'intensité",
    sub: "Quelques mots par jour valent mieux qu'une heure une fois par mois.",
  },
  {
    type: "message",
    headline: "La bonne nouvelle :\n5 minutes suffisent",
    sub: "Des leçons courtes, au bon moment, pour ne rien oublier.",
    image: "Illustration : leçon de 5 minutes",
  },
  {
    type: "message",
    headline: "La clé, c'est la compréhension —\nmot à mot",
    sub: "Reconnais les mots les plus fréquents du Coran, un par un.",
  },
  {
    type: "checklist",
    headline: "Avec Quranlab, des résultats concrets",
    items: [
      "Comprendre des mots dans ta prière",
      "Reconnaître le vocabulaire fréquent",
      "Progresser sans te décourager",
      "Garder l'habitude, jour après jour",
    ],
  },
  {
    type: "multi",
    headline: "Quel est ton objectif ?",
    sub: "Choisis ce qui te parle (plusieurs possibles)",
    options: [
      "Comprendre ma prière 🤲",
      "Lire l'arabe",
      "Mémoriser du vocabulaire",
      "Me rapprocher d'Allah",
      "Comprendre le Coran en entier",
      "Aider mes enfants",
    ],
  },
  {
    type: "single",
    headline: "Sois honnête — où en es-tu ?",
    options: [
      "Je débute totalement",
      "Je connais l'alphabet",
      "Je lis mais ne comprends pas",
      "Je comprends déjà quelques mots",
    ],
  },
  {
    type: "single",
    headline: "Ton objectif quotidien",
    sub: "Combien de mots par jour ?",
    options: ["5 mots — tranquille", "10 mots — équilibré ⭐", "15 mots — motivé", "20 mots — intensif"],
  },
  {
    type: "multi",
    headline: "Qu'est-ce qui te freine ?",
    options: [
      "Le manque de temps",
      "Je ne sais pas par où commencer",
      "J'ai déjà essayé et abandonné",
      "L'arabe me paraît difficile",
      "Je me décourage vite",
    ],
  },
  {
    type: "message",
    headline: "Tu es déjà sur le bon chemin",
    sub: "Le simple fait d'être ici montre ta sincérité. Allahumma barik.",
    image: "Illustration encourageante",
  },
  {
    type: "multi",
    headline: "Qu'est-ce qui te motive ?",
    options: [
      "Mieux vivre ma prière",
      "Me sentir plus proche d'Allah",
      "Progresser un peu chaque jour",
      "Comprendre ce que je récite",
      "Transmettre à ma famille",
    ],
  },
  {
    type: "chart",
    headline: "Plus tu apprends, plus tu comprends",
    sub: "Ta compréhension grimpe, semaine après semaine.",
  },
  {
    type: "reviews",
    headline: "Le choix des apprenants",
    reviews: [
      { name: "Omar", text: "En 3 jours je reconnais plein de mots dans ma prière. Allahumma barik." },
      { name: "Nayah", text: "La façon la plus simple d'enfin comprendre. Barak Allah fikoum." },
      { name: "Yusuf", text: "5 minutes par jour, et ça reste. Incroyable." },
    ],
  },
  {
    type: "message",
    headline: "Des rappels doux,\njamais culpabilisants",
    sub: "On t'accompagne pour garder l'habitude, à ton rythme.",
    image: "Illustration : rappel quotidien",
  },
  { type: "loading", headline: "On construit ton plan personnalisé…" },
  {
    type: "stat",
    headline: "Rejoint par des milliers de musulmans",
    big: "100 000+",
    sub: "apprenants qui comprennent enfin le Coran",
  },
  {
    type: "ready",
    headline: "Ton plan Quranlab est prêt",
    sub: "Construit à partir de tes réponses. Fait pour toi, in shâ Allah.",
  },
  { type: "paywall" },
];

/* ------------------------------------------------------------------ */

export function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [multi, setMulti] = useState<Record<number, string[]>>({});
  const [single, setSingle] = useState<Record<number, string>>({});

  const step = STEPS[index];
  const total = STEPS.length;
  const isFirst = index === 0;
  const isPaywall = step.type === "paywall";
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

  // Loading step auto-advances.
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (step.type !== "loading") return;
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
  }, [index, step.type]);

  const bg = isPaywall || step.type === "hero" ? C.cream : "#FFFFFF";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: bg, color: C.text }}
    >
      {/* Progress chrome */}
      {showChrome && (
        <div className="shrink-0 flex items-center gap-3 px-4 pt-4 sm:px-6">
          <button onClick={back} aria-label="Retour" className="p-1 -ml-1 text-2xl leading-none" style={{ color: C.muted }}>
            ‹
          </button>
          <div className="h-2 flex-1 rounded-full" style={{ background: C.border }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(index / (total - 1)) * 100}%`, background: C.primary }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 mx-auto flex w-full max-w-md flex-col px-6 pb-8">
        {renderStep()}
      </div>
    </div>
  );

  function renderStep() {
    switch (step.type) {
      case "hero":
        return (
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-6 py-10">
            <ImagePlaceholder label={step.image} ratio="aspect-[3/4]" />
            <h1 className="font-serif text-3xl sm:text-4xl leading-tight whitespace-pre-line">{step.headline}</h1>
            <p className="text-base" style={{ color: C.muted }}>{step.sub}</p>
            <PrimaryButton onClick={go}>{step.cta}</PrimaryButton>
          </div>
        );

      case "message":
        return (
          <CenteredStep>
            {step.image && <ImagePlaceholder label={step.image} />}
            <h1 className="font-serif text-3xl sm:text-4xl leading-tight whitespace-pre-line">{step.headline}</h1>
            {step.sub && <p className="text-base" style={{ color: C.muted }}>{step.sub}</p>}
            <FooterCTA onClick={go} label={step.cta ?? "Continuer"} />
          </CenteredStep>
        );

      case "comparison":
        return (
          <CenteredStep>
            <h1 className="font-serif text-2xl sm:text-3xl leading-tight text-center">{step.headline}</h1>
            <div className="grid grid-cols-2 gap-3 w-full">
              {[step.left, step.right].map((col) => (
                <div
                  key={col.title}
                  className="rounded-2xl border-2 p-4"
                  style={{
                    borderColor: col.good ? C.primary : C.border,
                    background: col.good ? `${C.primary}0D` : "#FAFAFA",
                  }}
                >
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

      case "checklist":
        return (
          <CenteredStep>
            <h1 className="font-serif text-2xl sm:text-3xl leading-tight text-center">{step.headline}</h1>
            <ul className="w-full space-y-3">
              {step.items.map((it) => (
                <li key={it} className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: C.border }}>
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-sm"
                    style={{ background: C.primary }}
                  >
                    ✓
                  </span>
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
            <div className="text-center">
              <h1 className="font-serif text-2xl sm:text-3xl leading-tight">{step.headline}</h1>
              {step.sub && <p className="mt-2 text-sm" style={{ color: C.muted }}>{step.sub}</p>}
            </div>
            <div className="space-y-3">
              {step.options.map((opt) => {
                const active = single[index] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => pickSingle(opt)}
                    className="w-full rounded-2xl border-2 px-5 py-4 text-left text-sm font-medium transition"
                    style={{
                      borderColor: active ? C.primary : C.border,
                      background: active ? `${C.primary}12` : "#fff",
                    }}
                  >
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
            <div className="text-center">
              <h1 className="font-serif text-2xl sm:text-3xl leading-tight">{step.headline}</h1>
              {step.sub && <p className="mt-2 text-sm" style={{ color: C.muted }}>{step.sub}</p>}
            </div>
            <div className="space-y-3">
              {step.options.map((opt) => {
                const active = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleMulti(opt)}
                    className="flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-sm font-medium transition"
                    style={{
                      borderColor: active ? C.primary : C.border,
                      background: active ? `${C.primary}12` : "#fff",
                    }}
                  >
                    <span>{opt}</span>
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                      style={{ background: active ? C.primary : "transparent", border: active ? "none" : `2px solid ${C.border}` }}
                    >
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
            <div className="flex items-center justify-center gap-1 text-lg" style={{ color: "#F5C842" }}>
              {"★★★★★"}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl leading-tight text-center">{step.headline}</h1>
            <div className="w-full space-y-3">
              {step.reviews.map((r) => (
                <div key={r.name} className="rounded-2xl border px-4 py-3" style={{ borderColor: C.border }}>
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
                <circle
                  cx="50" cy="50" r="44" fill="none" stroke={C.primary} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 276} 276`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold">{pct}%</div>
            </div>
            <h1 className="font-serif text-2xl leading-tight">{step.headline}</h1>
          </div>
        );

      case "stat":
        return (
          <CenteredStep>
            <div className="flex justify-center gap-1 text-lg" style={{ color: "#F5C842" }}>★★★★★</div>
            <div className="font-serif text-5xl font-bold" style={{ color: C.primary }}>{step.big}</div>
            <h1 className="font-serif text-2xl leading-tight text-center">{step.headline}</h1>
            <p className="text-center text-sm" style={{ color: C.muted }}>{step.sub}</p>
            <FooterCTA onClick={go} />
          </CenteredStep>
        );

      case "ready":
        return (
          <CenteredStep>
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-5xl text-white"
              style={{ background: C.green }}
            >
              ✓
            </div>
            <h1 className="font-serif text-3xl leading-tight text-center">{step.headline}</h1>
            <p className="text-center text-base" style={{ color: C.muted }}>{step.sub}</p>
            <FooterCTA onClick={go} label="Voir mon offre" />
          </CenteredStep>
        );

      case "paywall":
        return <Paywall onContinue={() => router.push("/auth/signup")} />;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */

function CenteredStep({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">{children}</div>;
}

function ImagePlaceholder({ label, ratio = "aspect-[4/3]" }: { label: string; ratio?: string }) {
  return (
    <div
      className={`w-full ${ratio} rounded-3xl border-2 border-dashed flex items-center justify-center p-6`}
      style={{ borderColor: `${C.primary}55`, background: `${C.primary}0A` }}
    >
      <span className="text-center text-sm font-medium" style={{ color: `${C.primary}` }}>
        🖼️ {label}
        <br />
        <span className="text-xs opacity-60">(image à importer)</span>
      </span>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl py-4 text-base font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
      style={{ background: C.primary, boxShadow: `0 6px 0 0 ${C.ink}40` }}
    >
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
        <text key={l as string} x={x as number} y={158} fontSize="9" fill={C.muted} textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Paywall — same structure as the reference, in EUROS                 */

const PLANS = [
  { id: "weekly", title: "Accès hebdo", price: "8,99€", per: "par semaine", sub: undefined as string | undefined, popular: false },
  { id: "annual", title: "Accès annuel", price: "1,73€", per: "par semaine", sub: "Facturé 89,99€ par an", popular: true },
];

function Paywall({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState("annual");

  return (
    <div className="flex flex-1 flex-col py-8">
      <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] text-center">
        Comprends le Coran,
        <br />
        sans limite
      </h1>

      <div className="my-7">
        <ImagePlaceholder label="Avant / après : lire vs comprendre" ratio="aspect-[4/3]" />
      </div>

      <ul className="space-y-3 px-1">
        {["Comprends chaque mot de ta prière", "Progresse un peu chaque jour, sans pression"].map((b) => (
          <li key={b} className="flex items-center gap-3 text-[15px]">
            <span style={{ color: C.primary }}>✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 space-y-3">
        {PLANS.map((p) => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className="relative flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition"
              style={{ borderColor: active ? C.primary : C.border, background: active ? `${C.primary}10` : "#fff" }}
            >
              {p.popular && (
                <span
                  className="absolute -top-3 right-4 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white"
                  style={{ background: C.primary }}
                >
                  Le plus populaire
                </span>
              )}
              <div>
                <div className="text-base font-bold">{p.title}</div>
                {p.sub && <div className="text-xs" style={{ color: C.muted }}>{p.sub}</div>}
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold">{p.price}</div>
                <div className="text-xs" style={{ color: C.muted }}>{p.per}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm" style={{ color: C.muted }}>
        <span style={{ color: C.text }}>✓</span> Sans engagement, annulable à tout moment
      </div>

      <div className="mt-4">
        <PrimaryButton onClick={onContinue}>Continuer</PrimaryButton>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3 text-[11px]" style={{ color: C.muted }}>
        <a href="/conditions" className="underline">Conditions</a>
        <span>·</span>
        <a href="/confidentialite" className="underline">Confidentialité</a>
      </div>
    </div>
  );
}
