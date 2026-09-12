"use client";

import { useState } from "react";

import { track } from "@/lib/analytics/track";
import type { CmOption } from "@/lib/commencer-shared";

import { IconBadge, P } from "../ui";

/** One-tap attribution question asked AFTER the trial started (never inside the funnel). */
export function SourceQuestion({ headline, options }: { headline: string; options: CmOption[] }) {
  const [done, setDone] = useState<string | null>(null);
  if (options.length === 0) return null;
  if (done) return <p className="mt-8 text-[14px] font-semibold" style={{ color: P.purple }}>Merci ! 🙏</p>;
  return (
    <div className="mt-8 w-full max-w-sm">
      <p className="text-[15px] font-semibold" style={{ color: P.text }}>{headline}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => { setDone(o.id); track("commencer_source", o.id); }}
            className="flex items-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-left text-[14px] font-semibold"
            style={{ borderColor: P.border, color: P.text, background: "#fff" }}
          >
            <IconBadge name={o.icon} size={32} />
            <span className="min-w-0 flex-1 leading-tight">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
