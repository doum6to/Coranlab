"use client";

import { useSyncExternalStore } from "react";

import { transliterate } from "@/lib/translit";
import { useT } from "@/lib/i18n/use-t";
import { cn } from "@/lib/utils";

const PREF_KEY = "ql_translit";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setTranslitOn(on: boolean) {
  try {
    window.localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {}
  listeners.forEach((l) => l());
}

/** Whether the phonetic reading is shown under Arabic words (on by default). */
export function useTranslitOn(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => { listeners.delete(cb); };
    },
    read,
    () => true,
  );
}

/**
 * Phonetic reading of an Arabic word, for learners who cannot read the script
 * yet. Shown wherever the word is shown, from the start. `reveal={false}` blanks
 * the line while keeping its place, for the moments the word itself is hidden.
 */
export function Translit({ arabic, className, reveal = true }: { arabic: string | null | undefined; className?: string; reveal?: boolean }) {
  const on = useTranslitOn();
  if (!on) return null;
  const text = transliterate(arabic);
  if (!text) return null;
  return (
    <span dir="ltr" lang="ar-Latn" aria-hidden={!reveal} className={cn("block text-center text-xs font-medium italic leading-tight text-[#6B6B76] transition-opacity duration-200", !reveal && "invisible opacity-0", className)}>
      {text}
    </span>
  );
}

/** Header switch for the phonetic reading. */
export function TranslitToggle({ className }: { className?: string }) {
  const t = useT();
  const on = useTranslitOn();
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? t.audio.translitOff : t.audio.translitOn}
      title={on ? t.audio.translitOff : t.audio.translitOn}
      onClick={() => setTranslitOn(!on)}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-2.5 text-[13px] font-bold transition hover:bg-neutral-100",
        on ? "text-[#6967FB]" : "text-brilliant-muted line-through decoration-2",
        className,
      )}
    >
      abc
    </button>
  );
}
