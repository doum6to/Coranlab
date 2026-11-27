"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, Lock } from "lucide-react";

import type { UnitWithLists, VocabList } from "@/db/queries";
import { LevelNode, type LevelNodeState } from "@/components/level-node";
import { usePremiumModal } from "@/store/use-premium-modal";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";
import { takeJustFinished } from "@/lib/just-finished";

// Before the first paint in the browser, so the path never flashes in its final state.
const useBeforePaint = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The course as one path, top to bottom. Each list is a stage; the stage the learner is on
 * opens into its levels, the same discs as on the page of a list, with Koji floating over the
 * next one. Finished stages fold into a line that can be reopened to revise, the ones ahead
 * wait in grey. Only the part in progress is unfolded, so the home page stays short.
 */

const SCALE = 1.3; // the discs are drawn a third larger than on the page of a list
const NODE = 100 * SCALE; // width of a level node on the path
const heightOf = (active: boolean) => (active ? 105 : 75) * SCALE;
/** Where the centre of a disc sits below the top of its box (the box is taller when active). */
const centreOf = (active: boolean) => (active ? 74 : 53) * SCALE;
const STEP = 128; // vertical distance between two levels
const SWAY = [0, 52, 78, 52, 0, -52, -78, -52]; // the winding of the trail, in px from the centre
/** Room left above the level Koji floats over, so he never covers the level before it. */
const KOJI_ROOM = 50;

/** Top of each level: evenly spaced, with extra room before the one in progress. */
function tops(count: number, nextIndex: number): number[] {
  return Array.from({ length: count }, (_, i) => i * STEP + (nextIndex >= 0 && i >= nextIndex ? KOJI_ROOM : 0));
}

/** The trail drawn behind the levels: one smooth line through the centres of their discs. */
function Trail({ ys, nextIndex, drawn }: { ys: number[]; nextIndex: number; /** After a lesson: the stretch just walked, held back ("wait") then drawn ("play"). */ drawn?: { index: number; phase: "wait" | "play" } }) {
  const doneUntil = nextIndex < 0 ? ys.length : nextIndex;
  const cx = (i: number) => 180 + SWAY[i % SWAY.length];
  const cy = (i: number) => ys[i] + centreOf(i === nextIndex);
  const seg = (i: number) => {
    const mid = (cy(i + 1) - cy(i)) / 2;
    return `M ${cx(i)} ${cy(i)} C ${cx(i)} ${cy(i) + mid}, ${cx(i + 1)} ${cy(i + 1) - mid}, ${cx(i + 1)} ${cy(i + 1)}`;
  };
  return (
    <svg className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2" width={360} height={ys[ys.length - 1] + 140} aria-hidden>
      {ys.slice(0, -1).map((_, i) =>
        drawn?.index === i ? (
          <g key={i}>
            <path d={seg(i)} fill="none" stroke="#E2E2EA" strokeWidth={9} strokeLinecap="round" strokeDasharray="1 17" />
            <path d={seg(i)} fill="none" stroke="#C8C7F0" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} className={drawn.phase === "wait" ? "ql-await-draw" : "ql-draw"} />
          </g>
        ) : (
          <path key={i} d={seg(i)} fill="none" stroke={i < doneUntil ? "#C8C7F0" : "#E2E2EA"} strokeWidth={9} strokeLinecap="round" strokeDasharray={i < doneUntil ? undefined : "1 17"} />
        ),
      )}
    </svg>
  );
}

