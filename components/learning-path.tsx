"use client";

import Link from "next/link";
import { Check, ChevronRight, Lock, Play } from "lucide-react";

import type { UnitWithLists, VocabList } from "@/db/queries";
import { KOJI_CROP, RiveAnim } from "@/app/(sales)/commencer/ui";
import { usePremiumModal } from "@/store/use-premium-modal";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

/**
 * The course as one path, top to bottom. Each list is a stage; the stage the learner is on
 * opens into its levels, laid out as stepping stones with Koji standing on the next one.
 * Finished stages fold into a line that can be reopened to revise, the ones ahead wait in grey.
 */

const STEP = 96; // vertical distance between two stones
const SWAY = [0, 56, 84, 56, 0, -56, -84, -56]; // the winding of the trail, in px from the centre
const STONE_W = 76;
const STONE_H = 64;

type StoneState = "done" | "next" | "ahead";

function Stone({ state }: { state: StoneState }) {
  const face = state === "ahead" ? "#E9E9EF" : "#6967FB";
  const edge = state === "ahead" ? "#D2D2DC" : "#4A48D4";
  return (
    <span className="relative block" style={{ width: STONE_W, height: STONE_H + 8 }}>
      <span className="absolute inset-x-0 top-[8px] rounded-[50%]" style={{ height: STONE_H, background: edge }} />
      <span className="absolute inset-x-0 top-0 flex items-center justify-center rounded-[50%] text-white" style={{ height: STONE_H, background: face, boxShadow: state === "next" ? "0 0 0 7px rgba(105,103,251,.18)" : undefined }}>
        {state === "done" && <Check className="h-7 w-7" strokeWidth={3.2} aria-hidden />}
        {state === "next" && <Play className="h-6 w-6 translate-x-[1px]" strokeWidth={0} fill="currentColor" aria-hidden />}
        {state === "ahead" && <Lock className="h-5 w-5 text-[#A9A9B8]" strokeWidth={2.6} aria-hidden />}
      </span>
    </span>
  );
}

/** Room left above the stone Koji stands on, so he never covers the stone before it. */
const KOJI_ROOM = 50;

/** Top of each stone: evenly spaced, with extra room before the one Koji stands on. */
function tops(count: number, nextIndex: number): number[] {
  return Array.from({ length: count }, (_, i) => i * STEP + (nextIndex >= 0 && i >= nextIndex ? KOJI_ROOM : 0));
}

/** The trail drawn behind the stones: one smooth line through their centres. */
function Trail({ ys, doneUntil }: { ys: number[]; doneUntil: number }) {
  const cx = (i: number) => 180 + SWAY[i % SWAY.length];
  const cy = (i: number) => ys[i] + STONE_H / 2 + 4;
  const seg = (i: number) => {
    const mid = (cy(i + 1) - cy(i)) / 2;
    return `M ${cx(i)} ${cy(i)} C ${cx(i)} ${cy(i) + mid}, ${cx(i + 1)} ${cy(i + 1) - mid}, ${cx(i + 1)} ${cy(i + 1)}`;
  };
  return (
    <svg className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2" width={360} height={ys[ys.length - 1] + STONE_H + 8} aria-hidden>
      {ys.slice(0, -1).map((_, i) => (
        <path key={i} d={seg(i)} fill="none" stroke={i < doneUntil ? "#C8C7F0" : "#E6E6EE"} strokeWidth={10} strokeLinecap="round" strokeDasharray={i < doneUntil ? undefined : "2 18"} />
      ))}
    </svg>
  );
}

