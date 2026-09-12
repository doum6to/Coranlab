"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { captureFunnelLead } from "@/actions/funnel-lead";
import { OnboardingMascot } from "@/components/onboarding/onboarding-mascot";
import { OpenInBrowserHint } from "@/components/open-in-browser-hint";
import { ttqTrack } from "@/lib/analytics/tiktok";
import type { CmStep, CommencerContent } from "@/lib/commencer-shared";

import { ProgressChart, TimeChart } from "./charts";
import { Paywall } from "./paywall";
import { AMIRI_CSS, AR_FONT, EMAIL_RE, Heading, Icon, IconBadge, OptionCard, P, PrimaryButton, RiveAnim, Shell, Stars, addDays, cascade, easeInOutCubic, fill, fmtShort, rich, useToday } from "./ui";

/* ------------------------------------------------------------------ */
/* Types & transitions                                                  */

type Nav = { kind: "fade" | "push" | "dissolve"; dir: 1 | -1 };
type Answers = Record<string, string[]>;
type TimeChoice = { minutes: number; weeks: number };
type Step<T extends CmStep["type"]> = Extract<CmStep, { type: T }>;

const NO_BAR: CmStep["type"][] = ["splash", "welcome", "loader", "lesson", "bell"];
const PUSHY: CmStep["type"][] = ["lesson", "bell"];
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

const GLOBAL_CSS = `${AMIRI_CSS}
@keyframes cm-ring{0%{transform:rotate(0)}8%{transform:rotate(30deg)}20%{transform:rotate(-25deg)}32%{transform:rotate(15deg)}44%{transform:rotate(-8deg)}56%{transform:rotate(3deg)}66%,100%{transform:rotate(0)}}
@keyframes cm-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
@keyframes cm-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
.cm-bell{transform-origin:50% 6%;animation:cm-ring 2.2s ease-in-out infinite}
.cm-bell-dot{transform-origin:center;transform-box:fill-box;animation:cm-pulse 2.2s ease-in-out infinite}
.cm-shake{animation:cm-shake .45s ease-in-out}
.cm-input::placeholder{color:#999}
@media (prefers-reduced-motion:reduce){.cm-bell,.cm-bell-dot,.cm-shake{animation:none}}
`;

/* ------------------------------------------------------------------ */
/* Main component                                                       */

