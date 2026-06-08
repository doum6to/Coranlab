"use client";

import { useState, useEffect } from "react";
import { getNextResetTime } from "@/lib/league-utils";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

export const LeagueCountdown = () => {
  const t = useT();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const next = getNextResetTime();
      const diff = next.getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft(t.league.countdownSoon);
        return;
      }

      // Show days only (rounded up so the last day still shows "1j")
      const days = Math.ceil(diff / 86400000);

      if (days <= 1) {
        setTimeLeft(t.league.countdownLessThanDay);
      } else {
        setTimeLeft(tpl(t.league.countdownDays, { n: days }));
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [t]);

  return (
    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-brilliant-muted">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#999" strokeWidth="1.5" />
        <path d="M7 4V7L9 9" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span>{tpl(t.league.countdownEndsIn, { time: timeLeft })}</span>
    </div>
  );
};
