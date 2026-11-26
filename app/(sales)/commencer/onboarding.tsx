"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { preload } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { captureFunnelLead } from "@/actions/funnel-lead";
import { OnboardingMascot } from "@/components/onboarding/onboarding-mascot";
import { OpenInBrowserHint } from "@/components/open-in-browser-hint";
import { ttqTrack } from "@/lib/analytics/tiktok";
import { track } from "@/lib/analytics/track";
import type { CmStep, CommencerContent } from "@/lib/commencer-shared";
import type { PaywallCurrency } from "@/lib/geo-currency";

import { findInFatiha } from "@/lib/fatiha";
import { SpeakButton } from "@/components/word-audio";

import { ProgressChart, TimeChart } from "./charts";
import { ConfettiBurst, CountUp, FxMuteButton, RewardBurst, SplashEyes, StreakFlame, fx } from "./fx";
import { Paywall } from "./paywall";
import { AMIRI_CSS, AR_FONT, Bubble, CM_UI, EMAIL_RE, Heading, Icon, KOJI_CROP, KojiSays, OptionCard, P, PEDESTAL_CROP, PrimaryButton, RiveAnim, Shell, Stars, addDays, cascade, easeInOutCubic, fill, fmtShort, rich, useToday, type CmLocale, type CmUi } from "./ui";

/* ------------------------------------------------------------------ */
/* Types & transitions                                                  */

type Nav = { kind: "fade" | "push" | "dissolve"; dir: 1 | -1 };
type Answers = Record<string, string[]>;
type TimeChoice = { minutes: number; weeks: number };
type Step<T extends CmStep["type"]> = Extract<CmStep, { type: T }>;
export type Earned = { xp: number; words: number };

const NO_BAR: CmStep["type"][] = ["splash", "welcome", "loader", "lesson", "bell"];
const PUSHY: CmStep["type"][] = ["bell"];
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_PUSH = [0.32, 0.72, 0, 1] as const;

