"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { CoranSample } from "@/lib/coran-landing-content";

/**
 * Clickable preview covers on /coran. A single tap on a cover opens the PDF
 * extract in a pop-up read inline (no leaving the page), closable with the ×
 * or by tapping the backdrop. A discreet "plein écran" link is kept as a
 * fallback for mobile browsers that can't render PDFs inline.
 */
export function CoranSamples({
  heading,
  samples,
}: {
  heading: string;
  samples: CoranSample[];
}) {
  const [open, setOpen] = useState<CoranSample | null>(null);
  const items = samples.filter((s) => s.cover || s.pdf);

  // Close on Escape + lock body scroll while the pop-up is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div className="mt-9">
      {heading && <h2 className="mb-3 font-display text-lg font-bold">{heading}</h2>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => s.pdf && setOpen(s)}
            disabled={!s.pdf}
            className="group relative block overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm disabled:cursor-default"
          >
            {s.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.cover}
                alt={s.title || "Aperçu"}
                className="aspect-[3/4] w-full object-cover transition duration-200 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
                PDF
              </div>
            )}
            {s.pdf && (
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-1.5 text-xs font-semibold text-white">
                📖 Lire l&apos;extrait
              </span>
            )}
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 sm:p-6"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-label={open.title || "Extrait PDF"}
        >
          <div
            className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-2.5">
              <span className="truncate text-sm font-semibold text-neutral-800">
                {open.title || "Extrait"}
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={open.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-neutral-400 underline hover:text-neutral-600"
                >
                  Plein écran
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Fermer"
                  className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <object
              data={`${open.pdf}#view=FitH`}
              type="application/pdf"
              className="min-h-0 flex-1 bg-neutral-100"
              aria-label={open.title || "Extrait PDF"}
            >
              {/* Fallback for browsers (mobile Safari, etc.) that can't embed PDFs */}
              <iframe
                src={`${open.pdf}#view=FitH`}
                title={open.title || "Extrait PDF"}
                className="h-full w-full bg-neutral-100"
              />
            </object>
          </div>
        </div>
      )}
    </div>
  );
}
