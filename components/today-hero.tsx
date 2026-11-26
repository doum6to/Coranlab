"use client";

import Link from "next/link";
import { Check, Flame } from "lucide-react";

import type { StreakData } from "@/db/queries";
import { StreakFlame } from "@/components/fx";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Bubble, KOJI_CROP, RiveAnim } from "@/app/(sales)/commencer/ui";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

export type NextLesson = {
  lessonId: number;
  /** Level the learner is on in this list (1-based), and how many the list has. */
  level: number;
  levels: number;
  listTitle: string;
  unitTitle: string;
  started: boolean;
};

type Props = { streakData: StreakData; next: NextLesson | null };

/**
 * Top of the home page: one thing to do today. Koji says where the learner stands, a single
 * card resumes the path exactly where they stopped, and the daily goal lights its flame once
 * today's lesson is done. Figures to be proud of (XP, levels) live in the profile.
 */
export function TodayHero({ streakData, next }: Props) {
  const t = useT();
  const { streak, days } = streakData;
  const doneToday = days.some((d) => d.isToday && d.active);
  const hello = doneToday ? t.home.helloDone : streak > 1 ? tpl(t.home.helloStreak, { n: streak }) : streak === 1 ? t.home.helloStreakOne : t.home.helloNew;
  const R = 20;
  const C = 2 * Math.PI * R;

  return (
    <section className="px-4 pt-2 sm:px-0">
      <div className="flex items-center gap-3">
        <div className="h-[84px] w-[84px] shrink-0"><RiveAnim src="/animations/okok_clear.riv" animation="breath loop" crop={KOJI_CROP} /></div>
        <Bubble className="min-w-0 flex-1"><p className="font-heading text-[1.0625rem] font-bold leading-snug text-brilliant-text" style={{ textWrap: "balance" as never }}>{hello}</p></Bubble>
      </div>

      {/* The next step of the path: one card, one action */}
      <div className="mt-5 bg-white p-5" style={{ borderRadius: 28, boxShadow: "0 0 0 1px #EDEDF3, 0 14px 34px -18px rgba(74,72,212,.35)" }}>
        {next ? (
          <>
            <p className="text-[0.8125rem] font-medium text-brilliant-muted">{next.unitTitle}</p>
            <h2 className="mt-0.5 font-heading text-[1.375rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em", textWrap: "balance" as never }}>{next.listTitle}</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex flex-1 gap-1.5" aria-hidden>
                {Array.from({ length: next.levels }, (_, k) => (
                  <span key={k} className="h-2 flex-1 rounded-full" style={{ background: k < next.level - 1 ? "#6967FB" : k === next.level - 1 ? "#C8C7F0" : "#EDEDED" }} />
                ))}
              </div>
              <span className="shrink-0 text-[0.8125rem] font-semibold text-brilliant-text" style={{ fontVariantNumeric: "tabular-nums" }}>{tpl(t.home.levelCount, { n: next.level, total: next.levels })}</span>
            </div>
            <Link href={`/lesson/${next.lessonId}`} className="mt-5 block" prefetch>
              <ShinyButton variant="green" className="text-base">
                <span className="block py-1">{doneToday ? t.home.another : next.started ? t.home.continue : t.home.start}</span>
              </ShinyButton>
            </Link>
          </>
        ) : (
          <p className="text-center text-[0.9375rem] text-brilliant-muted">{t.home.allDone}</p>
        )}
      </div>

      {/* Daily goal, then the last days on their own row (five circles need the full width) */}
      <div className="mt-4 px-4 py-4" style={{ borderRadius: 24, background: "#F7F7FF" }}>
        <div className="flex items-center gap-3.5">
          <div className="relative h-12 w-12 shrink-0">
            <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="24" cy="24" r={R} fill="none" stroke="#E3E2FF" strokeWidth="4" />
              {doneToday && <circle cx="24" cy="24" r={R} fill="none" stroke="#FF8A1F" strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={0} />}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {doneToday ? <StreakFlame className="h-7 w-7" /> : <Flame className="h-[22px] w-[22px] text-[#C3C2E6]" strokeWidth={2.2} aria-hidden />}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.8125rem] font-medium text-brilliant-muted">{t.home.goal}</p>
            <p className="font-heading text-[1.0625rem] font-bold leading-tight text-brilliant-text">{doneToday ? t.home.goalDone : t.home.goalTodo}</p>
          </div>
        </div>
        {days.length > 0 && (
          <div className="mt-4 flex items-center justify-between" aria-hidden>
            {days.map((d) => (
              <span key={d.date} className="flex flex-col items-center gap-1.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={d.active ? { background: "#FF8A1F", boxShadow: "0 2px 0 0 #E0680A" } : d.isToday ? { boxShadow: "inset 0 0 0 2px #C8C7F0", background: "#fff" } : { background: "#E9E8F6" }}>
                  {d.active && <Check className="h-[18px] w-[18px]" strokeWidth={3} />}
                </span>
                <span className={`text-xs ${d.isToday ? "font-bold text-brilliant-text" : "text-brilliant-muted"}`}>{t.weekdays[d.weekday]}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