function screenVariants(reduce: boolean) {
  const t = (n: Nav) =>
    reduce ? { duration: 0.15 } : n.kind === "push" ? { type: "tween" as const, ease: EASE_PUSH, duration: 0.45 } : n.kind === "dissolve" ? { duration: 0.22, ease: "easeOut" as const } : { duration: 0.35, ease: EASE_OUT };
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
@keyframes cm-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}
.cm-pop{animation:cm-pop .4s cubic-bezier(.22,1,.36,1) both}
.cm-input::placeholder{color:#999}
@media (prefers-reduced-motion:reduce){.cm-bell,.cm-bell-dot,.cm-shake,.cm-pop{animation:none}}
`;

/* ------------------------------------------------------------------ */
/* Main component                                                       */

export function CommencerOnboarding({ content, initialStep, locale = "fr", currency = "EUR" }: { content: CommencerContent; initialStep?: string; locale?: CmLocale; currency?: PaywallCurrency }) {
  const ui = CM_UI[locale];
  // The Qur'anic font is fetched up front: the first Arabic word only appears a dozen screens in,
  // and it should not flash in a fallback face at that moment.
  preload("/fonts/amiri-arabic-400-normal.woff2", { as: "font", crossOrigin: "anonymous" });
  // The splash animation is the very first thing shown: fetched as early as possible.
  preload("/animations/splash_eyes.riv", { as: "fetch", crossOrigin: "anonymous" });
  // The old "trial" mockup screen is superseded by the interactive lesson.
  // The "bell" (trial reminder) screen is gone with the free trial.
  const steps = useMemo(() => content.steps.filter((s) => s.type !== "trial" && s.type !== "bell"), [content.steps]);
  const total = steps.length + 1; // + paywall
  const reduce = useReducedMotion() ?? false;
  const today = useToday();

  const [index, setIndex] = useState(() => {
    if (!initialStep) return 0;
    if (initialStep === "paywall") return steps.length;
    if (/^\d+$/.test(initialStep)) return Math.min(steps.length, Number(initialStep));
    const at = steps.findIndex((s) => s.type === initialStep || (s.type === "question" && `q_${s.id}` === initialStep));
    return at >= 0 ? at : 0;
  });
  const [nav, setNav] = useState<Nav>({ kind: "fade", dir: 1 });
  const [answers, setAnswers] = useState<Answers>({});
  const [time, setTime] = useState<TimeChoice | null>(null);
  const [email, setEmail] = useState("");
  const [earned, setEarned] = useState<Earned | null>(null);

  const indexRef = useRef(index);
  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { ttqTrack("ViewContent", { content_category: "commencer" }); }, []);

  const step: CmStep | null = index < steps.length ? steps[index] : null;
  const isPaywall = step === null;

  // Funnel analytics: record each step the first time it is reached in this
  // visit ("03|q_pain", "17|paywall"), so the admin can see where people quit.
  const seenSteps = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (seenSteps.current.has(index)) return;
    seenSteps.current.add(index);
    const key = step === null ? "paywall" : step.type === "question" ? `q_${step.id}` : step.type;
    track("cm_step", `${String(index).padStart(2, "0")}|${key}`);
  }, [index, step]);

  const move = useCallback((to: number) => {
    const from = indexRef.current;
    const target = Math.max(0, Math.min(total - 1, to));
    if (target === from) return;
    const fromStep = steps[from] ?? null;
    const toStep = steps[target] ?? null;
    const pushy = (s: CmStep | null) => s === null || PUSHY.includes(s.type);
    const kind: Nav["kind"] = fromStep?.type === "splash" ? "dissolve" : pushy(fromStep) && pushy(toStep) ? "push" : "fade";
    setNav({ kind, dir: target > from ? 1 : -1 });
    if (fromStep && fromStep.type !== "splash" && fromStep.type !== "loader") fx.next();
    setIndex(target);
  }, [steps, total]);

  const go = useCallback(() => move(indexRef.current + 1), [move]);
  const back = useCallback(() => {
    let i = indexRef.current - 1;
    while (i > 0 && steps[i]?.type === "loader") i -= 1; // never replay the loader
    move(i);
  }, [move, steps]);

  const setAnswer = (id: string, values: string[]) => setAnswers((a) => {
    const next = { ...a, [id]: values };
    // Remembered for the post-purchase upsells (e.g. reading course only
    // for people who can't read Arabic yet).
    try { localStorage.setItem("cm_answers", JSON.stringify(next)); } catch { /* ignore */ }
    return next;
  });

  /* Derived personalisation */
  const q = (id: string) => steps.find((s): s is Step<"question"> => s.type === "question" && s.id === id);
  const optionLabel = (id: string) => q(id)?.options.find((o) => o.id === answers[id]?.[0])?.label;
  const levelStep = q("level");
  const levelIdx = levelStep ? levelStep.options.findIndex((o) => o.id === answers.level?.[0]) : -1;
  const level = levelIdx >= 0 ? levelIdx + 1 : 1;
  const levelLabel = levelIdx >= 0 && levelStep ? levelStep.options[levelIdx].label : ui.beginner;
  const whenLabel = (optionLabel("when") ?? ui.everyDay).toLowerCase();
  const timeStep = steps.find((s): s is Step<"time"> => s.type === "time");
  const minutes = time?.minutes ?? timeStep?.options[0]?.minutes ?? 15;
  const goalDate = useMemo(() => (today && time ? addDays(today, time.weeks * 7) : null), [today, time]);
  const goalDateLabel = goalDate ? fmtShort(goalDate, locale) : null;
  const splash = content.steps.find((s): s is Step<"splash"> => s.type === "splash");

  const onEmail = (value: string) => {
    setEmail(value);
    const focus = [`why:${(answers.why ?? []).join("|")}`, `when:${answers.when?.[0] ?? ""}`, `min:${minutes}`].join(";");
    void captureFunnelLead({ email: value, stage: "offer", focusChoice: focus, source: locale === "fr" ? "commencer" : `commencer_${locale}` }).catch(() => undefined);
    go();
  };

  const showBar = step !== null && !NO_BAR.includes(step.type);
  const showHeader = showBar || isPaywall;
  // Full-colour screens: the brand splash and the plan loader.
  const dark = step?.type === "loader" || step?.type === "splash";
  const variants = useMemo(() => screenVariants(reduce), [reduce]);

  return (
    <div className="z-50 flex flex-col overflow-hidden font-sans" style={{ position: "fixed", inset: 0, background: dark ? P.purple : "#fff", color: P.text, transition: "background-color .22s ease-out" }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <OpenInBrowserHint accent={P.purple} />

      <div className="relative mx-auto flex h-full w-full max-w-md flex-col pt-[env(safe-area-inset-top)]">
        {/* Header: back chevron + animated progress bar (outside the screen transitions so the bar tweens) */}
        <motion.div className="shrink-0 overflow-hidden" initial={false} animate={{ height: showHeader ? 52 : 0, opacity: showHeader ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.25 }} aria-hidden={!showHeader}>
          <div className="flex h-[52px] items-center gap-2 px-4">
            <button type="button" onClick={back} aria-label={ui.back} tabIndex={showHeader ? 0 : -1} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full transition-opacity active:opacity-50" style={{ color: P.soft }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            {showBar && (
              <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "#EDEDED" }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((index / (total - 1)) * 100)}>
                <motion.div className="h-full rounded-full" style={{ background: P.purple }} initial={false} animate={{ width: `${Math.max(4, (index / (total - 1)) * 100)}%` }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 20, mass: 0.8 }} />
              </div>
            )}
            {!showBar && <span className="flex-1" />}
            <FxMuteButton color="#C4C4C4" labelOn={ui.soundOn} labelOff={ui.soundOff} />
          </div>
        </motion.div>

        {/* Screens */}
        <div className="relative min-h-0 flex-1">
          <AnimatePresence custom={nav} initial={false}>
            <motion.div key={index} custom={nav} variants={variants} initial="enter" animate="center" exit="exit" className="absolute inset-0 flex flex-col">
              {isPaywall ? (
                <Paywall paywall={content.paywall} email={email} whenLabel={whenLabel} locale={locale} currency={currency} earned={earned} />
              ) : (
                <Screen ui={ui} locale={locale} onEarned={setEarned} step={step} answers={answers} setAnswer={setAnswer} time={time} setTime={setTime} goalDateLabel={goalDateLabel} onNext={go} onEmail={onEmail} level={level} levelLabel={levelLabel} minutes={minutes} whenLabel={whenLabel} arabic={splash?.arabic ?? "قُرْآن"} />
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

function Screen(props: { ui: CmUi; locale: CmLocale; onEarned: (e: Earned) => void; step: CmStep; answers: Answers; setAnswer: (id: string, values: string[]) => void; time: TimeChoice | null; setTime: (t: TimeChoice) => void; goalDateLabel: string | null; onNext: () => void; onEmail: (email: string) => void; level: number; levelLabel: string; minutes: number; whenLabel: string; arabic: string }) {
  const { step, onNext } = props;
  switch (step.type) {
    case "splash": return <SplashScreen step={step} onDone={onNext} />;
    case "welcome": return <WelcomeScreen step={step} onNext={onNext} />;
    case "question": return <QuestionScreen ui={props.ui} cont={props.ui.continue} step={step} selected={props.answers[step.id] ?? []} onChange={(v) => props.setAnswer(step.id, v)} onNext={onNext} />;
    case "chart": return <ChartScreen cont={props.ui.continue} step={step} onNext={onNext} />;
    case "time": return <TimeScreen cont={props.ui.continue} step={step} choice={props.time} onChoose={props.setTime} goalDateLabel={props.goalDateLabel} onNext={onNext} />;
    case "email": return <EmailScreen ui={props.ui} step={step} whenLabel={props.whenLabel} onSubmit={props.onEmail} onSkip={onNext} />;
    case "social": return <SocialScreen cont={props.ui.continue} step={step} onNext={onNext} />;
    case "loader": return <LoaderScreen step={step} onDone={onNext} />;
    case "plan": return <PlanScreen step={step} minutes={props.minutes} whenLabel={props.whenLabel} goalDateLabel={props.goalDateLabel} level={props.level} levelLabel={props.levelLabel} arabic={props.arabic} onNext={onNext} />;
    case "lesson": return <LessonScreen ui={props.ui} locale={props.locale} step={step} onNext={onNext} onEarned={props.onEarned} />;
    case "bell": return <BellScreen step={step} onNext={onNext} />;
    default: return null;
  }
}

/* ------------------------------------------------------------------ */
/* Splash                                                               */

/**
 * Brand splash: only Koji's eyes on the brand colour, so the whole screen reads as his face,
 * with the wordmark at the bottom. The eyes open, look left and right and blink; the funnel
 * moves on once that little scene has played. A tap skips it.
 */
function SplashScreen({ step, onDone }: { step: Step<"splash">; onDone: () => void }) {
  const reduce = useReducedMotion();
  const timer = useRef<number | null>(null);
  // Counted from the moment the eyes start moving; capped so a blocked animation never traps the visitor.
  const onStart = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(onDone, 2000);
  }, [onDone]);
  useEffect(() => {
    timer.current = window.setTimeout(onDone, reduce ? 900 : 3500);
    return () => { if (timer.current !== null) window.clearTimeout(timer.current); };
  }, [onDone, reduce]);
  return (
    <button type="button" onClick={onDone} className="relative block h-full w-full select-none" style={{ background: P.purple }} aria-label={`${step.brand} — ${step.tagline}`}>
      <span className="absolute inset-0 flex items-center justify-center">
        <SplashEyes className="h-72 w-72" onStart={onStart} />
      </span>
      <motion.span className="absolute inset-x-0 block text-center font-display text-[2.125rem] font-semibold lowercase leading-none text-white" style={{ bottom: "max(36px, calc(env(safe-area-inset-bottom) + 20px))", letterSpacing: "-0.01em" }} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : { delay: 0.15, duration: 0.4, ease: EASE_OUT }} aria-hidden>
        {step.brand}
      </motion.span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Welcome — Koji intro, compact (no dead space)                        */

/** Side of the square frame Koji's intro animation is drawn in (px). */
const INTRO_FRAME = 380;
// Measured on the animation: Koji shoots up from the bottom of the frame, jumps almost to its
// top, then settles in the middle (between 32 % and 69 % of the height). The stage shows the
// whole travel so nothing is ever cut; the bubble and the headline use the room he leaves once
// he has landed.
const INTRO_TOP = 0.08;      // part of the frame hidden above the stage
const INTRO_HEIGHT = 0.89;   // part of the frame the stage shows
const INTRO_REST_TOP = 0.32; // top of Koji at rest
const INTRO_REST_BOTTOM = 0.69;

function WelcomeScreen({ step, onNext }: { step: Step<"welcome">; onNext: () => void }) {
  const reduce = useReducedMotion();
  // The words arrive once Koji has landed (about 0.95 s into his animation).
  const [landed, setLanded] = useState(false);
  // Koji's frame is opaque white: he is brought in once the coloured splash has fully faded.
  const [onStage, setOnStage] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setOnStage(true), 280);
    return () => window.clearTimeout(t);
  }, []);
  const landTimer = useRef<number | null>(null);
  const onPlayStart = useCallback(() => {
    if (landTimer.current === null) landTimer.current = window.setTimeout(() => setLanded(true), 950);
  }, []);
  useEffect(() => {
    if (reduce) setLanded(true);
    const fallback = window.setTimeout(() => setLanded(true), 3200); // animation blocked or slow to load
    return () => { window.clearTimeout(fallback); if (landTimer.current !== null) window.clearTimeout(landTimer.current); };
  }, [reduce]);
  const F = INTRO_FRAME;
  const stageH = F * INTRO_HEIGHT;
  const restTop = (INTRO_REST_TOP - INTRO_TOP) * F;
  const restBottom = (INTRO_REST_BOTTOM - INTRO_TOP) * F;
  const say = { duration: reduce ? 0 : 0.4, ease: EASE_OUT };
  return (
    <Shell
      center
      align="center"
      footer={
        <>
          <PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>
          {(step.signinText || step.signinCta) && (
            <p className="text-center text-[0.875rem]" style={{ color: P.soft }}>
              {step.signinText} <a href="/auth/login" className="font-semibold underline-offset-2" style={{ color: P.purple }}>{step.signinCta}</a>
            </p>
          )}
        </>
      }
    >
      <div className="relative w-full overflow-hidden" style={{ height: stageH }}>
        <div className="absolute left-1/2" style={{ width: F, height: F, top: -INTRO_TOP * F, marginLeft: -F / 2 }}>
          {onStage && <OnboardingMascot phase="intro" onPlayStart={onPlayStart} />}
        </div>
        <div className="absolute inset-x-0 z-10 flex justify-center" style={{ bottom: stageH - restTop + 16 }}>
          <motion.div initial={false} animate={{ opacity: landed ? 1 : 0, y: landed ? 0 : 8, scale: landed ? 1 : 0.94 }} transition={say} style={{ transformOrigin: "50% 100%" }}>
            <Bubble tail="bottom"><p className="font-heading text-[1.0625rem] font-bold leading-snug" style={{ color: P.text }}>{step.headline}</p></Bubble>
          </motion.div>
        </div>
      </div>
      <motion.h1 className="relative z-10 max-w-[21rem] font-heading text-[2.125rem] font-extrabold leading-[1.1] sm:text-[2.5rem]" style={{ marginTop: -(stageH - restBottom) + 24, color: P.text, letterSpacing: "-0.02em", textWrap: "balance" as never }} initial={false} animate={{ opacity: landed ? 1 : 0, y: landed ? 0 : 12 }} transition={{ ...say, delay: reduce ? 0 : 0.12 }}>
        {rich(step.tagline)}
      </motion.h1>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Question — small Koji next to the title, "yup" on each pick          */

function QuestionScreen({ ui, cont, step, selected, onChange, onNext }: { ui: CmUi; cont: string; step: Step<"question">; selected: string[]; onChange: (v: string[]) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [replay, setReplay] = useState(0);
  const hasIcons = step.options.some((o) => o.icon);
  // Koji's reply to the answer: specific to the question when we have one.
  const reply = selected.length === 0 ? null
    : ui.react[`${step.id}_${selected[0]}`] ?? ui.react[step.id] ?? ui.reactGeneric[step.headline.length % ui.reactGeneric.length];
  const pick = (id: string) => {
    setReplay((k) => k + 1);
    fx.select();
    if (step.multi) {
      onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
      return;
    }
    // No auto-advance: the learner confirms with "Continuer".
    onChange([id]);
  };
  return (
    <Shell footer={<PrimaryButton onClick={onNext} disabled={selected.length === 0}>{step.cta ?? cont}</PrimaryButton>}>
      <KojiSays mascot={<OnboardingMascot phase="question" replayKey={replay} />}>
        {/* Both lines stay in the flow so the bubble never changes height: the question, then Koji's reply. */}
        <div className="grid" aria-live="polite">
          <div className="col-start-1 row-start-1" style={{ opacity: reply ? 0 : 1, transition: reduce ? "none" : "opacity .2s ease-out" }} aria-hidden={!!reply}>
            <h1 className="font-heading text-[1.125rem] font-bold leading-snug" style={{ color: P.text, textWrap: "balance" as never }}>{rich(step.headline)}</h1>
            {step.sub && <p className="mt-1 text-[0.8125rem] leading-snug" style={{ color: P.muted }}>{step.sub}</p>}
          </div>
          <p className="col-start-1 row-start-1 self-center font-heading text-[1.0625rem] font-bold leading-snug" style={{ color: P.text, opacity: reply ? 1 : 0, transform: reply || reduce ? "none" : "translateY(4px)", transition: reduce ? "none" : "opacity .22s ease-out .08s, transform .22s ease-out .08s", textWrap: "balance" as never }} aria-hidden={!reply}>{reply ?? ""}</p>
        </div>
      </KojiSays>
      <motion.div className="mt-6 flex flex-col gap-3" role={step.multi ? "group" : "radiogroup"} aria-label={step.headline} variants={reduce ? undefined : cascade.container} initial="hidden" animate="show">
        {step.options.map((o) => <OptionCard key={o.id} label={o.label} icon={o.icon} selected={selected.includes(o.id)} onClick={() => pick(o.id)} center={!hasIcons} multi={step.multi} />)}
      </motion.div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Interlude chart                                                      */

function ChartScreen({ cont, step, onNext }: { cont: string; step: Step<"chart">; onNext: () => void }) {
  return (
    <Shell footer={<PrimaryButton onClick={onNext}>{step.cta ?? cont}</PrimaryButton>}>
      <Heading>{rich(step.headline)}</Heading>
      <div className="mt-6"><ProgressChart chartLabel={step.chartLabel} brandLabel={step.brandLabel} othersLabel={step.othersLabel} xStart={step.xStart} xEnd={step.xEnd} checkTitle={step.checkTitle} checklist={step.checklist} /></div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Daily time + projection                                              */

function TimeScreen({ cont, step, choice, onChoose, goalDateLabel, onNext }: { cont: string; step: Step<"time">; choice: TimeChoice | null; onChoose: (t: TimeChoice) => void; goalDateLabel: string | null; onNext: () => void }) {
  const reduce = useReducedMotion();
  const sentence = choice ? fill(step.sentence, { min: choice.minutes, weeks: choice.weeks }) : null;
  return (
    <Shell footer={<PrimaryButton onClick={onNext} disabled={!choice}>{step.cta ?? cont}</PrimaryButton>}>
      <Heading>{rich(step.headline)}</Heading>
      <div className="mt-5"><TimeChart goalLabel={step.goalLabel} aloneLabel={step.aloneLabel} xStart={step.xStart} xEnd={step.xEnd} weeks={choice?.weeks ?? null} dateLabel={goalDateLabel} /></div>
      <p className="mt-4 min-h-[3rem] text-[1rem] leading-normal" style={{ color: sentence ? P.text : P.muted, textWrap: "pretty" as never }} aria-live="polite">{sentence ? rich(sentence) : step.placeholder}</p>
      <motion.div className="mt-5 grid grid-cols-2 gap-3" role="radiogroup" variants={reduce ? undefined : cascade.container} initial="hidden" animate="show">
        {step.options.map((o) => {
          const active = choice?.minutes === o.minutes && choice?.weeks === o.weeks;
          return (
            <motion.button key={`${o.minutes}-${o.label}`} type="button" role="radio" aria-checked={active} variants={reduce ? undefined : cascade.item} whileTap={reduce ? undefined : { scale: 0.975 }} onClick={() => { fx.select(); onChoose({ minutes: o.minutes, weeks: o.weeks }); }}
              className="flex select-none items-center justify-center gap-2 text-[1.0625rem]" style={{ minHeight: 60, borderRadius: 16, fontWeight: active ? 700 : 600, fontVariantNumeric: "tabular-nums", background: active ? "#F5F5FF" : "#fff", color: P.text, boxShadow: active ? `inset 0 0 0 2px ${P.purple}, 0 2px 0 0 ${P.purpleLine}` : `inset 0 0 0 1.5px ${P.border}, 0 2px 0 0 #F0F0F0`, transition: "background-color .16s ease-out, box-shadow .16s ease-out" }}>
              <Icon name="timer" size={19} strokeWidth={2.25} duo className={active ? "text-[#6967FB]" : "text-[#9A99EE]"} />{o.label}
            </motion.button>
          );
        })}
      </motion.div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Email — asked AFTER the plan (to receive it), skip kept discreet     */

