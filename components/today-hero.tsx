"use client";

import Link from "next/link";
import { Check, Flame, Sparkles, Trophy } from "lucide-react";

import type { StreakData } from "@/db/queries";
import { CountUp, StreakFlame } from "@/components/fx";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Bubble, KOJI_CROP, RiveAnim } from "@/app/(sales)/commencer/ui";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

export type NextLesson = { lessonId: number; level: number; listTitle: string; started: boolean };

type Props = {
  streakData: StreakData;
  points: number;
  doneLevels: number;
  totalLevels: number;
  next: NextLesson | null;
};

/**
 * Top of the home page: what to do today, in one glance. Koji says where the learner stands,
 * the daily goal shows whether today's lesson is done (the flame is lit when it is), the week
 * shows the streak, and one button resumes exactly where they stopped.
 */
export function TodayHero({ streakData, points, doneLevels, totalLevels, next }: Props) {
  const t = useT();
  const { streak, days } = streakData;
  const doneToday = days.some((d) => d.isToday && d.active);
  const hello = doneToday ? t.home.helloDone : streak > 1 ? tpl(t.home.helloStreak, { n: streak }) : streak === 1 ? t.home.helloStreakOne : t.home.helloNew;
  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <section className="px-4 pt-2 sm:px-0">
      {/* Koji and his line of the day */}
      <div className="flex items-center gap-3">
        <div className="h-[84px] w-[84px] shrink-0"><RiveAnim src="/animations/okok_clear.riv" animation="breath loop" crop={KOJI_CROP} /></div>
        <Bubble className="min-w-0 flex-1"><p className="font-heading text-[1.0625rem] font-bold leading-snug text-brilliant-text" style={{ textWrap: "balance" as never }}>{hello}</p></Bubble>
      </div>

      {/* Daily goal + week */}
      <div className="mt-4 rounded-3xl bg-[#F7F7FF] px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="relative h-[68px] w-[68px] shrink-0">
            <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="32" cy="32" r={R} fill="none" stroke="#E3E2FF" strokeWidth="6" />
              <circle cx="32" cy="32" r={R} fill="none" stroke={doneToday ? "#FF8A1F" : "#6967FB"} strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={doneToday ? 0 : C * 0.92} className="home-ring" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {doneToday ? <StreakFlame className="h-10 w-10" /> : <Flame className="h-7 w-7 text-[#C9C8E8]" strokeWidth={2.2} aria-hidden />}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase text-brilliant-muted" style={{ letterSpacing: "0.05em" }}>{t.home.goal}</p>
            <p className="mt-0.5 font-heading text-[1.25rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>
              {doneToday ? t.home.goalDone : t.home.goalTodo}
            </p>
          </div>
        </div>
        {days.length > 0 && (
          <div className="mt-4 flex items-center justify-between" aria-hidden>
            {days.map((d) => (
              <span key={d.date} className="flex flex-col items-center gap-1.5">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${d.active ? "" : d.isToday ? "bg-white" : "bg-[#ECECF8]"}`} style={d.active ? { background: "#FF8A1F", boxShadow: "0 2px 0 0 #E0680A" } : d.isToday ? { boxShadow: "inset 0 0 0 2px #C8C7F0" } : undefined}>
                  {d.active && <Check className="h-[18px] w-[18px]" strokeWidth={3} />}
                </span>
                <span className={`text-xs ${d.isToday ? "font-bold text-brilliant-text" : "text-brilliant-muted"}`}>{t.weekdays[d.weekday]}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* One action: resume where the learner stopped */}
      <div className="mt-4">
        {next ? (
          <Link href={`/lesson/${next.lessonId}`} className="block" prefetch>
            <ShinyButton variant="green" className="text-base">
              <span className="block py-1">{doneToday ? t.home.another : next.started ? t.home.continue : t.home.start}</span>
            </ShinyButton>
            <p className="mt-2 text-center text-sm text-brilliant-muted">{tpl(t.home.levelOf, { n: next.level, list: next.listTitle })}</p>
          </Link>
        ) : (
          <p className="text-center text-sm text-brilliant-muted">{t.home.allDone}</p>
        )}
      </div>

      {/* What has been earned so far */}
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Stat icon={<Sparkles className="h-5 w-5 text-[#6967FB]" strokeWidth={2.2} fill="currentColor" fillOpacity={0.14} aria-hidden />} value={points} label={t.home.statXp} />
        <Stat icon={<Flame className="h-5 w-5 text-[#F0641E]" strokeWidth={2.2} fill="currentColor" fillOpacity={0.14} aria-hidden />} value={streak} label={t.home.statStreak} />
        <Stat icon={<Trophy className="h-5 w-5 text-[#D9A400]" strokeWidth={2.2} fill="currentColor" fillOpacity={0.14} aria-hidden />} value={doneLevels} suffix={`/${totalLevels}`} label={t.home.statLevels} />
      </div>
    </section>
  );
}

function Stat({ icon, value, suffix, label }: { icon: React.ReactNode; value: number; suffix?: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl px-2 py-3" style={{ boxShadow: "inset 0 0 0 1.5px #E8E8E8" }}>
      {icon}
      <p className="mt-1.5 font-heading text-[1.25rem] font-extrabold leading-none text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>
        <CountUp value={value} duration={900} />{suffix && <span className="text-sm font-bold text-brilliant-muted">{suffix}</span>}
      </p>
      <p className="mt-1 text-xs text-brilliant-muted">{label}</p>
    </div>
  );
}
