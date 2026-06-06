"use client";

import { useState } from "react";

/**
 * Top-level dashboard tabs. Panels stay mounted (toggled with `hidden`) so
 * unsaved edits in one tab survive switching to another.
 */
export function AdminTabs({
  tabs,
}: {
  tabs: { key: string; label: string; node: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              active === t.key
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} className={active === t.key ? "" : "hidden"}>
          {t.node}
        </div>
      ))}
    </div>
  );
}
