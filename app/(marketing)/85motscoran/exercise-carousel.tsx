import { Check, X } from "lucide-react";

// ─── Mini previews of each exercise type ───────────────────────────────────
// These are static visual mocks inspired by the actual app, sized to fit a
// horizontal marquee carousel. They must NOT be interactive.

function QcmPreview() {
  return (
    <PreviewCard label="QCM · Traduction">
      <div className="rounded-xl bg-white px-4 py-3 text-center border border-brilliant-border">
        <p className="font-arabic text-3xl text-brilliant-text" dir="rtl">
          رَحْمَة
        </p>
      </div>
      <p className="mt-3 text-center text-[11px] uppercase font-bold text-brilliant-muted tracking-wide">
        Quelle est la traduction ?
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { n: 1, t: "Livre", state: "" },
          { n: 2, t: "Miséricorde", state: "ok" },
          { n: 3, t: "Lumière", state: "" },
          { n: 4, t: "Cœur", state: "" },
        ].map((o) => (
          <div
            key={o.n}
            className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-2 text-xs font-semibold ${
              o.state === "ok"
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-brilliant-border bg-white text-brilliant-text"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                o.state === "ok"
                  ? "bg-green-500 text-white"
                  : "bg-brilliant-border text-brilliant-muted"
              }`}
            >
              {o.state === "ok" ? <Check className="h-2.5 w-2.5" /> : o.n}
            </span>
            {o.t}
          </div>
        ))}
      </div>
    </PreviewCard>
  );
}

function FlashcardPreview() {
  return (
    <PreviewCard label="Flashcard · Vocabulaire">
      <div className="flex items-center justify-center">
        <div className="rounded-2xl border-2 border-b-4 border-[#6967fb] bg-gradient-to-br from-[#f5f5ff] to-white p-6 text-center w-full shadow-[0_4px_0_0_rgba(105,103,251,0.15)]">
          <p className="font-arabic text-5xl text-brilliant-text leading-tight" dir="rtl">
            كِتَاب
          </p>
          <p className="mt-3 text-xs text-brilliant-muted font-medium">
            Tape pour retourner
          </p>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-xs font-semibold text-[#6967fb]">Livre</p>
        <p className="mt-1 text-[10px] text-brilliant-muted">
          230 occurrences dans le Coran
        </p>
      </div>
    </PreviewCard>
  );
}

function MatchingPreview() {
  return (
    <PreviewCard label="Matching · Association">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-brilliant-muted tracking-wide text-center">
            Arabe
          </p>
          {[
            { w: "قَلْب", state: "ok" },
            { w: "نُور", state: "active" },
            { w: "يَوْم", state: "" },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-lg border-2 px-2.5 py-2 text-center ${
                item.state === "ok"
                  ? "border-green-400 bg-green-50"
                  : item.state === "active"
                    ? "border-[#6967fb] bg-[#6967fb]/5"
                    : "border-brilliant-border bg-white"
              }`}
            >
              <span className="font-arabic text-lg text-brilliant-text" dir="rtl">
                {item.w}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-brilliant-muted tracking-wide text-center">
            Français
          </p>
          {[
            { w: "Cœur", state: "ok" },
            { w: "Jour", state: "" },
            { w: "Lumière", state: "" },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-lg border-2 px-2.5 py-2 text-center text-xs font-semibold ${
                item.state === "ok"
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-brilliant-border bg-white text-brilliant-text"
              }`}
            >
              {item.w}
            </div>
          ))}
        </div>
      </div>
    </PreviewCard>
  );
}

function VraiFauxPreview() {
  return (
    <PreviewCard label="Vrai / Faux · Vérification">
      <div className="rounded-xl bg-white px-4 py-3 text-center border border-brilliant-border">
        <p className="font-arabic text-3xl text-brilliant-text" dir="rtl">
          سَمَاء
        </p>
      </div>
      <div className="mt-3 rounded-xl bg-[#6967fb]/5 px-4 py-2.5 text-center">
        <p className="text-[10px] uppercase font-bold text-brilliant-muted tracking-wide">
          Traduction proposée
        </p>
        <p className="text-sm font-semibold text-brilliant-text">
          = &laquo; Terre &raquo; ?
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border-2 border-green-200 bg-white px-2 py-2 text-center text-xs font-bold text-green-600">
          VRAI
        </div>
        <div className="rounded-lg border-2 border-red-400 bg-red-50 px-2 py-2 text-center text-xs font-bold text-red-600 flex items-center justify-center gap-1">
          <X className="h-3 w-3" />
          FAUX
        </div>
      </div>
    </PreviewCard>
  );
}

function AnagramPreview() {
  return (
    <PreviewCard label="Anagramme · Composition">
      <div className="rounded-xl bg-[#6967fb]/5 px-4 py-2.5 text-center">
        <p className="text-[10px] uppercase font-bold text-brilliant-muted tracking-wide">
          Compose le mot
        </p>
        <p className="text-sm font-semibold text-brilliant-text">Miséricorde</p>
      </div>
      <div className="mt-3 rounded-xl bg-white border-2 border-dashed border-brilliant-border px-3 py-3 min-h-[48px] flex items-center justify-center gap-1.5" dir="rtl">
        {["ر", "ح"].map((l, i) => (
          <span
            key={i}
            className="font-arabic text-xl text-brilliant-text bg-[#6967fb]/10 rounded-md px-2 py-0.5"
          >
            {l}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5" dir="rtl">
        {["ة", "م"].map((l, i) => (
          <span
            key={i}
            className="font-arabic text-xl text-brilliant-text bg-white border-2 border-brilliant-border border-b-4 rounded-md px-2.5 py-1"
          >
            {l}
          </span>
        ))}
      </div>
    </PreviewCard>
  );
}

function SpotErrorPreview() {
  return (
    <PreviewCard label="Trouve l'erreur">
      <p className="text-center text-[11px] uppercase font-bold text-brilliant-muted tracking-wide">
        Quel mot ne correspond pas ?
      </p>
      <div className="mt-3 rounded-xl bg-white border border-brilliant-border p-3 text-center" dir="rtl">
        <p className="font-arabic text-2xl text-brilliant-text leading-loose">
          الْحَمْدُ <span className="underline decoration-red-400 decoration-2 underline-offset-4">لَيْل</span> رَبِّ الْعَالَمِينَ
        </p>
      </div>
      <div className="mt-3 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-center">
        <p className="text-xs font-semibold text-red-600">
          &laquo; لَيْل &raquo; : ne colle pas au verset
        </p>
      </div>
    </PreviewCard>
  );
}

// ─── Shared wrapper ────────────────────────────────────────────────────────

function PreviewCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shrink-0 w-[260px] sm:w-[280px] rounded-3xl border-2 border-b-4 border-brilliant-border bg-brilliant-surface p-4 sm:p-5 shadow-[0_6px_20px_-12px_rgba(0,0,0,0.15)]">
      <div className="inline-block rounded-full bg-[#6967fb]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#6967fb] uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

// ─── Marquee (infinite horizontal loop) ────────────────────────────────────

const previews = [
  <QcmPreview key="qcm" />,
  <FlashcardPreview key="flash" />,
  <MatchingPreview key="match" />,
  <VraiFauxPreview key="vrai" />,
  <AnagramPreview key="ana" />,
  <SpotErrorPreview key="spot" />,
];

export function ExerciseCarousel() {
  return (
    <div className="relative w-full overflow-hidden py-2">
      {/* Fade masks on both edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent" />

      {/* Marquee track : width = 2x content, animated -50% for seamless loop */}
      <div className="flex w-max gap-4 sm:gap-6 marquee-track">
        {previews}
        {/* duplicate for seamless loop */}
        {previews.map((p, i) => (
          <div key={`dup-${i}`}>{p}</div>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 45s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