function EmailScreen({ ui, step, whenLabel, onSubmit, onSkip }: { ui: CmUi; step: Step<"email">; whenLabel: string; onSubmit: (email: string) => void; onSkip: () => void }) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim().toLowerCase();
    if (!EMAIL_RE.test(v)) { setInvalid(true); return; }
    onSubmit(v);
  };
  return (
    <form onSubmit={submit} className="flex h-full min-h-0 flex-col" noValidate>
      <Shell footer={
        <>
          <PrimaryButton type="submit" disabled={value.trim().length === 0}>{step.cta}</PrimaryButton>
          {step.skip && <button type="button" onClick={onSkip} className="mx-auto min-h-[2.75rem] px-4 text-[0.875rem] font-semibold active:opacity-60" style={{ color: P.soft }}>{step.skip}</button>}
        </>
      }>
        <KojiSays mascot={<OnboardingMascot phase="question" />}>
          <h1 className="font-heading text-[1.125rem] font-bold leading-snug" style={{ color: P.text, textWrap: "balance" as never }}>{rich(step.headline)}</h1>
          <p className="mt-1 text-[0.8125rem] leading-snug" style={{ color: P.muted }}>{fill(step.sub, { when: whenLabel })}</p>
        </KojiSays>
        <label className="mt-8 block">
          <span className="sr-only">Email</span>
          <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" enterKeyHint="send" value={value} onChange={(e) => { setValue(e.target.value); setInvalid(false); }} placeholder={step.placeholder} aria-invalid={invalid || undefined}
            className="cm-input w-full px-4 text-[1.0625rem] outline-none" style={{ height: 56, borderRadius: 16, background: "#fff", boxShadow: `inset 0 0 0 ${invalid ? 2 : 1.5}px ${invalid ? P.danger : "#D4D4D4"}`, color: P.text }} />
        </label>
        {invalid && <p className="mt-2 text-[0.8125rem]" style={{ color: P.danger }} role="alert">{ui.invalidEmail}</p>}
        {step.note && <p className="mt-3 text-[0.8125rem]" style={{ color: P.muted }}>{step.note}</p>}
      </Shell>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Social proof (CTA locked by a timer)                                 */

function SocialScreen({ cont, step, onNext }: { cont: string; step: Step<"social">; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [locked, setLocked] = useState(step.lockSeconds > 0);
  useEffect(() => {
    const t = window.setTimeout(() => setLocked(false), Math.max(0, step.lockSeconds) * 1000);
    return () => window.clearTimeout(t);
  }, [step.lockSeconds]);
  const d = (s: number) => (reduce ? { duration: 0 } : { delay: s, duration: 0.4, ease: EASE_OUT });
  return (
    <Shell footer={<PrimaryButton onClick={onNext} disabled={locked}>{step.cta ?? cont}</PrimaryButton>}>
      <Heading align="center">{rich(step.headline)}</Heading>
      <motion.div className="mt-6 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={d(0.05)}>
        <p className="font-heading text-[3.5rem] font-extrabold leading-none" style={{ color: P.text, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{step.rating}</p>
        <div className="mt-2 flex justify-center"><Stars size={20} /></div>
        <p className="mt-2 text-[0.9375rem]" style={{ color: P.soft }}>{step.ratingSub}</p>
      </motion.div>
      <div className="mt-8 space-y-3">
        {step.reviews.map((r, i) => (
          <motion.figure key={`${r.name}-${i}`} className="px-5 py-4" style={{ borderRadius: 20, background: "#F7F7FF" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={d(0.25 + i * 0.12)}>
            <blockquote className="text-[0.9375rem] leading-normal" style={{ color: P.text, textWrap: "pretty" as never }}>{r.text}</blockquote>
            <figcaption className="mt-3 flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-bold text-white" style={{ background: P.purple }} aria-hidden>{r.initials}</span>
              <span className="flex-1 text-[0.875rem] font-semibold" style={{ color: P.text }}>{r.name}</span>
              <Stars size={12} />
            </figcaption>
          </motion.figure>
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
  useEffect(() => { if (capIdx > 0) fx.tick(); }, [capIdx]);
  useEffect(() => { if (pct === 100) fx.reward(); }, [pct]);
  const R = 88, C = 2 * Math.PI * R;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center text-white" style={{ background: P.purple }} role="status" aria-live="polite">
      <motion.div className="h-32 w-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.5 }}><RiveAnim src="/animations/loading.riv" crop={KOJI_CROP} /></motion.div>
      <motion.h1 className="mt-2 max-w-xs font-heading text-[1.625rem] font-bold leading-tight sm:text-[1.875rem]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.5 }}>{rich(step.headline)}</motion.h1>
      <motion.div className="relative mt-8 h-[180px] w-[180px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.5, delay: 0.1 }}>
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="100" cy="100" r={R} fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="8" />
          <circle cx="100" cy="100" r={R} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-heading text-[2.875rem] font-extrabold leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>{pct}%</div>
      </motion.div>
      <div className="mt-7 h-6 text-[1rem] text-white/85">{capIdx >= 0 && <span key={capIdx}>{captions[capIdx]}</span>}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Plan ready                                                           */

function PlanScreen({ step, minutes, whenLabel, goalDateLabel, level, levelLabel, onNext }: { step: Step<"plan">; minutes: number; whenLabel: string; goalDateLabel: string | null; level: number; levelLabel: string; arabic: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  const w = (i: number) => (reduce ? { duration: 0 } : { delay: 0.15 + i * 0.18, duration: 0.45, ease: EASE_OUT });
  const vars = { min: minutes, when: whenLabel, level, levelLabel };
  const [confetti, setConfetti] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => { fx.win(); setConfetti(1); }, 250);
    return () => window.clearTimeout(t);
  }, []);
  const rise = (i: number) => ({ initial: reduce ? false as const : { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: w(i) });
  return (
    <Shell footer={<PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>}>
      <ConfettiBurst fireKey={confetti} pieces={30} originY="16%" />
      <KojiSays mascot={<OnboardingMascot phase="question" />}>
        <h1 className="font-heading text-[1.125rem] font-bold leading-snug" style={{ color: P.text, textWrap: "balance" as never }}>{rich(step.headline)}</h1>
        <p className="mt-1 text-[0.8125rem] font-semibold leading-snug" style={{ color: P.purple }}>{step.journeyTitle} · {fill(step.levelPill, vars)}</p>
      </KojiSays>

      {/* The two figures of the plan */}
      <motion.div className="mt-8 grid grid-cols-2 gap-3" {...rise(0)}>
        {[{ big: `${minutes} min`, small: step.minutesLabel }, { big: goalDateLabel ?? "…", small: step.dateLabel }].map((s) => (
          <div key={s.small} className="px-4 py-4" style={{ borderRadius: 20, background: "#F7F7FF" }}>
            <p className="font-heading text-[1.75rem] font-extrabold leading-none" style={{ color: P.text, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{s.big}</p>
            <p className="mt-1.5 text-[0.8125rem]" style={{ color: P.soft }}>{s.small}</p>
          </div>
        ))}
      </motion.div>

      <motion.div className="mt-8" {...rise(1)}>
        <h2 className="text-[0.75rem] font-semibold uppercase" style={{ color: P.muted, letterSpacing: "0.05em" }}>{step.yourPlanLabel}</h2>
        <ul className="mt-4 space-y-5">
          {step.rows.map((r) => (
            <li key={r.label} className="flex gap-4">
              <span className="flex w-7 shrink-0 justify-center pt-0.5" style={{ color: P.purple }} aria-hidden><Icon name={r.icon} size={24} strokeWidth={1.75} duo /></span>
              <span className="min-w-0">
                <span className="block text-[0.8125rem]" style={{ color: P.muted }}>{r.label}</span>
                <span className="mt-0.5 block text-[1rem] font-semibold leading-snug first-letter:uppercase" style={{ color: P.text }}>{fill(r.text, vars)}</span>
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive lesson — the learner really does 3 cards before paying   */

const OK_GREEN = "#1F9D4D";
const OK_SOFT = "#E9F9EC";
const BAD_RED = "#D93A3A";
const BAD_SOFT = "#FDEEEE";

function LessonScreen({ ui, locale, step, onNext, onEarned }: { ui: CmUi; locale: CmLocale; step: Step<"lesson">; onNext: () => void; onEarned: (e: Earned) => void }) {
  const reduce = useReducedMotion();
  const L = ui.lesson;
  const cards = step.cards;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [gain, setGain] = useState(10);
  const [okReplay, setOkReplay] = useState(0);
  const [burst, setBurst] = useState(0);
  const [confetti, setConfetti] = useState(0);
  // After the last card: "lesson complete", then "streak started".
  const [after, setAfter] = useState<"complete" | "streak">("complete");
  const done = i >= cards.length;
  const card = cards[i];
  const shuffled = useMemo(() => {
    if (!card) return [] as string[];
    const list = Array.from(new Set([...card.choices, card.fr]));
    // Deterministic order per card (no Math.random → no hydration drift).
    return list.sort((a, b) => ((a.charCodeAt(0) * 31 + a.length * 7) % 97) - ((b.charCodeAt(0) * 31 + b.length * 7) % 97));
  }, [card]);
  // Where the learner already says this word: its verse of Al-Fatiha.
  const inFatiha = useMemo(() => (card ? findInFatiha(card.arabic) : null), [card]);
  const allInFatiha = useMemo(() => cards.length > 0 && cards.every((c) => findInFatiha(c.arabic)), [cards]);

  const choose = (c: string) => {
    if (picked !== null || !card) return;
    setPicked(c);
    if (c === card.fr) {
      fx.correct();
      setGain(10);
      setXp((x) => x + 10);
      setOkReplay((k) => k + 1);
      setBurst((k) => k + 1);
    } else {
      // The word is still learned once the answer is shown: a smaller reward, never a penalty.
      fx.wrong();
      setGain(5);
      setXp((x) => x + 5);
    }
  };
  const next = () => {
    fx.next();
    setPicked(null);
    setI((x) => x + 1);
  };

  useEffect(() => {
    if (!done) return;
    onEarned({ xp, words: cards.length });
    const t = window.setTimeout(() => { fx.win(); setConfetti(1); }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const rise = (d: number) => ({ initial: reduce ? false as const : { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: reduce ? { duration: 0 } : { delay: d, duration: 0.45, ease: EASE_OUT } });

  /* ---- Lesson complete: mascot on its pedestal, one number ---- */
  if ((done || !card) && after === "complete") {
    return (
      <Shell center align="center" footer={<PrimaryButton onClick={() => { fx.next(); setAfter("streak"); }}>{ui.continue}</PrimaryButton>}>
        <ConfettiBurst fireKey={confetti} pieces={30} originY="34%" />
        <motion.div className="h-56 w-56" initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}>
          <RiveAnim src="/animations/completed_lvl.riv" crop={PEDESTAL_CROP} />
        </motion.div>
        <motion.h1 className="mt-2 max-w-[22rem] font-heading text-[1.875rem] font-extrabold leading-[1.12]" style={{ color: P.text, letterSpacing: "-0.02em", textWrap: "balance" as never }} {...rise(0.15)}>{rich(step.doneHeadline)}</motion.h1>
        <motion.div className="mt-8" {...rise(0.35)}>
          <p className="text-[0.75rem] font-semibold uppercase" style={{ color: P.muted, letterSpacing: "0.05em" }}>{L.totalXp}</p>
          <p className="mt-1 flex items-center justify-center gap-1.5 font-heading text-[3.5rem] font-extrabold leading-none" style={{ color: P.text, letterSpacing: "-0.03em" }}>
            <CountUp value={xp} duration={1000} />
            <Icon name="sparkles" size={30} strokeWidth={2.25} duo className="text-[#6967FB]" />
          </p>
        </motion.div>
      </Shell>
    );
  }

  /* ---- Streak started: the flame, the week, why it matters ---- */
  if (done || !card) {
    const todayIdx = (new Date().getDay() + 6) % 7; // Monday first
    const dayLetter = (k: number) => new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale === "es" ? "es-ES" : "fr-FR", { weekday: "narrow" }).format(new Date(2024, 0, 1 + k)); // 1 Jan 2024 is a Monday
    return (
      <Shell center align="center" footer={<PrimaryButton onClick={onNext}>{step.cta}</PrimaryButton>}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[60%]" style={{ background: "radial-gradient(60% 55% at 50% 38%, #FFF0DB 0%, rgba(255,240,219,0) 100%)" }} aria-hidden />
        <StreakFlame className="relative h-48 w-48" />
        <motion.p className="relative -mt-2 font-heading text-[4rem] font-extrabold leading-none" style={{ color: "#F0641E", letterSpacing: "-0.03em" }} {...rise(0.35)}>1</motion.p>
        <motion.p className="relative mt-1 text-[0.9375rem] font-semibold" style={{ color: "#C2570C" }} {...rise(0.4)}>{L.streakCount}</motion.p>
        <motion.div className="relative mt-6 flex justify-center gap-2" {...rise(0.5)} aria-hidden>
          {Array.from({ length: 7 }, (_, k) => (
            <span key={k} className="flex w-9 flex-col items-center gap-1.5">
              <span className="text-[0.75rem] font-semibold uppercase" style={{ color: k === todayIdx ? "#C2570C" : P.muted }}>{dayLetter(k)}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full" style={k === todayIdx ? { background: "#FF8A1F", color: "#fff", boxShadow: "0 2px 0 0 #E0680A" } : { background: "#F3F3F3" }}>
                {k === todayIdx && <Icon name="check" size={18} strokeWidth={3} />}
              </span>
            </span>
          ))}
        </motion.div>
        <motion.h1 className="relative mt-8 font-heading text-[1.625rem] font-bold leading-[1.2]" style={{ color: P.text, letterSpacing: "-0.02em" }} {...rise(0.6)}>{L.streakTitle}</motion.h1>
        <motion.p className="relative mt-2 max-w-[20rem] text-[1rem] leading-normal" style={{ color: P.soft, textWrap: "pretty" as never }} {...rise(0.68)}>{allInFatiha ? rich(L.fact) : step.doneSub}</motion.p>
      </Shell>
    );
  }

  /* ---- A word to understand ---- */
  const answered = picked !== null;
  const ok = answered && picked === card.fr;
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-44 pt-4">
        {/* Progress: one segment per word, XP on the trailing edge */}
        <div className="flex items-center gap-4">
          <div className="flex flex-1 gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={i + (answered ? 1 : 0)}>
            {cards.map((_, k) => <span key={k} className="h-2 flex-1 rounded-full" style={{ background: k < i || (k === i && answered) ? P.purple : "#EDEDED", transition: "background-color .25s ease-out" }} />)}
          </div>
          <span className="flex items-center gap-1 text-[0.9375rem] font-bold" style={{ color: P.text }}>
            <Icon name="sparkles" size={17} strokeWidth={2.4} duo className="text-[#6967FB]" /><CountUp value={xp} duration={450} />
          </span>
        </div>

        <div className="mt-6">
          <KojiSays size={64} mascot={<OnboardingMascot phase="question" replayKey={okReplay} />}>
            {i === 0 ? (
              <>
                <h1 className="font-heading text-[1.125rem] font-bold leading-snug" style={{ color: P.text, textWrap: "balance" as never }}>{rich(step.headline)}</h1>
                {step.sub && <p className="mt-1 text-[0.8125rem] leading-snug" style={{ color: P.muted }}>{step.sub}</p>}
              </>
            ) : (
              <h1 className="font-heading text-[1.125rem] font-bold leading-snug" style={{ color: P.text }}>{L.askNext}</h1>
            )}
          </KojiSays>
        </div>

        {/* The word. After the answer, its verse of Al-Fatiha unfolds underneath. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={i} className={`relative mt-5 text-center ${answered && !ok ? "cm-shake" : ""}`} style={{ borderRadius: 24, background: "#F7F7FF" }} initial={{ opacity: 0, x: reduce ? 0 : 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduce ? 0 : -32 }} transition={{ duration: reduce ? 0 : 0.26, ease: EASE_OUT }}>
            <div className="relative px-5 pb-5 pt-6">
              <p lang="ar" dir="rtl" style={{ fontFamily: AR_FONT, fontSize: 60, lineHeight: 1.75, color: P.text }}>{card.arabic}</p>
              {/* Phonetics stay visible: many visitors cannot read Arabic script yet. */}
              <p className="text-[1rem] italic" style={{ color: P.muted }}>{card.translit}</p>
              <SpeakButton arabic={card.arabic} size="sm" className="absolute right-3 top-3 bg-white" />
              <RewardBurst fireKey={burst} className="absolute -right-7 -top-9 h-28 w-28" />
            </div>
            <AnimatePresence initial={false}>
              {answered && inFatiha && (
                <motion.div className="overflow-hidden" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: reduce ? 0 : 0.32, ease: EASE_OUT, delay: reduce ? 0 : 0.15 }}>
                  <div className="mx-5 border-t px-1 pb-5 pt-4" style={{ borderColor: "#E3E2FF" }}>
                    <p lang="ar" dir="rtl" style={{ fontFamily: AR_FONT, fontSize: inFatiha.words.length > 5 ? 21 : 26, lineHeight: 1.9, color: "#6B6B7B" }}>
                      {inFatiha.words.map((w, k) => (
                        <span key={k}>{k > 0 ? " " : ""}<span style={k === inFatiha.index ? { color: P.purple, fontWeight: 700 } : undefined}>{w}</span></span>
                      ))}
                    </p>
                    <p className="mt-1 text-[0.8125rem] leading-snug" style={{ color: P.muted, textWrap: "pretty" as never }}>
                      <span className="font-semibold" style={{ color: P.soft }}>{fill(L.inFatiha, { n: inFatiha.verse.n })}</span> · {inFatiha.verse[locale]}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex flex-col gap-3" role="group" aria-label={L.answers}>
          {shuffled.map((c) => {
            const right = answered && c === card.fr;
            const wrong = answered && c === picked && c !== card.fr;
            return (
              <motion.button key={`${i}-${c}`} type="button" disabled={answered} whileTap={reduce || answered ? undefined : { scale: 0.98 }} onClick={() => choose(c)} className="flex select-none items-center gap-3 px-4 text-left text-[1rem]"
                style={{
                  minHeight: 60, borderRadius: 16, color: P.text, fontWeight: right ? 600 : 500,
                  background: right ? "#F1FBF3" : wrong ? "#FEF5F5" : "#fff",
                  boxShadow: right ? `inset 0 0 0 2px ${OK_GREEN}` : wrong ? `inset 0 0 0 2px ${BAD_RED}` : `inset 0 0 0 1.5px ${P.border}, 0 2px 0 0 #F0F0F0`,
                  opacity: answered && !right && !wrong ? 0.45 : 1,
                  transition: "background-color .16s ease-out, box-shadow .16s ease-out, opacity .2s ease-out",
                }}>
                <span className="flex-1 py-3 leading-snug">{c}</span>
                {right && <span className="cm-pop flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-white" style={{ background: OK_GREEN }}><Icon name="check" size={13} strokeWidth={3.2} /></span>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Feedback sheet: slides up once the learner has answered */}
      <AnimatePresence>
        {answered && (
          <motion.div key={`sheet-${i}`} className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-4" style={{ background: ok ? OK_SOFT : BAD_SOFT, borderRadius: "24px 24px 0 0" }}
            initial={reduce ? { opacity: 0 } : { y: "100%" }} animate={reduce ? { opacity: 1 } : { y: 0 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ type: "spring", stiffness: 420, damping: 36 }} aria-live="polite">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-heading text-[1.1875rem] font-extrabold" style={{ color: ok ? "#15803D" : "#B42323", letterSpacing: "-0.01em" }}>{ok ? L.right : L.almost}</p>
              <p className="flex items-center gap-1 text-[0.875rem] font-bold" style={{ color: ok ? "#15803D" : "#B42323" }}><Icon name="sparkles" size={15} strokeWidth={2.4} duo />+{gain} {L.xp}</p>
            </div>
            {!ok && <p className="mt-0.5 text-[0.9375rem] leading-snug" style={{ color: P.text }}><span style={{ color: P.soft }}>{L.answerWas}</span> <span className="font-semibold">{card.fr}</span></p>}
            <button type="button" onClick={next} className="mt-3.5 w-full select-none text-[1rem] font-bold text-white transition-[transform,box-shadow] duration-100 active:translate-y-[4px] active:!shadow-none"
              style={{ height: 54, borderRadius: 16, background: ok ? "#22B455" : "#1E1E1E", boxShadow: `0 4px 0 0 ${ok ? "#16873E" : "#000"}` }}>
              {ui.continue}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
      <motion.h1 className="mt-8 max-w-[20rem] font-heading text-[1.625rem] font-bold leading-tight sm:text-[1.875rem]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : { delay: 0.1, duration: 0.45, ease: EASE_OUT }}>
        {rich(step.headline)}
      </motion.h1>
    </Shell>
  );
}
