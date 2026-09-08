"use client";

import { useEffect, useState } from "react";
import { X, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  editorial = false,
  readLabel = "Lire l’extrait",
}: {
  heading: string;
  samples: CoranSample[];
  editorial?: boolean;
  readLabel?: string;
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
  if (editorial) return <EditorialSamples heading={heading} samples={items} readLabel={readLabel} />;

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


/** The original PDFs remain the source of truth; the selected document opens
 * in an accessible dialog, with its native viewer and an external fallback. */
function EditorialSamples({ heading, samples, readLabel }: {
  heading: string; samples: CoranSample[]; readLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const activeIndex = Math.min(index, samples.length - 1);
  const sample = samples[activeIndex];
  const image = sample.cover ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={sample.cover} alt={sample.title || heading} loading="lazy"
      className="mx-auto h-auto max-h-[520px] w-auto max-w-full object-contain drop-shadow-xl" />
  ) : <span className="grid min-h-64 place-items-center font-serif text-5xl">PDF</span>;
  return (
    <div>
      {heading && <h2>{heading}</h2>}
      <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[1fr_1fr]">
        <div className="min-w-0 rounded-lg bg-white/60 p-8 sm:p-10">
          {sample.pdf ? <Dialog key={sample.pdf}>
            <DialogTrigger asChild>
              <button type="button" className="block w-full" data-coran-extract aria-label={`${readLabel || "Lire l’extrait"} — ${sample.title || heading}`}>{image}</button>
            </DialogTrigger>
            <DialogContent className="flex h-[85dvh] w-[calc(100%-24px)] max-w-4xl flex-col bg-white p-4 text-neutral-900" aria-describedby={undefined}>
              <DialogTitle className="pr-8">{sample.title || heading}</DialogTitle>
              <a href={sample.pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 self-start text-sm underline">Ouvrir le PDF <ExternalLink size={14} aria-hidden="true" /></a>
              <iframe src={`${sample.pdf}#view=FitH`} title={sample.title || heading} className="min-h-0 w-full flex-1 border-0 bg-neutral-100" />
            </DialogContent>
          </Dialog> : image}
        </div>
        <div className="min-w-0">
          <p className="text-sm tracking-widest" aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(samples.length).padStart(2, "0")}</p>
          {sample.title && <h3 className="my-5 text-3xl leading-tight">{sample.title}</h3>}
          {sample.pdf && <a href={sample.pdf} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-3 border-b border-current py-2 text-base">{readLabel || "Lire l’extrait"}<ExternalLink size={16} aria-hidden="true" /></a>}
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={() => setIndex(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Extrait précédent" className="grid h-12 w-12 place-items-center rounded-full border border-current disabled:opacity-30"><ArrowLeft size={20} /></button>
            <button type="button" onClick={() => setIndex(activeIndex + 1)} disabled={activeIndex === samples.length - 1} aria-label="Extrait suivant" className="grid h-12 w-12 place-items-center rounded-full border border-current disabled:opacity-30"><ArrowRight size={20} /></button>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {samples.map((item, i) => <button type="button" key={i} onClick={() => setIndex(i)} aria-pressed={activeIndex === i}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm ${activeIndex === i ? "border-current bg-white font-bold" : "border-transparent"}`}>
              {item.title || `${i + 1}`}
            </button>)}
          </div>
        </div>
      </div>
    </div>
  );
}