export function CommencerOnboarding({ content, initialStep }: { content: CommencerContent; initialStep?: "paywall" }) {
  // The old "trial" mockup screen is superseded by the interactive lesson.
  const steps = useMemo(() => content.steps.filter((s) => s.type !== "trial"), [content.steps]);
  const total = steps.length + 1; // + paywall
  const reduce = useReducedMotion() ?? false;
  const today = useToday();

  const [index, setIndex] = useState(initialStep === "paywall" ? steps.length : 0);
  const [nav, setNav] = useState<Nav>({ kind: "fade", dir: 1 });
  const [answers, setAnswers] = useState<Answers>({});
  const [time, setTime] = useState<TimeChoice | null>(null);
  const [email, setEmail] = useState("");

  const indexRef = useRef(index);
  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { ttqTrack("ViewContent", { content_category: "commencer" }); }, []);

  const step: CmStep | null = index < steps.length ? steps[index] : null;
  const isPaywall = step === null;

  const move = useCallback((to: number) => {
    const from = indexRef.current;
    const target = Math.max(0, Math.min(total - 1, to));
    if (target === from) return;
    const fromStep = steps[from] ?? null;
    const toStep = steps[target] ?? null;
    const pushy = (s: CmStep | null) => s === null || PUSHY.includes(s.type);
    const kind: Nav["kind"] = fromStep?.type === "splash" ? "dissolve" : pushy(fromStep) && pushy(toStep) ? "push" : "fade";
    setNav({ kind, dir: target > from ? 1 : -1 });
    setIndex(target);
  }, [steps, total]);

  const go = useCallback(() => move(indexRef.current + 1), [move]);
  const back = useCallback(() => {
    let i = indexRef.current - 1;
    while (i > 0 && steps[i]?.type === "loader") i -= 1; // never replay the loader
    move(i);
  }, [move, steps]);

  const setAnswer = (id: string, values: string[]) => setAnswers((a) => ({ ...a, [id]: values }));

  /* Derived personalisation */
  const q = (id: string) => steps.find((s): s is Step<"question"> => s.type === "question" && s.id === id);
  const optionLabel = (id: string) => q(id)?.options.find((o) => o.id === answers[id]?.[0])?.label;
  const levelStep = q("level");
  const levelIdx = levelStep ? levelStep.options.findIndex((o) => o.id === answers.level?.[0]) : -1;
  const level = levelIdx >= 0 ? levelIdx + 1 : 1;
  const levelLabel = levelIdx >= 0 && levelStep ? levelStep.options[levelIdx].label : "Débutant";
  const whenLabel = (optionLabel("when") ?? "chaque jour").toLowerCase();
  const timeStep = steps.find((s): s is Step<"time"> => s.type === "time");
  const minutes = time?.minutes ?? timeStep?.options[0]?.minutes ?? 15;
  const goalDate = useMemo(() => (today && time ? addDays(today, time.weeks * 7) : null), [today, time]);
  const goalDateLabel = goalDate ? fmtShort(goalDate) : null;
  const splash = steps.find((s): s is Step<"splash"> => s.type === "splash");

  const onEmail = (value: string) => {
    setEmail(value);
    const focus = [`why:${(answers.why ?? []).join("|")}`, `when:${answers.when?.[0] ?? ""}`, `min:${minutes}`].join(";");
    void captureFunnelLead({ email: value, stage: "offer", focusChoice: focus, source: "commencer" }).catch(() => undefined);
    go();
  };

  const showBar = step !== null && !NO_BAR.includes(step.type);
  const showHeader = showBar || isPaywall;
  const dark = step?.type === "loader";
  const variants = useMemo(() => screenVariants(reduce), [reduce]);

  return (
    <div className="z-50 flex flex-col overflow-hidden font-sans" style={{ position: "fixed", inset: 0, background: dark ? P.purple : "#fff", color: P.text, transition: "background-color .4s ease" }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <OpenInBrowserHint accent={P.purple} />

      <div className="relative mx-auto flex h-full w-full max-w-md flex-col pt-[env(safe-area-inset-top)]">
        {/* Header: back chevron + animated progress bar (outside the screen transitions so the bar tweens) */}
        <motion.div className="shrink-0 overflow-hidden" initial={false} animate={{ height: showHeader ? 52 : 0, opacity: showHeader ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.25 }} aria-hidden={!showHeader}>
          <div className="flex h-[52px] items-center gap-3 px-4">
            <button type="button" onClick={back} aria-label="Retour" tabIndex={showHeader ? 0 : -1} className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full" style={{ color: P.muted }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            {showBar && (
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((index / (total - 1)) * 100)}>
                <motion.div className="h-full rounded-full" style={{ background: P.purple }} initial={false} animate={{ width: `${Math.max(2, (index / (total - 1)) * 100)}%` }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 18, mass: 0.8 }} />
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
                <Screen step={step} answers={answers} setAnswer={setAnswer} time={time} setTime={setTime} goalDateLabel={goalDateLabel} onNext={go} onEmail={onEmail} level={level} levelLabel={levelLabel} minutes={minutes} whenLabel={whenLabel} arabic={splash?.arabic ?? "قُرْآن"} />
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

