"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { captureFunnelLead } from "@/actions/funnel-lead";
import { OpenInBrowserHint } from "@/components/open-in-browser-hint";
import { ttqTrack } from "@/lib/analytics/tiktok";
import type { CmStep, CommencerContent } from "@/lib/commencer-shared";

import { ProgressChart, TimeChart } from "./charts";
import { Paywall } from "./paywall";
import { EMAIL_RE, Heading, OptionCard, PrimaryButton, Shell, Stars, addDays, cascade, easeInOutCubic, fill, fmtShort, rich, useToday } from "./ui";

/* ------------------------------------------------------------------ */
/* Types & transitions                                                  */

type Nav = { kind: "fade" | "push" | "dissolve"; dir: 1 | -1 };
type Answers = Record<string, string[]>;
type TimeChoice = { minutes: number; weeks: number };
type Step<T extends CmStep["type"]> = Extract<CmStep, { type: T }>;

const NO_BAR: CmStep["type"][] = ["splash", "welcome", "loader", "trial", "bell"];
const PUSHY: CmStep["type"][] = ["trial", "bell"];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_PUSH = [0.32, 0.72, 0, 1] as const;

function screenVariants(reduce: boolean) {
  const t = (n: Nav) =>
    reduce ? { duration: 0.15 } : n.kind === "push" ? { type: "tween" as const, ease: EASE_PUSH, duration: 0.45 } : n.kind === "dissolve" ? { duration: 0.7, ease: "easeInOut" as const } : { duration: 0.35, ease: EASE_OUT };
  return {
    enter: (n: Nav) => (n.kind === "push" && !reduce ? { x: n.dir > 0 ? "100%" : "-100%", y: 0, opacity: 1 } : n.kind === "dissolve" || reduce ? { x: 0, y: 0, opacity: 0 } : { x: 0, y: 18, opacity: 0 }),
    center: (n: Nav) => ({ x: 0, y: 0, opacity: 1, transition: t(n) }),
    exit: (n: Nav) => ({ ...(n.kind === "push" && !reduce ? { x: n.dir > 0 ? "-100%" : "100%", opacity: 1 } : n.kind === "dissolve" || reduce ? { opacity: 0 } : { y: -10, opacity: 0 }), transition: t(n) }),
  };
}

const GLOBAL_CSS = `
@keyframes cm-ring{0%{transform:rotate(0)}8%{transform:rotate(30deg)}20%{transform:rotate(-25deg)}32%{transform:rotate(15deg)}44%{transform:rotate(-8deg)}56%{transform:rotate(3deg)}66%,100%{transform:rotate(0)}}
@keyframes cm-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
.cm-bell{transform-origin:50% 6%;animation:cm-ring 2.2s ease-in-out infinite}
.cm-bell-dot{transform-origin:center;transform-box:fill-box;animation:cm-pulse 2.2s ease-in-out infinite}
.cm-input::placeholder{color:var(--muted)}
@media (prefers-reduced-motion:reduce){.cm-bell,.cm-bell-dot{animation:none}}
`;

/* ------------------------------------------------------------------ */
/* Main component                                                       */

