import { Plus } from "lucide-react";

import type { LandingFaq } from "@/lib/landing-content";

export function Faq({ items }: { items: LandingFaq[] }) {
  return (
    <div className="divide-y divide-neutral-200/70 border-y border-neutral-200/70">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
            <span className="font-display text-lg font-semibold text-neutral-950">
              {item.q}
            </span>
            <Plus
              className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-45"
              strokeWidth={1.5}
            />
          </summary>
          <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-neutral-600">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