function Screen(props: { step: CmStep; answers: Answers; setAnswer: (id: string, values: string[]) => void; time: TimeChoice | null; setTime: (t: TimeChoice) => void; goalDateLabel: string | null; onNext: () => void; onEmail: (email: string) => void; level: number; levelLabel: string; minutes: number; whenLabel: string; arabic: string }) {
  const { step, onNext } = props;
  switch (step.type) {
    case "splash": return <SplashScreen step={step} onDone={onNext} />;
    case "welcome": return <WelcomeScreen step={step} onNext={onNext} />;
    case "question": return <QuestionScreen step={step} selected={props.answers[step.id] ?? []} onChange={(v) => props.setAnswer(step.id, v)} onNext={onNext} />;
    case "chart": return <ChartScreen step={step} onNext={onNext} />;
    case "time": return <TimeScreen step={step} choice={props.time} onChoose={props.setTime} goalDateLabel={props.goalDateLabel} onNext={onNext} />;
    case "email": return <EmailScreen step={step} whenLabel={props.whenLabel} onSubmit={props.onEmail} onSkip={onNext} />;
    case "social": return <SocialScreen step={step} onNext={onNext} />;
    case "loader": return <LoaderScreen step={step} onDone={onNext} />;
    case "plan": return <PlanScreen step={step} minutes={props.minutes} whenLabel={props.whenLabel} goalDateLabel={props.goalDateLabel} level={props.level} levelLabel={props.levelLabel} arabic={props.arabic} onNext={onNext} />;
    case "lesson": return <LessonScreen step={step} onNext={onNext} />;
    case "bell": return <BellScreen step={step} onNext={onNext} />;
    default: return null;
  }
}

/* ------------------------------------------------------------------ */
/* Splash                                                               */