export function CommencerOnboarding({ content, initialStep }: { content: CommencerContent; initialStep?: "paywall" }) {
  const steps = content.steps;
  const total = steps.length + 1; // + paywall
  const reduce = useReducedMotion() ?? false;
  const today = useToday();

  const [index, setIndex] = useState(initialStep === "paywall" ? steps.length : 0);
  const [nav, setNav] = useState<Nav>({ kind: "fade", dir: 1 });
  const [answers, setAnswers] = useState<Answers>({});
  const [time, setTime] = useState<TimeChoice | null>(null);
  const [email, setEmail] = useState("");

  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    ttqTrack("ViewContent", { content_category: "commencer" });
  }, []);

  const step: CmStep | null = index < steps.length ? steps[index] : null;
  const isPaywall = step === null;

  const move = useCallback(
    (to: number) => {
      const from = indexRef.current;
      const target = Math.max(0, Math.min(total - 1, to));
      if (target === from) return;
      const fromStep = steps[from] ?? null;
      const toStep = steps[target] ?? null;
      const pushy = (s: CmStep | null) => s === null || PUSHY.includes(s.type);
      const kind: Nav["kind"] = fromStep?.type === "splash" ? "dissolve" : pushy(fromStep) && pushy(toStep) ? "push" : "fade";
      setNav({ kind, dir: target > from ? 1 : -1 });
      setIndex(target);
    },
    [steps, total],
  );

  const go = useCallback(() => move(indexRef.current + 1), [move]);
  const back = useCallback(() => {
    let i = indexRef.current - 1;
    while (i > 0 && steps[i]?.type === "loader") i -= 1; // never replay the loader
    move(i);
  }, [move, steps]);

  const setAnswer = (id: string, values: string[]) => setAnswers((a) => ({ ...a, [id]: values }));

  const onEmail = (value: string) => {
    setEmail(value);
    // Best-effort lead capture — never blocks the flow.
    void captureFunnelLead({ email: value, stage: "offer", focusChoice: (answers.why ?? []).join(","), source: "commencer" }).catch(() => undefined);
    go();
  };

  /* Derived personalisation */
  const levelStep = useMemo(() => steps.find((s): s is Step<"question"> => s.type === "question" && s.id === "level"), [steps]);
  const levelIdx = levelStep ? levelStep.options.findIndex((o) => o.id === answers.level?.[0]) : -1;
  const level = levelIdx >= 0 ? levelIdx + 1 : 1;
  const levelLabel = levelIdx >= 0 && levelStep ? levelStep.options[levelIdx].label : "Débutant";
  const timeStep = useMemo(() => steps.find((s): s is Step<"time"> => s.type === "time"), [steps]);
  const minutes = time?.minutes ?? timeStep?.options[0]?.minutes ?? 15;
  const goalDate = useMemo(() => (today && time ? addDays(today, time.weeks * 7) : null), [today, time]);
  const goalDateLabel = goalDate ? fmtShort(goalDate) : null;
  const splash = steps.find((s): s is Step<"splash"> => s.type === "splash");
  const welcome = steps.find((s): s is Step<"welcome"> => s.type === "welcome");

  const showBar = step !== null && !NO_BAR.includes(step.type);
  const showHeader = showBar || isPaywall;
  const dark = step?.type === "loader";
  const variants = useMemo(() => screenVariants(reduce), [reduce]);

  return (
    <div
      className="da da-paper z-50 flex flex-col overflow-hidden"
      style={{ position: "fixed", inset: 0, background: dark ? "var(--espresso)" : "var(--paper)", transition: "background-color .4s ease" }}
    >
      <style>{GLOBAL_CSS}</style>
      <OpenInBrowserHint accent="#3A281F" />

      <div className="relative mx-auto flex h-full w-full max-w-md flex-col pt-[env(safe-area-inset-top)]">
        {/* Header: back chevron + animated progress bar (lives outside the screen transitions so the bar tweens) */}
        <motion.div className="shrink-0 overflow-hidden" initial={false} animate={{ height: showHeader ? 52 : 0, opacity: showHeader ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.25 }} aria-hidden={!showHeader}>
          <div className="flex h-[52px] items-center gap-3 px-4">
            <button type="button" onClick={back} aria-label="Retour" tabIndex={showHeader ? 0 : -1} className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full" style={{ color: "var(--espresso-soft)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            {showBar && (
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--line)" }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((index / (total - 1)) * 100)}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--pink-deep)" }}
                  initial={false}
                  animate={{ width: `${Math.max(2, (index / (total - 1)) * 100)}%` }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 18, mass: 0.8 }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Screens */}
        <div className="relative min-h-0 flex-1">
          <AnimatePresence custom={nav} initial={false}>
            <motion.div key={index} custom={nav} variants={variants} initial="enter" animate="center" exit="exit" className="absolute inset-0 flex flex-col">
              {isPaywall ? (
                <Paywall paywall={content.paywall} email={email} />
              ) : (
                <Screen
                  step={step}
                  answers={answers}
                  setAnswer={setAnswer}
                  time={time}
                  setTime={setTime}
                  goalDateLabel={goalDateLabel}
                  onNext={go}
                  onEmail={onEmail}
                  level={level}
                  levelLabel={levelLabel}
                  minutes={minutes}
                  arabic={splash?.arabic ?? "قُرْآن"}
                  chip={welcome?.cta ?? "Continuer"}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen router                                                        */

function Screen(props: {
  step: CmStep;
  answers: Answers;
  setAnswer: (id: string, values: string[]) => void;
  time: TimeChoice | null;
  setTime: (t: TimeChoice) => void;
  goalDateLabel: string | null;
  onNext: () => void;
  onEmail: (email: string) => void;
  level: number;
  levelLabel: string;
  minutes: number;
  arabic: string;
  chip: string;
}) {
  const { step, onNext } = props;
  switch (step.type) {
    case "splash":
      return <SplashScreen step={step} onDone={onNext} />;
    case "welcome":
      return <WelcomeScreen step={step} arabic={props.arabic} onNext={onNext} />;
    case "question":
      return <QuestionScreen step={step} selected={props.answers[step.id] ?? []} onChange={(v) => props.setAnswer(step.id, v)} onNext={onNext} />;
    case "chart":
      return <ChartScreen step={step} onNext={onNext} />;
    case "time":
      return <TimeScreen step={step} choice={props.time} onChoose={props.setTime} goalDateLabel={props.goalDateLabel} onNext={onNext} />;
    case "email":
      return <EmailScreen step={step} onSubmit={props.onEmail} onSkip={onNext} />;
    case "social":
      return <SocialScreen step={step} onNext={onNext} />;
    case "loader":
      return <LoaderScreen step={step} onDone={onNext} />;
    case "plan":
      return <PlanScreen step={step} minutes={props.minutes} goalDateLabel={props.goalDateLabel} level={props.level} levelLabel={props.levelLabel} arabic={props.arabic} onNext={onNext} />;
    case "trial":
      return <TrialScreen step={step} arabic={props.arabic} chip={props.chip} onNext={onNext} />;
    case "bell":
      return <BellScreen step={step} onNext={onNext} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Splash                                                               */

function SplashScreen({ step, onDone }: { step: Step<"splash">; onDone: () => void }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    const t = window.setTimeout(onDone, 2400);
    return () => window.clearTimeout(t);
  }, [onDone]);
  const d = (s: number) => (reduce ? { duration: 0 } : { delay: s, duration: 0.5, ease: EASE_OUT });
  return (
    <button type="button" onClick={onDone} className="flex h-full w-full flex-col items-center justify-center px-6 text-center" aria-label={`${step.brand} — ${step.tagline}`}>
      <motion.span className="da-ar block" style={{ fontSize: 140, color: "var(--espresso)", lineHeight: 0.8 }} lang="ar" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={d(0.1)}>
        {step.arabic}
      </motion.span>
      <span className="mt-6 flex items-center justify-center" style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 22, letterSpacing: ".42em", color: "var(--ink)", paddingLeft: ".42em" }} aria-hidden>
        {step.brand.split("").map((ch, i) => (
          <motion.span key={`${ch}-${i}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : { delay: 0.6 + i * 0.075, duration: 0.18 }}>
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        ))}
      </span>
      <motion.span className="da-label mt-3 block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={d(0.6 + step.brand.length * 0.075 + 0.2)} aria-hidden>
        {step.tagline}
      </motion.span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Welcome                                                              */

function WelcomeScreen({ step, arabic, onNext }: { step: Step<"welcome">; arabic: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  const d = (s: number) => (reduce ? { duration: 0 } : { delay: s, duration: 0.45, ease: EASE_OUT });
  return (
    <Shell
      footer={
        <>
          <PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>
          {(step.signinText || step.signinCta) && (
            <p className="text-center text-[13px]" style={{ color: "var(--muted)" }}>
              {step.signinText}{" "}
              <a href="/auth/login" className="font-semibold underline underline-offset-2" style={{ color: "var(--espresso)" }}>{step.signinCta}</a>
            </p>
          )}
        </>
      }
    >
      <div className="flex min-h-[70vh] flex-col">
        <motion.div className="mt-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={d(0)}>
          <span className="da-ar block" style={{ fontSize: 72, color: "var(--espresso)", lineHeight: 0.8 }} lang="ar">{arabic}</span>
          <p className="mt-3 text-[17px] font-medium" style={{ color: "var(--espresso-soft)", fontFamily: "var(--serif)" }}>{step.headline}</p>
        </motion.div>
        <motion.h1 className="da-h mt-auto pt-10 text-[44px] sm:text-[52px]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={d(0.25)}>
          {rich(step.tagline)}
        </motion.h1>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Question                                                             */

function QuestionScreen({ step, selected, onChange, onNext }: { step: Step<"question">; selected: string[]; onChange: (v: string[]) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);
  const hasIcons = step.options.some((o) => o.icon);
  const pick = (id: string) => {
    if (step.multi) {
      onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
      return;
    }
    onChange([id]);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(onNext, 220);
  };
  return (
    <Shell center={!hasIcons} footer={<PrimaryButton onClick={onNext} disabled={selected.length === 0}>{step.cta ?? "Continuer"}</PrimaryButton>}>
      <Heading sub={step.sub}>{rich(step.headline)}</Heading>
      <motion.div className={`${hasIcons ? "mt-6" : "mt-10"} flex flex-col gap-2.5`} role={step.multi ? "group" : "radiogroup"} variants={reduce ? undefined : cascade.container} initial="hidden" animate="show">
        {step.options.map((o) => (
          <OptionCard key={o.id} label={o.label} icon={o.icon} selected={selected.includes(o.id)} onClick={() => pick(o.id)} center={!hasIcons} multi={step.multi} />
        ))}
      </motion.div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Interlude chart                                                      */

function ChartScreen({ step, onNext }: { step: Step<"chart">; onNext: () => void }) {
  return (
    <Shell footer={<PrimaryButton onClick={onNext}>{step.cta ?? "Continuer"}</PrimaryButton>}>
      <Heading>{rich(step.headline)}</Heading>
      <div className="mt-6">
        <ProgressChart chartLabel={step.chartLabel} brandLabel={step.brandLabel} othersLabel={step.othersLabel} xStart={step.xStart} xEnd={step.xEnd} checkTitle={step.checkTitle} checklist={step.checklist} />
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Daily time + projection                                              */

function TimeScreen({ step, choice, onChoose, goalDateLabel, onNext }: { step: Step<"time">; choice: TimeChoice | null; onChoose: (t: TimeChoice) => void; goalDateLabel: string | null; onNext: () => void }) {
  const reduce = useReducedMotion();
  const sentence = choice ? fill(step.sentence, { min: choice.minutes, weeks: choice.weeks }) : null;
  return (
    <Shell footer={<PrimaryButton onClick={onNext} disabled={!choice}>{step.cta ?? "Continuer"}</PrimaryButton>}>
      <Heading>{rich(step.headline)}</Heading>
      <div className="mt-5">
        <TimeChart goalLabel={step.goalLabel} aloneLabel={step.aloneLabel} xStart={step.xStart} xEnd={step.xEnd} weeks={choice?.weeks ?? null} dateLabel={goalDateLabel} />
      </div>
      <p className="mt-3 min-h-[44px] text-[15px] leading-snug" style={{ color: sentence ? "var(--ink)" : "var(--muted)" }} aria-live="polite">
        {sentence ? rich(sentence) : step.placeholder}
      </p>
      <motion.div className="mt-4 grid grid-cols-2 gap-2.5" role="radiogroup" variants={reduce ? undefined : cascade.container} initial="hidden" animate="show">
        {step.options.map((o) => {
          const active = choice?.minutes === o.minutes && choice?.weeks === o.weeks;
          return (
            <motion.button
              key={`${o.minutes}-${o.label}`}
              type="button"
              role="radio"
              aria-checked={active}
              variants={reduce ? undefined : cascade.item}
              whileTap={reduce ? undefined : { scale: 0.975 }}
              onClick={() => onChoose({ minutes: o.minutes, weeks: o.weeks })}
              className="flex items-center justify-center text-[17px] font-semibold"
              style={{
                minHeight: 60,
                borderRadius: 18,
                border: `1px solid ${active ? "var(--espresso)" : "var(--line)"}`,
                background: active ? "var(--espresso)" : "#FBF8F2",
                color: active ? "var(--paper)" : "var(--ink)",
                transition: "background-color .15s, color .15s, border-color .15s",
              }}
            >
              {o.label}
            </motion.button>
          );
        })}
      </motion.div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Email (web adaptation of the notification permission)               */

function EmailScreen({ step, onSubmit, onSkip }: { step: Step<"email">; onSubmit: (email: string) => void; onSkip: () => void }) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) {
      setInvalid(true);
      return;
    }
    onSubmit(v);
  };
  return (
    <form onSubmit={submit} className="flex h-full min-h-0 flex-col">
      <Shell
        center
        footer={
          <>
            <PrimaryButton type="submit" disabled={value.trim().length === 0}>{step.cta}</PrimaryButton>
            {step.note && <p className="text-center text-[12px]" style={{ color: "var(--muted)" }}>{step.note}</p>}
            {step.skip && (
              <button type="button" onClick={onSkip} className="mx-auto py-1 text-[14px] font-medium underline underline-offset-2" style={{ color: "var(--espresso-soft)" }}>
                {step.skip}
              </button>
            )}
          </>
        }
      >
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-[28px]" style={{ background: "rgba(243,182,196,.45)" }} aria-hidden>🔔</span>
          <h1 className="da-h mt-6 text-[30px] sm:text-[34px]">{rich(step.headline)}</h1>
          <p className="mt-3 text-[15px] leading-snug" style={{ color: "var(--muted)" }}>{step.sub}</p>
        </div>
        <label className="mt-8 block">
          <span className="sr-only">Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            enterKeyHint="go"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setInvalid(false);
            }}
            placeholder={step.placeholder}
            aria-invalid={invalid || undefined}
            className="cm-input w-full px-4 text-[17px] outline-none"
            style={{
              height: 56,
              borderRadius: 16,
              background: "#FBF8F2",
              border: `1.5px solid ${invalid ? "#B3261E" : "var(--line)"}`,
              color: "var(--ink)",
              fontFamily: "var(--sans)",
            }}
          />
        </label>
        {invalid && <p className="mt-2 text-[13px]" style={{ color: "#B3261E" }} role="alert">Adresse email invalide.</p>}
      </Shell>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Social proof (CTA locked by a timer)                                 */

function SocialScreen({ step, onNext }: { step: Step<"social">; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [locked, setLocked] = useState(step.lockSeconds > 0);
  useEffect(() => {
    const t = window.setTimeout(() => setLocked(false), Math.max(0, step.lockSeconds) * 1000);
    return () => window.clearTimeout(t);
  }, [step.lockSeconds]);
  const d = (s: number) => (reduce ? { duration: 0 } : { delay: s, duration: 0.4, ease: EASE_OUT });
  return (
    <Shell footer={<PrimaryButton onClick={onNext} disabled={locked}>{step.cta ?? "Continuer"}</PrimaryButton>}>
      <Heading align="center">{rich(step.headline)}</Heading>

      <motion.div className="da-card mt-6 px-5 py-5 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={d(0.05)}>
        <div className="flex items-center justify-center gap-3">
          <span className="text-[22px]" style={{ color: "var(--pink-deep)" }} aria-hidden>✦</span>
          <span className="da-h text-[44px] leading-none" style={{ fontFamily: "var(--serif-alt)" }}>{step.rating}</span>
          <span className="text-[22px]" style={{ color: "var(--pink-deep)" }} aria-hidden>✦</span>
        </div>
        <div className="mt-2 flex justify-center"><Stars size={18} color="var(--espresso)" /></div>
        <p className="mt-2 text-[15px] font-semibold" style={{ color: "var(--ink)" }}>{step.ratingSub}</p>
      </motion.div>

      {step.sub && (
        <motion.p className="mt-5 text-center text-[15px]" style={{ color: "var(--espresso-soft)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={d(0.2)}>
          {step.sub}
        </motion.p>
      )}

      <div className="mt-4 space-y-3">
        {step.reviews.map((r, i) => (
          <motion.article key={`${r.name}-${i}`} className="da-card px-4 py-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={d(0.3 + i * 0.12)}>
            <div className="flex items-center gap-3">
              <span className="da-dot flex h-11 w-11 shrink-0 items-center justify-center text-[13px] font-semibold tracking-wide" aria-hidden>{r.initials}</span>
              <span className="flex-1 text-[15px] font-semibold" style={{ color: "var(--ink)" }}>{r.name}</span>
              <Stars size={12} />
            </div>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--espresso-soft)" }}>{r.text}</p>
          </motion.article>
        ))}
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Loader (full-screen espresso block)                                  */

function LoaderScreen({ step, onDone }: { step: Step<"loader">; onDone: () => void }) {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let raf = 0;
    let done: number | null = null;
    if (reduce) {
      setPct(100);
      done = window.setTimeout(onDone, 800);
      return () => {
        if (done) window.clearTimeout(done);
      };
    }
    const start = performance.now();
    const dur = Math.max(500, step.durationMs);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setPct(Math.round(easeInOutCubic(t) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else done = window.setTimeout(onDone, 800);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (done) window.clearTimeout(done);
    };
  }, [step.durationMs, onDone, reduce]);

  const captions = step.captions;
  const capIdx = captions.length === 0 ? -1 : Math.min(captions.length - 1, pct < 15 ? 0 : pct < 88 ? 1 : 2);
  const R = 88;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center" style={{ background: "var(--espresso)", color: "var(--paper)" }} role="status" aria-live="polite">
      <motion.h1 className="da-h max-w-xs text-[28px] sm:text-[32px]" style={{ color: "var(--paper)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.5 }}>
        {rich(step.headline)}
      </motion.h1>
      <motion.div className="relative mt-10 h-[200px] w-[200px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.5, delay: 0.1 }}>
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--paper)" strokeOpacity="0.2" strokeWidth="7" />
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--pink)" strokeWidth="7" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[50px] font-bold leading-none" style={{ fontFamily: "var(--serif-alt)", fontVariantNumeric: "tabular-nums" }}>
          {pct}%
        </div>
      </motion.div>
      <div className="mt-8 h-6 text-[16px]" style={{ color: "rgba(239,233,222,.85)" }}>
        {capIdx >= 0 && <span key={capIdx}>{captions[capIdx]}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Plan ready                                                           */

function PlanScreen({ step, minutes, goalDateLabel, level, levelLabel, arabic, onNext }: { step: Step<"plan">; minutes: number; goalDateLabel: string | null; level: number; levelLabel: string; arabic: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  const w = (i: number) => (reduce ? { duration: 0 } : { delay: i * 0.25, duration: 0.5, ease: EASE_OUT });
  return (
    <Shell footer={<PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={w(0)}>
        <Heading align="center">{rich(step.headline)}</Heading>
        <div className="mt-6 flex flex-col items-center">
          <div className="relative flex h-[170px] w-[170px] items-center justify-center rounded-full" style={{ background: "#FBF8F2", border: "1px solid var(--line)", boxShadow: "0 20px 40px -30px rgba(58,40,31,.6)" }} aria-hidden>
            <span className="absolute -left-1 top-6 h-5 w-5 rounded-full" style={{ background: "var(--pink)" }} />
            <span className="da-ar block" style={{ fontSize: 118, color: "var(--espresso)", lineHeight: 0.8, marginTop: 10 }} lang="ar">{arabic}</span>
          </div>
          <p className="da-h mt-5 text-[24px]">{step.journeyTitle}</p>
          <span className="mt-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold" style={{ background: "var(--pink)", color: "var(--ink)" }}>
            {fill(step.levelPill, { level, levelLabel })}
          </span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={w(1)}>
        <p className="da-label mt-8 text-center">{step.yourPlanLabel}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat icon="⏱" big={`${minutes} min`} small={step.minutesLabel} />
          <Stat icon="📅" big={goalDateLabel ?? "…"} small={step.dateLabel} />
        </div>
        <div className="da-card mt-4 divide-y" style={{ borderColor: "var(--line)" }}>
          {step.rows.map((r) => (
            <div key={r.label} className="flex items-start gap-3 px-4 py-3.5" style={{ borderColor: "var(--line)" }}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px]" style={{ background: "rgba(243,182,196,.45)" }} aria-hidden>{r.icon ?? "•"}</span>
              <span className="min-w-0">
                <span className="da-label block text-[10px]">{r.label}</span>
                <span className="mt-1 block text-[15px] font-medium leading-snug" style={{ color: "var(--ink)" }}>{fill(r.text, { min: minutes })}</span>
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </Shell>
  );
}

function Stat({ icon, big, small }: { icon: string; big: string; small: string }) {
  return (
    <div className="da-card flex items-center gap-3 px-3.5 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[17px]" style={{ background: "rgba(243,182,196,.45)" }} aria-hidden>{icon}</span>
      <span className="min-w-0">
        <span className="da-h block truncate text-[20px]" style={{ fontFamily: "var(--serif-alt)" }}>{big}</span>
        <span className="block text-[12px]" style={{ color: "var(--muted)" }}>{small}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trial pitch (phone mockup)                                           */

const DEMO_WORDS: { ar: string; fr: string }[] = [
  { ar: "ٱلْحَمْدُ", fr: "La louange" },
  { ar: "رَبِّ", fr: "Seigneur" },
  { ar: "ٱلرَّحِيمِ", fr: "Le Très Miséricordieux" },
];

function TrialScreen({ step, arabic, chip, onNext }: { step: Step<"trial">; arabic: string; chip: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  const shots = step.screenshots;
  const count = shots.length > 0 ? shots.length : DEMO_WORDS.length;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (count <= 1) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % count), 2500);
    return () => window.clearInterval(t);
  }, [count]);
  const d = (s: number) => (reduce ? { duration: 0 } : { delay: s, duration: 0.5, ease: EASE_OUT });
  const fade = reduce ? { duration: 0 } : { duration: 0.6, ease: "easeInOut" as const };

  return (
    <Shell center align="center" footer={<PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>}>
      <motion.h1 className="da-h text-[30px] sm:text-[34px]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={d(0)}>
        {rich(step.headline)}
      </motion.h1>

      <motion.div className="mt-7 w-full rounded-[28px] px-6 py-6" style={{ background: "var(--paper-deep)" }} initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={d(0.15)}>
        <div className="relative mx-auto" style={{ height: "min(46vh, 430px)", aspectRatio: "9 / 19", borderRadius: 44, background: "#1F1511", border: "8px solid #1F1511", boxShadow: "0 30px 60px -30px rgba(43,29,22,.7)" }} aria-hidden>
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 36, background: "var(--paper)" }}>
            <AnimatePresence initial={false}>
              {shots.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <motion.img key={shots[i]} src={shots[i]} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} />
              ) : (
                <motion.div key={i} className="absolute inset-0 flex flex-col px-3 pt-9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 flex-1 rounded-full" style={{ background: "var(--line)" }}>
                      <span className="block h-full rounded-full" style={{ width: `${30 + i * 25}%`, background: "var(--pink-deep)" }} />
                    </span>
                  </div>
                  <div className="da-card mt-4 flex flex-1 flex-col items-center justify-center px-3 py-4 text-center" style={{ maxHeight: "62%" }}>
                    <span className="da-label text-[9px]">0{i + 1}</span>
                    <span className="da-ar mt-2 block" style={{ fontSize: 64, color: "var(--espresso)", lineHeight: 0.8 }} lang="ar">{DEMO_WORDS[i]?.ar ?? arabic}</span>
                    <span className="mt-2 text-[13px] font-medium" style={{ color: "var(--ink)" }}>{DEMO_WORDS[i]?.fr ?? ""}</span>
                  </div>
                  <motion.span className="da-btn da-btn-pink mx-auto mt-4 px-5 py-2 text-[12px]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : { delay: 0.9, type: "spring", stiffness: 380, damping: 24 }}>
                    {chip}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="absolute left-1/2 top-2 h-5 w-16 -translate-x-1/2 rounded-full" style={{ background: "#1F1511" }} />
        </div>
      </motion.div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Bell reassurance                                                     */

function BellScreen({ step, onNext }: { step: Step<"bell">; onNext: () => void }) {
  const reduce = useReducedMotion();
  return (
    <Shell center align="center" footer={<PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={reduce ? { duration: 0 } : { delay: 0.2, type: "spring", stiffness: 300, damping: 22 }} aria-hidden>
        <svg width="180" height="196" viewBox="0 0 120 130" className="mx-auto">
          <g className="cm-bell">
            <circle cx="60" cy="10" r="5" fill="var(--espresso)" />
            <path d="M60 14 C 40 14, 28 30, 28 52 V 80 L 16 96 H 104 L 92 80 V 52 C 92 30, 80 14, 60 14 Z" fill="var(--espresso)" />
            <path d="M48 104 a12 12 0 0 0 24 0 z" fill="var(--espresso-soft)" />
          </g>
          <circle className="cm-bell-dot" cx="98" cy="22" r="11" fill="var(--pink-deep)" stroke="var(--paper)" strokeWidth="3" />
        </svg>
      </motion.div>
      <motion.h1 className="da-h mt-8 text-[30px] sm:text-[34px]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : { delay: 0.1, duration: 0.45, ease: EASE_OUT }}>
        {rich(step.headline)}
      </motion.h1>
    </Shell>
  );
}
