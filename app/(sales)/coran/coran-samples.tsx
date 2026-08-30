"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type { CoranSample } from "@/lib/coran-landing-content";

/**
 * Clickable preview covers on /coran. Tapping a cover opens the PDF extract in
 * a full-screen viewer (iframe), with a fallback "open in new tab" link for
 * mobile browsers that don't render PDFs inline.
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
          className="fixed inset-0 z-[120] flex flex-col bg-black/80"
          onClick={() => setOpen(null)}
        >
          <div className="flex items-center justify-between gap-3 p-3 text-white">
            <span className="truncate text-sm font-semibold">
              {open.title || "Extrait"}
            </span>
            <div className="flex items-center gap-3">
              <a
                href={open.pdf}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold underline"
              >
                Ouvrir
              </a>
              <button
                onClick={() => setOpen(null)}
                aria-label="Fermer"
                className="rounded-full p-1 hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="flex-1 px-2 pb-3" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`${open.pdf}#view=FitH`}
              title={open.title || "Extrait PDF"}
              className="h-full w-full rounded-lg bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
