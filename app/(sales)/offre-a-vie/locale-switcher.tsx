import Link from "next/link";
import { Globe } from "lucide-react";

import { LOCALES, offerPath, type Locale } from "@/lib/i18n/locales";

/** Compact FR · EN · ES switcher linking to each locale's product landing. */
export function LocaleSwitcher({ current }: { current: Locale }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Globe className="h-3.5 w-3.5 text-neutral-400" strokeWidth={2} />
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-neutral-300">·</span>}
          <Link
            href={offerPath(l)}
            aria-current={l === current ? "true" : undefined}
            className={
              l === current
                ? "font-bold text-neutral-900"
                : "text-neutral-400 hover:text-neutral-700"
            }
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
