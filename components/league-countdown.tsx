"use client";

import { useState, useEffect } from "react";
import { getNextResetTime } from "@/lib/league-utils";

export const LeagueCountdown = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const next = getNextResetTime();
      const diff = next.getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft("Bientôt...");
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);

      const parts = [];
      if (days > 0) parts.push(`${days}j`);
      parts.push(`${hours}h`);
      parts.push(`${minutes}m`);

      setTimeLeft(parts.join(" "));
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-brilliant-muted">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#999" strokeWidth="1.5" />
        <path d="M7 4V7L9 9" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span>Fin dans {timeLeft}</span>
    </div>
  );
};
