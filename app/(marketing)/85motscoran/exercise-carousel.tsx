import { Check, CheckCircle, Heart, Settings2, X } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────
 * iPhone frame + real-app screenshots of the lesson UI.
 * Faithful to app/lesson/** components (same colors, shadows, structure).
 * ──────────────────────────────────────────────────────────────────────── */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 w-[260px] sm:w-[280px]">
      {/* Outer phone shell */}
      <div className="relative rounded-[44px] bg-neutral-900 p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]">
        {/* Screen */}
        <div className="relative rounded-[32px] overflow-hidden bg-white h-[520px] flex flex-col">
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-20 rounded-full bg-neutral-900 z-20" />
          {/* Status bar */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-3 pb-1 text-[10px] font-semibold text-neutral-900">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-[1px] border border-neutral-900" />
            </span>
          </div>
          {/* App header : X + progress bar + hearts */}
          <div className="flex items-center gap-3 px-4 pt-3 pb-2">
            <X className="h-4 w-4 text-brilliant-muted shrink-0" />
            <div className="flex-1 h-2 rounded-full bg-[#E0E0E0] overflow-hidden">
              <div
                className="h-full bg-[#6967fb]"
                style={{ width: "48%" }}
              />
            </div>
            <div className="flex items-center gap-0.5 text-[11px] font-bold text-rose-500">
              <Heart className="h-3.5 w-3.5 fill-rose-500" />
              <span>4</span>
            </div>
          </div>
          {/* Screen content */}
          <div className="flex-1 flex flex-col px-4 pb-3 min-h-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── 1. QCM ─────────────────────────────────────────────────────────────
function QcmScreen() {
  return (
    <PhoneFrame>
      <p className="text-[11px] font-bold text-brilliant-muted text-center mt-3 mb-3">
        Sélectionne la bonne traduction
      </p>

      <div
        className="bg-white rounded-2xl border-2 border-[#E0E0E0] p-4 text-center mb-4"
        style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
      >
        <p className="font-arabic text-3xl text-brilliant-text" dir="rtl">
          رَحْمَة
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {[
          { n: 1, t: "Livre", state: "" },
          { n: 2, t: "Miséricorde", state: "selected" },
          { n: 3, t: "Lumière", state: "" },
          { n: 4, t: "Cœur", state: "" },
        ].map((o) => (
          <div
            key={o.n}
            className={`flex items-center gap-2.5 rounded-2xl border-2 px-3 h-10 ${
              o.state === "selected"
                ? "border-[#6967fb] bg-[#f0f0ff]"
                : "border-[#E0E0E0] bg-white"
            }`}
            style={
              o.state === "selected"
                ? undefined
                : { boxShadow: "0 4px 0 0 #D4D4D4" }
            }
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[10px] font-bold ${
                o.state === "selected"
                  ? "border-[#6967fb] text-[#6967fb]"
                  : "border-[#E0E0E0] text-brilliant-muted"
              }`}
            >
              {o.n}
            </span>
            <span className="text-xs font-semibold text-brilliant-text">
              {o.t}
            </span>
          </div>
        ))}
      </div>

      <VerifyButton />
    </PhoneFrame>
  );
}

// ── 2. Matching ────────────────────────────────────────────────────────
function MatchingScreen() {
  return (
    <PhoneFrame>
      <p className="text-[11px] font-bold text-brilliant-muted text-center mt-3 mb-3">
        Reliez les paires
      </p>

      <div className="grid grid-cols-2 gap-2 flex-1">
        <div className="flex flex-col gap-2">
          <p className="text-[9px] font-bold text-brilliant-muted uppercase text-center">
            Arabe
          </p>
          {[
            { w: "قَلْب", state: "matched" },
            { w: "نُور", state: "selected" },
            { w: "يَوْم", state: "" },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-2xl border-2 h-11 flex items-center justify-center ${
                item.state === "matched"
                  ? "border-brilliant-green/30 bg-brilliant-success opacity-60"
                  : item.state === "selected"
                    ? "border-[#6967fb] bg-[#f0f0ff]"
                    : "border-[#E0E0E0] bg-white"
              }`}
              style={
                item.state
                  ? undefined
                  : { boxShadow: "0 4px 0 0 #D4D4D4" }
              }
            >
              <span className="font-arabic text-xl text-brilliant-text" dir="rtl">
                {item.w}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[9px] font-bold text-brilliant-muted uppercase text-center">
            Français
          </p>
          {[
            { w: "Cœur", state: "matched" },
            { w: "Jour", state: "" },
            { w: "Lumière", state: "" },
          ].map((item, i) => (
            <div
              key={i}
              className={`rounded-2xl border-2 h-11 flex items-center justify-center px-2 ${
                item.state === "matched"
                  ? "border-brilliant-green/30 bg-brilliant-success opacity-60"
                  : "border-[#E0E0E0] bg-white"
              }`}
              style={
                item.state
                  ? undefined
                  : { boxShadow: "0 4px 0 0 #D4D4D4" }
              }
            >
              <span className="text-[11px] font-semibold text-brilliant-text text-center leading-tight">
                {item.w}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── 3. Flashcard (flipped back = French visible) ───────────────────────
function FlashcardScreen() {
  return (
    <PhoneFrame>
      <p className="text-[11px] font-bold text-brilliant-muted text-center mt-3 mb-3">
        Découvrez les mots (1/5)
      </p>

      <div className="flex-1 flex items-center justify-center pb-4">
        <div
          className="w-full aspect-[4/3] rounded-2xl bg-[#f0f0ff] border-2 border-[#6967fb]/30 flex items-center justify-center"
          style={{ boxShadow: "0 4px 0 0 #c8c7f0" }}
        >
          <p className="text-base font-bold text-[#6967fb]">Livre</p>
        </div>
      </div>
      <p className="text-center text-[10px] text-brilliant-muted mb-2">
        Tape pour retourner · <span className="font-arabic">كِتَاب</span>
      </p>

      <NextButton />
    </PhoneFrame>
  );
}

// ── 4. Correct answer screen (post-verify) ─────────────────────────────
function CorrectAnswerScreen() {
  return (
    <PhoneFrame>
      <p className="text-[11px] font-bold text-brilliant-muted text-center mt-3 mb-3">
        Que signifie ce mot ?
      </p>

      <div
        className="bg-white rounded-2xl border-2 border-[#E0E0E0] p-4 text-center mb-4"
        style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
      >
        <p className="font-arabic text-3xl text-brilliant-text" dir="rtl">
          نُور
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {[
          { n: 1, t: "Cœur", state: "" },
          { n: 2, t: "Lumière", state: "correct" },
          { n: 3, t: "Livre", state: "" },
          { n: 4, t: "Nuit", state: "" },
        ].map((o) => (
          <div
            key={o.n}
            className={`flex items-center gap-2.5 rounded-2xl border-2 px-3 h-10 ${
              o.state === "correct"
                ? "border-brilliant-green bg-brilliant-success"
                : "border-[#E0E0E0] bg-white opacity-40"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[10px] font-bold ${
                o.state === "correct"
                  ? "border-brilliant-green text-brilliant-green"
                  : "border-[#E0E0E0] text-brilliant-muted"
              }`}
            >
              {o.state === "correct" ? <Check className="h-3 w-3" /> : o.n}
            </span>
            <span
              className={`text-xs font-semibold ${
                o.state === "correct"
                  ? "text-brilliant-green"
                  : "text-brilliant-text"
              }`}
            >
              {o.t}
            </span>
          </div>
        ))}
      </div>

      {/* Success footer, as in the real app */}
      <div className="-mx-4 mt-3 px-4 pt-3 pb-2 bg-brilliant-success rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-brilliant-green" />
          <p className="text-xs font-bold text-brilliant-green">Bien joué !</p>
        </div>
        <div
          className="rounded-xl bg-[#6967fb] px-3 py-1.5 text-[10px] font-bold text-white uppercase"
          style={{ boxShadow: "0 3px 0 0 #4a48d4" }}
        >
          Suivant
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── 5. Streak / home screen (progression feel) ─────────────────────────
function StreakScreen() {
  return (
    <PhoneFrame>
      <div className="flex items-center justify-between mt-4 mb-4">
        <div>
          <p className="text-[10px] text-brilliant-muted">Bonjour,</p>
          <p className="text-sm font-bold font-heading text-brilliant-text">
            Koji 👋
          </p>
        </div>
        <Settings2 className="h-4 w-4 text-brilliant-muted" />
      </div>

      <div className="rounded-2xl border-2 border-b-4 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🔥</div>
          <div className="flex-1">
            <p className="text-[10px] uppercase font-bold text-orange-600">
              Streak
            </p>
            <p className="text-xl font-heading font-bold text-brilliant-text">
              12 jours
            </p>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-brilliant-muted">
          Ne rate pas aujourd&apos;hui !
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div
          className="rounded-xl border-2 border-[#E0E0E0] bg-white p-2.5 text-center"
          style={{ boxShadow: "0 3px 0 0 #D4D4D4" }}
        >
          <p className="text-[9px] text-brilliant-muted uppercase font-bold">
            XP total
          </p>
          <p className="text-base font-heading font-bold text-[#6967fb]">
            1 280
          </p>
        </div>
        <div
          className="rounded-xl border-2 border-[#E0E0E0] bg-white p-2.5 text-center"
          style={{ boxShadow: "0 3px 0 0 #D4D4D4" }}
        >
          <p className="text-[9px] text-brilliant-muted uppercase font-bold">
            Mots appris
          </p>
          <p className="text-base font-heading font-bold text-[#6967fb]">
            142
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {[
          { t: "Pronoms Démonstratifs", done: true },
          { t: "Verbes de l'Imparfait", active: true },
          { t: "Mots de la Prière", locked: true },
        ].map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border-2 px-3 py-2 flex items-center gap-2 ${
              item.active
                ? "border-[#6967fb] bg-[#f0f0ff]"
                : item.done
                  ? "border-brilliant-green/30 bg-brilliant-success"
                  : "border-[#E0E0E0] bg-white opacity-50"
            }`}
          >
            {item.done ? (
              <Check className="h-3.5 w-3.5 text-brilliant-green shrink-0" />
            ) : item.active ? (
              <div className="h-3.5 w-3.5 rounded-full bg-[#6967fb] shrink-0 animate-pulse" />
            ) : (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-[#E0E0E0] shrink-0" />
            )}
            <span
              className={`text-[11px] font-semibold ${
                item.active ? "text-[#6967fb]" : "text-brilliant-text"
              }`}
            >
              {item.t}
            </span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────
function VerifyButton() {
  return (
    <div className="-mx-4 mt-3 px-4 pt-3 border-t border-[#E0E0E0] flex justify-end">
      <div
        className="rounded-xl bg-[#6967fb] px-5 py-2 text-[11px] font-bold text-white uppercase"
        style={{ boxShadow: "0 3px 0 0 #4a48d4" }}
      >
        Vérifier
      </div>
    </div>
  );
}

function NextButton() {
  return (
    <div className="flex justify-center">
      <div
        className="w-full rounded-xl bg-[#6967fb] py-2.5 text-center text-[11px] font-bold text-white uppercase"
        style={{ boxShadow: "0 3px 0 0 #4a48d4" }}
      >
        Suivant
      </div>
    </div>
  );
}

// ── Marquee (infinite horizontal loop) ────────────────────────────────
const screens = [
  <QcmScreen key="qcm" />,
  <CorrectAnswerScreen key="correct" />,
  <MatchingScreen key="match" />,
  <FlashcardScreen key="flash" />,
  <StreakScreen key="streak" />,
];

export function ExerciseCarousel() {
  return (
    <div className="relative w-full overflow-hidden py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent" />

      <div className="flex w-max gap-5 sm:gap-8 marquee-track">
        {screens}
        {screens.map((p, i) => (
          <div key={`dup-${i}`}>{p}</div>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 55s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