/** The stage in progress: its levels along a winding trail, drawn with the app's level discs. */
function OpenStage({ list, justId }: { list: VocabList; /** The level finished a moment ago, when the learner is back from a lesson. */ justId?: number }) {
  const t = useT();
  const levels = list.levels;
  const nextIndex = levels.findIndex((l) => !l.completed);
  const ys = tops(levels.length, nextIndex);
  // The progress is played when the stage comes on screen, not while it is still below the fold.
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (justId === undefined || !ref.current) return;
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [justId]);
  const phase = justId === undefined ? undefined : seen ? "play" : "wait";
  // The level just finished in this stage (when it was the last of the stage before, Koji simply lands on the first level here).
  const justIndex = justId === undefined ? -1 : levels.findIndex((l) => l.id === justId && l.completed);
  return (
    <div ref={ref} className="relative mx-auto" style={{ width: 360, maxWidth: "100%", height: ys[ys.length - 1] + heightOf(false) + 16 }}>
      <Trail ys={ys} nextIndex={nextIndex} drawn={phase && justIndex >= 0 && justIndex === nextIndex - 1 ? { index: justIndex, phase } : undefined} />
      {levels.map((level, i) => {
        const state: LevelNodeState = level.completed ? "completed" : i === nextIndex ? "active" : "locked";
        const active = state === "active";
        const sway = SWAY[i % SWAY.length];
        // The ring of the level in progress reaches past its box: its label stands further off.
        const gap = active ? (sway >= 0 ? "mr-5" : "ml-5") : sway >= 0 ? "mr-1.5" : "ml-1.5";
        const label = (
          <span className={`pointer-events-none absolute w-[104px] -translate-y-1/2 ${sway >= 0 ? "right-full text-right" : "left-full text-left"} ${gap}`} style={{ top: centreOf(active) }}>
            <span className={`block text-[0.9375rem] font-bold leading-tight ${state === "locked" ? "text-[#A9A9B8]" : "text-brilliant-text"}`}>{tpl(t.common.levelN, { n: level.levelOrder })}</span>
            {active && level.completedChallengeCount > 0 && (
              <span className="mt-0.5 block text-[0.8125rem] font-medium tabular-nums text-brilliant-muted">{level.completedChallengeCount}/{level.challengeCount}</span>
            )}
          </span>
        );
        const style = { left: `calc(50% + ${sway}px)`, top: ys[i], width: NODE, height: heightOf(active), transform: "translateX(-50%)" } as const;
        const body = (
          <>
            <span className="absolute left-0 top-0 block" style={{ transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
              <span className={`block ${phase === "play" && i === justIndex ? "ql-bump" : ""}`}>
                <LevelNode state={state} isLast={i === levels.length - 1} fixed koji={active && phase ? (phase === "play" ? "arrive" : "wait") : undefined} />
              </span>
            </span>
            {label}
          </>
        );
        return state === "locked" ? (
          <span key={level.id} className="absolute block" style={style} aria-label={tpl(t.common.levelN, { n: level.levelOrder })}>{body}</span>
        ) : (
          <Link key={level.id} href={`/lesson/${level.id}`} prefetch={active} className="absolute block select-none" style={style} aria-current={active ? "step" : undefined}>
            {body}
          </Link>
        );
      })}
    </div>
  );
}

/** A stage folded into one line: finished (reopens to revise), or still ahead. */
function StageRow({ list, state, just }: { list: VocabList; state: "done" | "ahead" | "premium"; /** This stage was finished a moment ago: its tick pops in. */ just?: boolean }) {
  const t = useT();
  const openPremium = usePremiumModal((s) => s.open);
  const inner = (
    <>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${just ? "ql-pop" : ""}`} style={{ background: state === "done" ? "#6967FB" : "#EFEFF4", color: state === "done" ? "#fff" : "#A9A9B8" }}>
        {state === "done" ? <Check className="h-5 w-5" strokeWidth={3.2} aria-hidden /> : <Lock className="h-[18px] w-[18px]" strokeWidth={2.6} aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[1rem] font-bold leading-tight ${state === "done" ? "text-brilliant-text" : "text-[#8A8A93]"}`}>{list.listTitle}</span>
        <span className="mt-0.5 block text-[0.8125rem] font-medium text-brilliant-muted">
          {state === "premium" ? t.common.premium : tpl(t.learn.levels, { n: list.totalLevels })}
        </span>
      </span>
      {state !== "ahead" && <ChevronRight className="h-5 w-5 shrink-0 text-[#B9B9C3]" strokeWidth={2.2} aria-hidden />}
    </>
  );
  const cls = "flex min-h-[64px] w-full items-center gap-3.5 rounded-2xl px-3.5 py-2.5 text-left";
  if (state === "done") return <Link href={`/learn/list/${list.listId}`} className={`${cls} transition-colors active:bg-[#F7F7FB]`}>{inner}</Link>;
  if (state === "premium") return <button type="button" onClick={() => openPremium(list.listTitle)} className={`${cls} transition-colors active:bg-[#F7F7FB]`}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

export function LearningPath({ units }: { units: UnitWithLists[] }) {
  const t = useT();
  // The stage in progress: the first list, in course order, with a level left to do.
  const current = units.flatMap((u) => u.lists).find((l) => l.completedLevels < l.totalLevels);
  const currentUnit = units.find((u) => u.lists.some((l) => l === current)) ?? units[0];
  // Only the part in progress starts unfolded; the others open on a tap.
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const isOpen = (u: UnitWithLists) => open[u.id] ?? u.id === currentUnit?.id;
  // Back from a lesson: the level it finished (see lib/just-finished.ts).
  const [justId, setJustId] = useState<number | undefined>(undefined);
  useBeforePaint(() => setJustId(takeJustFinished()?.lessonId), []);

  return (
    <div className="mx-auto w-full max-w-md px-4 sm:px-0">
      {units.map((unit) => {
        const done = unit.lists.filter((l) => l.completedLevels >= l.totalLevels).length;
        const unfolded = isOpen(unit);
        return (
          <section key={unit.id} className="mb-5">
            <h2>
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [unit.id]: !unfolded }))}
                aria-expanded={unfolded}
                className="flex w-full select-none items-center gap-3 rounded-3xl px-5 py-4 text-left transition-colors active:bg-[#F7F7FF]"
                style={{ boxShadow: "inset 0 0 0 2px #6967FB" }}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[1.25rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>{unit.title}</span>
                  <span className="mt-0.5 block text-[0.875rem] font-medium text-[#6967FB]">{unit.description}</span>
                  <span className="mt-0.5 block text-[0.8125rem] font-medium tabular-nums text-brilliant-muted">{tpl(t.home.pathLists, { done, total: unit.lists.length })}</span>
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-[#6967FB] transition-transform duration-200 ${unfolded ? "rotate-180" : ""}`} strokeWidth={2.4} aria-hidden />
              </button>
            </h2>

            {unfolded && (
              <div className="mt-3 flex flex-col">
                {unit.lists.map((list) => {
                  const listDone = list.completedLevels >= list.totalLevels;
                  if (list === current && !list.isPremiumLocked) {
                    return (
                      <div key={list.listId} className="my-3 rounded-[28px] bg-[#F7F7FF] px-2 pb-6 pt-5">
                        <h3 className="text-center font-heading text-[1.1875rem] font-extrabold leading-tight text-brilliant-text" style={{ textWrap: "balance" as never }}>{list.listTitle}</h3>
                        <div className="mt-6"><OpenStage list={list} justId={justId} /></div>
                      </div>
                    );
                  }
                  return <StageRow key={list.listId} list={list} state={listDone ? "done" : list.isPremiumLocked ? "premium" : "ahead"} just={listDone && justId !== undefined && list.levels.some((l) => l.id === justId)} />;
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