/** The stage in progress: its levels as stepping stones. */
function OpenStage({ list }: { list: VocabList }) {
  const t = useT();
  const levels = list.levels;
  const nextIndex = levels.findIndex((l) => !l.completed);
  const ys = tops(levels.length, nextIndex);
  return (
    <div className="relative mx-auto" style={{ width: 360, maxWidth: "100%", height: ys[ys.length - 1] + STONE_H + 8 + 12 }}>
      <Trail ys={ys} doneUntil={nextIndex < 0 ? levels.length : nextIndex} />
      {levels.map((level, i) => {
        const state: StoneState = level.completed ? "done" : i === nextIndex ? "next" : "ahead";
        const left = `calc(50% + ${SWAY[i % SWAY.length]}px - ${STONE_W / 2}px)`;
        const labelSide = SWAY[i % SWAY.length] >= 0 ? "right-full mr-3 text-right" : "left-full ml-3 text-left";
        const label = (
          <span className={`pointer-events-none absolute top-1/2 w-[120px] -translate-y-1/2 ${labelSide}`}>
            <span className={`block text-[0.9375rem] font-bold leading-tight ${state === "ahead" ? "text-[#A9A9B8]" : "text-brilliant-text"}`}>{tpl(t.common.levelN, { n: level.levelOrder })}</span>
            {state === "next" && level.completedChallengeCount > 0 && (
              <span className="mt-0.5 block text-[0.8125rem] font-medium tabular-nums text-brilliant-muted">{level.completedChallengeCount}/{level.challengeCount}</span>
            )}
          </span>
        );
        const body = (
          <>
            {state === "next" && (
              <span className="pointer-events-none absolute -top-[60px] left-1/2 block h-[72px] w-[72px] -translate-x-1/2" aria-hidden>
                <RiveAnim src="/animations/okok_clear.riv" animation="breath loop" crop={KOJI_CROP} />
              </span>
            )}
            <Stone state={state} />
            {label}
          </>
        );
        return state === "ahead" ? (
          <span key={level.id} className="absolute" style={{ left, top: ys[i] }} aria-label={`${tpl(t.common.levelN, { n: level.levelOrder })}`}>{body}</span>
        ) : (
          <Link key={level.id} href={`/lesson/${level.id}`} prefetch={state === "next"} className="absolute select-none transition-transform duration-100 active:translate-y-[4px]" style={{ left, top: ys[i] }} aria-current={state === "next" ? "step" : undefined}>
            {body}
          </Link>
        );
      })}
    </div>
  );
}

/** A stage folded into one line: finished (reopens to revise), or still ahead. */
function StageRow({ list, state }: { list: VocabList; state: "done" | "ahead" | "premium" }) {
  const t = useT();
  const openPremium = usePremiumModal((s) => s.open);
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: state === "done" ? "#6967FB" : "#EFEFF4", color: state === "done" ? "#fff" : "#A9A9B8" }}>
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
  // The stage in progress: the first list, in course order, with a level left to do.
  const current = units.flatMap((u) => u.lists).find((l) => l.completedLevels < l.totalLevels);

  return (
    <div className="mx-auto w-full max-w-md px-4 sm:px-0">
      {units.map((unit) => (
        <section key={unit.id} className="mb-10">
          <header className="rounded-3xl px-5 py-4" style={{ boxShadow: "inset 0 0 0 2px #6967FB" }}>
            <h2 className="font-heading text-[1.25rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>{unit.title}</h2>
            <p className="mt-0.5 text-[0.875rem] font-medium text-[#6967FB]">{unit.description}</p>
          </header>

          <div className="mt-3 flex flex-col">
            {unit.lists.map((list) => {
              const done = list.completedLevels >= list.totalLevels;
              if (list === current && !list.isPremiumLocked) {
                return (
                  <div key={list.listId} className="my-3 rounded-[28px] bg-[#F7F7FF] px-2 pb-6 pt-5">
                    <h3 className="text-center font-heading text-[1.1875rem] font-extrabold leading-tight text-brilliant-text" style={{ textWrap: "balance" as never }}>{list.listTitle}</h3>
                    <div className="mt-5"><OpenStage list={list} /></div>
                  </div>
                );
              }
              return <StageRow key={list.listId} list={list} state={done ? "done" : list.isPremiumLocked ? "premium" : "ahead"} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
