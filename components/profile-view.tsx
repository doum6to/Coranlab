"use client";

import Link from "next/link";
import { Check, ChevronRight, GraduationCap, Settings, ShoppingBag, Sparkles, Trophy } from "lucide-react";

import type { StreakData } from "@/db/queries";
import { CountUp, StreakFlame } from "@/components/fx";
import { useT } from "@/lib/i18n/use-t";

type Props = {
  name: string;
  streakData: StreakData;
  points: number;
  doneLevels: number;
  totalLevels: number;
  isPro: boolean;
  hasArabicCourse: boolean;
};

/** The learner's own page: what they have built (streak, XP, levels) and where their things are. */
export function ProfileView({ name, streakData, points, doneLevels, totalLevels, isPro, hasArabicCourse }: Props) {
  const t = useT();
  const { streak, days } = streakData;
  const initial = (name.trim()[0] || "Q").toUpperCase();
  const links = [
    { href: "/boutique", label: t.home.linkShop, icon: <ShoppingBag className="h-5 w-5" strokeWidth={2} /> },
    ...(hasArabicCourse ? [{ href: "/ma-formation", label: t.home.linkCourse, icon: <GraduationCap className="h-5 w-5" strokeWidth={2} /> }] : []),
    ...(!isPro ? [{ href: "/premium", label: t.home.linkPremium, icon: <Sparkles className="h-5 w-5" strokeWidth={2} /> }] : []),
    { href: "/settings", label: t.home.linkSettings, icon: <Settings className="h-5 w-5" strokeWidth={2} /> },
  ];
  return (
    <div className="mx-auto w-full max-w-md px-4 pb-8 pt-2">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#6967FB] font-heading text-[1.375rem] font-bold text-white" aria-hidden>{initial}</span>
        <h1 className="min-w-0 flex-1 truncate font-heading text-[1.375rem] font-extrabold text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>{name}</h1>
      </div>

      {/* Streak */}
      <div className="mt-5 bg-white p-5" style={{ borderRadius: 28, boxShadow: "0 0 0 1px #EDEDF3, 0 14px 34px -18px rgba(74,72,212,.35)" }}>
        <div className="flex items-center gap-3">
          <StreakFlame className="h-14 w-14 shrink-0" />
          <div>
            <p className="font-heading text-[2.5rem] font-extrabold leading-none text-[#F0641E]" style={{ letterSpacing: "-0.03em" }}><CountUp value={streak} duration={800} /></p>
            <p className="mt-0.5 text-[0.875rem] font-semibold text-[#C2570C]">{streak > 1 ? t.home.profileStreak : t.home.profileStreakOne}</p>
          </div>
        </div>
        {days.length > 0 && (
          <div className="mt-4 flex items-center justify-between" aria-hidden>
            {days.map((d) => (
              <span key={d.date} className="flex flex-col items-center gap-1.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={d.active ? { background: "#FF8A1F", boxShadow: "0 2px 0 0 #E0680A" } : d.isToday ? { boxShadow: "inset 0 0 0 2px #C8C7F0", background: "#fff" } : { background: "#F1F1F6" }}>
                  {d.active && <Check className="h-5 w-5" strokeWidth={3} />}
                </span>
                <span className={`text-xs ${d.isToday ? "font-bold text-brilliant-text" : "text-brilliant-muted"}`}>{t.weekdays[d.weekday]}</span>
              </span>
            ))}
          </div>
        )}
        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden bg-[#E6E6EE]" style={{ borderRadius: 16 }}>
          <div className="bg-[#F7F7FB] px-3 py-3 text-center">
            <p className="flex items-center justify-center gap-1.5 font-heading text-[1.375rem] font-extrabold leading-none text-brilliant-text"><Sparkles className="h-[18px] w-[18px] text-[#6967FB]" strokeWidth={2.3} fill="currentColor" fillOpacity={0.14} aria-hidden /><CountUp value={points} duration={900} /></p>
            <p className="mt-1.5 text-[0.8125rem] text-brilliant-muted">{t.home.profileXp}</p>
          </div>
          <div className="bg-[#F7F7FB] px-3 py-3 text-center">
            <p className="flex items-center justify-center gap-1.5 font-heading text-[1.375rem] font-extrabold leading-none text-brilliant-text"><Trophy className="h-[18px] w-[18px] text-[#D9A400]" strokeWidth={2.3} fill="currentColor" fillOpacity={0.14} aria-hidden /><CountUp value={doneLevels} duration={900} /><span className="text-[0.9375rem] font-bold text-brilliant-muted">/{totalLevels}</span></p>
            <p className="mt-1.5 text-[0.8125rem] text-brilliant-muted">{t.home.profileLevels}</p>
          </div>
        </div>
      </div>

      {/* The learner's places */}
      <ul className="mt-6">
        {links.map((l, i) => (
          <li key={l.href} className={i ? "border-t border-[#EFEFF3]" : ""}>
            <Link href={l.href} className="flex min-h-[56px] items-center gap-3.5 px-1 text-brilliant-text transition-opacity active:opacity-60">
              <span className="text-[#6967FB]">{l.icon}</span>
              <span className="flex-1 text-[1rem] font-medium">{l.label}</span>
              <ChevronRight className="h-5 w-5 text-[#B9B9C3]" strokeWidth={2.2} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