function SplashScreen({ step, onDone }: { step: Step<"splash">; onDone: () => void }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    const t = window.setTimeout(onDone, 2200);
    return () => window.clearTimeout(t);
  }, [onDone]);
  const d = (s: number) => (reduce ? { duration: 0 } : { delay: s, duration: 0.5, ease: EASE_OUT });
  return (
    <button type="button" onClick={onDone} className="flex h-full w-full flex-col items-center justify-center px-6 text-center" aria-label={`${step.brand} — ${step.tagline}`}>
      <motion.span className="block" lang="ar" dir="rtl" style={{ fontFamily: AR_FONT, fontSize: 96, color: P.purple, lineHeight: 1.6 }} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={d(0.1)}>
        {step.arabic}
      </motion.span>
      <span className="mt-5 flex items-center justify-center font-heading text-[22px] font-extrabold" style={{ letterSpacing: ".34em", paddingLeft: ".34em", color: P.text }} aria-hidden>
        {step.brand.split("").map((ch, i) => (
          <motion.span key={`${ch}-${i}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : { delay: 0.5 + i * 0.07, duration: 0.18 }}>{ch === " " ? " " : ch}</motion.span>
        ))}
      </span>
      <motion.span className="mt-2 block text-[11px] font-semibold uppercase tracking-[.28em]" style={{ color: P.muted }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={d(0.5 + step.brand.length * 0.07 + 0.2)} aria-hidden>
        {step.tagline}
      </motion.span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Welcome — Koji intro, compact (no dead space)                        */

function WelcomeScreen({ step, onNext }: { step: Step<"welcome">; onNext: () => void }) {
  const reduce = useReducedMotion();
  const d = (s: number) => (reduce ? { duration: 0 } : { delay: s, duration: 0.45, ease: EASE_OUT });
  return (
    <Shell
      center
      align="center"
      footer={
        <>
          <PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>
          {(step.signinText || step.signinCta) && (
            <p className="text-center text-[13px]" style={{ color: P.muted }}>
              {step.signinText} <a href="/auth/login" className="font-bold" style={{ color: P.purple }}>{step.signinCta}</a>
            </p>
          )}
        </>
      }
    >
      <motion.div className="h-52 w-52 sm:h-60 sm:w-60" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={d(0)}>
        <OnboardingMascot phase="intro" />
      </motion.div>
      <motion.p className="mt-2 font-heading text-[18px] font-bold" style={{ color: P.purple }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={d(0.2)}>
        {step.headline}
      </motion.p>
      <motion.h1 className="mt-3 max-w-[22rem] font-heading text-[34px] font-bold leading-[1.1] sm:text-[40px]" style={{ color: P.text }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={d(0.35)}>
        {rich(step.tagline)}
      </motion.h1>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Question — small Koji next to the title, "yup" on each pick          */

function QuestionScreen({ step, selected, onChange, onNext }: { step: Step<"question">; selected: string[]; onChange: (v: string[]) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const timer = useRef<number | null>(null);
  const [replay, setReplay] = useState(0);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const hasIcons = step.options.some((o) => o.icon);
  const pick = (id: string) => {
    setReplay((k) => k + 1);
    if (step.multi) {
      onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
      return;
    }
    onChange([id]);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(onNext, 260);
  };
  return (
    <Shell footer={<PrimaryButton onClick={onNext} disabled={selected.length === 0}>{step.cta ?? "Continuer"}</PrimaryButton>}>
      <div className="flex items-center gap-2">
        <div className="-ml-2 h-24 w-24 shrink-0 sm:h-28 sm:w-28"><OnboardingMascot phase="question" replayKey={replay} /></div>
        <div className="min-w-0 flex-1"><Heading sub={step.sub}>{rich(step.headline)}</Heading></div>
      </div>
      <motion.div className={`${hasIcons ? "mt-5" : "mt-8"} flex flex-col gap-2.5`} role={step.multi ? "group" : "radiogroup"} variants={reduce ? undefined : cascade.container} initial="hidden" animate="show">
        {step.options.map((o) => <OptionCard key={o.id} label={o.label} icon={o.icon} selected={selected.includes(o.id)} onClick={() => pick(o.id)} center={!hasIcons} multi={step.multi} />)}
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
      <div className="mt-6"><ProgressChart chartLabel={step.chartLabel} brandLabel={step.brandLabel} othersLabel={step.othersLabel} xStart={step.xStart} xEnd={step.xEnd} checkTitle={step.checkTitle} checklist={step.checklist} /></div>
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
      <div className="mt-5"><TimeChart goalLabel={step.goalLabel} aloneLabel={step.aloneLabel} xStart={step.xStart} xEnd={step.xEnd} weeks={choice?.weeks ?? null} dateLabel={goalDateLabel} /></div>
      <p className="mt-3 min-h-[44px] text-[15px] leading-snug" style={{ color: sentence ? P.text : P.muted }} aria-live="polite">{sentence ? rich(sentence) : step.placeholder}</p>
      <motion.div className="mt-4 grid grid-cols-2 gap-2.5" role="radiogroup" variants={reduce ? undefined : cascade.container} initial="hidden" animate="show">
        {step.options.map((o) => {
          const active = choice?.minutes === o.minutes && choice?.weeks === o.weeks;
          return (
            <motion.button key={`${o.minutes}-${o.label}`} type="button" role="radio" aria-checked={active} variants={reduce ? undefined : cascade.item} whileTap={reduce ? undefined : { scale: 0.975 }} onClick={() => onChoose({ minutes: o.minutes, weeks: o.weeks })}
              className="flex items-center justify-center gap-2 text-[17px] font-bold" style={{ minHeight: 60, borderRadius: 18, border: `2px solid ${active ? P.purple : P.border}`, background: active ? P.purpleSoft : "#fff", color: P.text, boxShadow: active ? `0 2px 0 0 ${P.purpleLine}` : "0 2px 0 0 #EFEFEF", transition: "background-color .15s, border-color .15s" }}>
              <Icon name="timer" size={18} className={active ? "text-[#6967FB]" : "text-[#999]"} />{o.label}
            </motion.button>
          );
        })}
      </motion.div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Email — asked AFTER the plan (to receive it), skip kept discreet     */

function EmailScreen({ step, whenLabel, onSubmit, onSkip }: { step: Step<"email">; whenLabel: string; onSubmit: (email: string) => void; onSkip: () => void }) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) { setInvalid(true); return; }
    onSubmit(v);
  };
  return (
    <form onSubmit={submit} className="flex h-full min-h-0 flex-col">
      <Shell center footer={
        <>
          <PrimaryButton type="submit" disabled={value.trim().length === 0}>{step.cta}</PrimaryButton>
          {step.note && <p className="text-center text-[12px]" style={{ color: P.muted }}>{step.note}</p>}
          {step.skip && <button type="button" onClick={onSkip} className="mx-auto py-1 text-[12px]" style={{ color: P.muted }}>{step.skip}</button>}
        </>
      }>
        <div className="text-center">
          <div className="mx-auto w-fit"><IconBadge name="mail" size={64} /></div>
          <h1 className="mt-6 font-heading text-[26px] font-bold leading-tight sm:text-[30px]">{rich(step.headline)}</h1>
          <p className="mt-3 text-[15px] leading-snug" style={{ color: P.muted }}>{fill(step.sub, { when: whenLabel })}</p>
        </div>
        <label className="mt-8 block">
          <span className="sr-only">Email</span>
          <input type="email" inputMode="email" autoComplete="email" enterKeyHint="go" value={value} onChange={(e) => { setValue(e.target.value); setInvalid(false); }} placeholder={step.placeholder} aria-invalid={invalid || undefined}
            className="cm-input w-full px-4 text-[17px] outline-none" style={{ height: 56, borderRadius: 16, background: "#fff", border: `2px solid ${invalid ? P.danger : P.border}`, color: P.text }} />
        </label>
        {invalid && <p className="mt-2 text-[13px]" style={{ color: P.danger }} role="alert">Adresse email invalide.</p>}
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
  const card = "rounded-2xl border-2 bg-white";
  return (
    <Shell footer={<PrimaryButton onClick={onNext} disabled={locked}>{step.cta ?? "Continuer"}</PrimaryButton>}>
      <Heading align="center">{rich(step.headline)}</Heading>
      <motion.div className={`${card} mt-6 px-5 py-5 text-center`} style={{ borderColor: P.border }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={d(0.05)}>
        <div className="flex items-center justify-center gap-3">
          <Icon name="sparkles" size={22} className="text-[#6967FB]" />
          <span className="font-heading text-[44px] font-extrabold leading-none" style={{ color: P.text }}>{step.rating}</span>
          <Icon name="sparkles" size={22} className="text-[#6967FB]" />
        </div>
        <div className="mt-2 flex justify-center"><Stars size={18} /></div>
        <p className="mt-2 text-[15px] font-semibold" style={{ color: P.text }}>{step.ratingSub}</p>
      </motion.div>
      {step.sub && <motion.p className="mt-5 text-center text-[15px]" style={{ color: P.soft }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={d(0.2)}>{step.sub}</motion.p>}
      <div className="mt-4 space-y-3">
        {step.reviews.map((r, i) => (
          <motion.article key={`${r.name}-${i}`} className={`${card} px-4 py-4`} style={{ borderColor: P.border }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={d(0.3 + i * 0.12)}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold tracking-wide text-white" style={{ background: P.purple }} aria-hidden>{r.initials}</span>
              <span className="flex-1 text-[15px] font-bold" style={{ color: P.text }}>{r.name}</span>
              <Stars size={12} />
            </div>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: P.soft }}>{r.text}</p>
          </motion.article>
        ))}
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Loader (full-screen purple block + Koji "loading")                   */

function LoaderScreen({ step, onDone }: { step: Step<"loader">; onDone: () => void }) {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let raf = 0;
    let done: number | null = null;
    if (reduce) {
      setPct(100);
      done = window.setTimeout(onDone, 800);
      return () => { if (done) window.clearTimeout(done); };
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
    return () => { cancelAnimationFrame(raf); if (done) window.clearTimeout(done); };
  }, [step.durationMs, onDone, reduce]);
  const captions = step.captions;
  const capIdx = captions.length === 0 ? -1 : Math.min(captions.length - 1, pct < 15 ? 0 : pct < 88 ? 1 : 2);
  const R = 88, C = 2 * Math.PI * R;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center text-white" style={{ background: P.purple }} role="status" aria-live="polite">
      <motion.div className="h-32 w-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.5 }}><RiveAnim src="/animations/loading.riv" /></motion.div>
      <motion.h1 className="mt-2 max-w-xs font-heading text-[26px] font-bold leading-tight sm:text-[30px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.5 }}>{rich(step.headline)}</motion.h1>
      <motion.div className="relative mt-8 h-[180px] w-[180px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.5, delay: 0.1 }}>
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="100" cy="100" r={R} fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="8" />
          <circle cx="100" cy="100" r={R} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-heading text-[46px] font-extrabold leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>{pct}%</div>
      </motion.div>
      <div className="mt-7 h-6 text-[16px] text-white/85">{capIdx >= 0 && <span key={capIdx}>{captions[capIdx]}</span>}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Plan ready                                                           */

function PlanScreen({ step, minutes, whenLabel, goalDateLabel, level, levelLabel, arabic, onNext }: { step: Step<"plan">; minutes: number; whenLabel: string; goalDateLabel: string | null; level: number; levelLabel: string; arabic: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  const w = (i: number) => (reduce ? { duration: 0 } : { delay: i * 0.25, duration: 0.5, ease: EASE_OUT });
  const vars = { min: minutes, when: whenLabel, level, levelLabel };
  return (
    <Shell footer={<PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={w(0)}>
        <Heading align="center">{rich(step.headline)}</Heading>
        <div className="mt-6 flex flex-col items-center">
          <div className="flex h-[150px] w-[150px] items-center justify-center rounded-full" style={{ background: P.purpleSoft }} aria-hidden>
            <span lang="ar" dir="rtl" style={{ fontFamily: AR_FONT, fontSize: 64, color: P.purple, lineHeight: 1.6 }}>{arabic}</span>
          </div>
          <p className="mt-5 font-heading text-[24px] font-bold">{step.journeyTitle}</p>
          <span className="mt-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold" style={{ background: P.purpleSoft, color: P.purple }}>{fill(step.levelPill, vars)}</span>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={w(1)}>
        <p className="mt-8 text-center text-[11px] font-bold uppercase tracking-[.18em]" style={{ color: P.muted }}>{step.yourPlanLabel}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat icon="timer" big={`${minutes} min`} small={step.minutesLabel} />
          <Stat icon="calendar-check" big={goalDateLabel ?? "…"} small={step.dateLabel} />
        </div>
        <div className="mt-4 divide-y rounded-2xl border-2 bg-white" style={{ borderColor: P.border }}>
          {step.rows.map((r) => (
            <div key={r.label} className="flex items-start gap-3 px-4 py-3.5" style={{ borderColor: P.border }}>
              <IconBadge name={r.icon} size={36} />
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-[.16em]" style={{ color: P.muted }}>{r.label}</span>
                <span className="mt-1 block text-[15px] font-semibold leading-snug" style={{ color: P.text }}>{fill(r.text, vars)}</span>
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
    <div className="flex items-center gap-3 rounded-2xl border-2 bg-white px-3.5 py-3" style={{ borderColor: P.border }}>
      <IconBadge name={icon} size={40} />
      <span className="min-w-0">
        <span className="block truncate font-heading text-[20px] font-bold">{big}</span>
        <span className="block text-[12px]" style={{ color: P.muted }}>{small}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive lesson — the learner really does 3 cards before paying   */

function LessonScreen({ step, onNext }: { step: Step<"lesson">; onNext: () => void }) {
  const reduce = useReducedMotion();
  const cards = step.cards;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [okReplay, setOkReplay] = useState(0);
  const [wrongKey, setWrongKey] = useState(0);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const done = i >= cards.length;
  const card = cards[i];
  const shuffled = useMemo(() => {
    if (!card) return [] as string[];
    const list = Array.from(new Set([...card.choices, card.fr]));
    // Deterministic order per card (no Math.random → no hydration drift).
    return list.sort((a, b) => ((a.charCodeAt(0) * 31 + a.length * 7) % 97) - ((b.charCodeAt(0) * 31 + b.length * 7) % 97));
  }, [card]);

  const choose = (c: string) => {
    if (picked !== null || !card) return;
    setPicked(c);
    const ok = c === card.fr;
    if (ok) setOkReplay((k) => k + 1); else setWrongKey((k) => k + 1);
    timer.current = window.setTimeout(() => { setPicked(null); setI((x) => x + 1); }, ok ? 800 : 1400);
  };

  if (done || !card) {
    return (
      <Shell center align="center" footer={<PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>}>
        <motion.div className="h-44 w-44" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}>
          <RiveAnim src="/animations/completed_lvl.riv" />
        </motion.div>
        <h1 className="mt-4 font-heading text-[28px] font-bold leading-tight sm:text-[32px]">{rich(step.doneHeadline)}</h1>
        {step.doneSub && <p className="mt-3 text-[15px]" style={{ color: P.muted }}>{step.doneSub}</p>}
      </Shell>
    );
  }

  const isRight = (c: string) => picked !== null && c === card.fr;
  const isWrong = (c: string) => picked !== null && c === picked && c !== card.fr;
  return (
    <Shell>
      <div className="flex items-center gap-2">
        <div className="-ml-2 h-20 w-20 shrink-0"><OnboardingMascot phase="question" replayKey={okReplay} /></div>
        <div className="min-w-0 flex-1"><Heading sub={step.sub}>{rich(step.headline)}</Heading></div>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-[.16em]" style={{ color: P.muted }}>
        <span>Mot {i + 1} / {cards.length}</span>
        <span className="flex gap-1.5" aria-hidden>{cards.map((_, k) => <span key={k} className="h-1.5 w-6 rounded-full" style={{ background: k < i ? P.purple : k === i ? P.purpleLine : P.border }} />)}</span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={i} className={`mt-4 rounded-3xl border-2 bg-white px-5 py-8 text-center ${picked && picked !== card.fr ? "cm-shake" : ""}`} style={{ borderColor: P.border, boxShadow: "0 2px 0 0 #EFEFEF" }} initial={{ opacity: 0, x: reduce ? 0 : 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduce ? 0 : -40 }} transition={{ duration: reduce ? 0 : 0.28, ease: EASE_OUT }} data-wrong={wrongKey}>
          <p className="text-[11px] font-bold uppercase tracking-[.18em]" style={{ color: P.muted }}>Que veut dire</p>
          <p lang="ar" dir="rtl" className="mt-2" style={{ fontFamily: AR_FONT, fontSize: 60, lineHeight: 2, color: P.text }}>{card.arabic}</p>
          <p className="mt-2 text-[15px] italic" style={{ color: P.muted }}>{card.translit}</p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 flex flex-col gap-2.5" role="group" aria-label="Réponses">
        {shuffled.map((c) => {
          const right = isRight(c), wrong = isWrong(c);
          return (
            <button key={c} type="button" onClick={() => choose(c)} disabled={picked !== null} className="flex items-center justify-between px-4 text-left text-[16px] font-semibold"
              style={{ minHeight: 58, borderRadius: 16, border: `2px solid ${right ? P.success : wrong ? P.danger : P.border}`, background: right ? P.successSoft : wrong ? "#FEF2F2" : "#fff", color: P.text, boxShadow: "0 2px 0 0 #EFEFEF", transition: "background-color .15s, border-color .15s" }}>
              <span>{c}</span>
              {right && <Icon name="check" size={20} className="text-[#22C55E]" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
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
        <svg width="170" height="186" viewBox="0 0 120 130" className="mx-auto">
          <g className="cm-bell">
            <circle cx="60" cy="10" r="5" fill={P.purple} />
            <path d="M60 14 C 40 14, 28 30, 28 52 V 80 L 16 96 H 104 L 92 80 V 52 C 92 30, 80 14, 60 14 Z" fill={P.purple} />
            <path d="M48 104 a12 12 0 0 0 24 0 z" fill={P.purpleDark} />
          </g>
          <circle className="cm-bell-dot" cx="98" cy="22" r="11" fill={P.danger} stroke="#fff" strokeWidth="3" />
        </svg>
      </motion.div>
      <motion.h1 className="mt-8 max-w-[20rem] font-heading text-[26px] font-bold leading-tight sm:text-[30px]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : { delay: 0.1, duration: 0.45, ease: EASE_OUT }}>
        {rich(step.headline)}
      </motion.h1>
    </Shell>
  );
}
