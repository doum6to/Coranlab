"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Play,
} from "lucide-react";

import type { ArabicCourseVideo } from "@/lib/arabic-course";
import { toEmbedSrc } from "@/lib/video-embed";

const STORAGE_KEY = "arabic_course_watched";
const GOLD = "#e0b34a";

function loadWatched(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function CoursePlayer({ videos }: { videos: ArabicCourseVideo[] }) {
  const [watched, setWatched] = useState<Set<number>>(loadWatched);
  // Resume on the first lesson that hasn't been watched yet.
  const [current, setCurrent] = useState(() => {
    const w = loadWatched();
    const idx = videos.findIndex((v) => !w.has(v.id));
    return idx === -1 ? 0 : idx;
  });

  const playerRef = useRef<HTMLDivElement>(null);
  const active = videos[current];

  const doneCount = useMemo(
    () => videos.filter((v) => watched.has(v.id)).length,
    [videos, watched],
  );
  const progress = videos.length
    ? Math.round((doneCount / videos.length) * 100)
    : 0;

  const persist = (next: Set<number>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      /* ignore */
    }
  };

  const markWatched = (id: number) => {
    setWatched((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persist(next);
      return next;
    });
  };

  const toggleWatched = (id: number) => {
    setWatched((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persist(next);
      return next;
    });
  };

  const select = (i: number) => {
    if (i < 0 || i >= videos.length) return;
    setCurrent(i);
    // On mobile, bring the player back into view when switching lessons.
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() =>
        playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };

  const activeDone = active ? watched.has(active.id) : false;

  return (
    <div className="px-4 pb-20 sm:px-6">
      {/* Course header */}
      <div className="overflow-hidden rounded-3xl bg-neutral-950 p-5 text-white sm:p-7">
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: GOLD }}
          >
            <GraduationCap className="h-6 w-6 text-neutral-900" />
          </span>
          <div className="min-w-0">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: GOLD }}
            >
              Formation vidéo
            </p>
            <h1 className="mt-0.5 text-xl font-extrabold leading-tight sm:text-2xl">
              Lire l&apos;arabe en 7h
            </h1>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-white/70">
              {doneCount} / {videos.length} leçons terminées
            </span>
            <span style={{ color: GOLD }}>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: GOLD }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Player + controls */}
        <div ref={playerRef} className="scroll-mt-[60px]">
          <div className="overflow-hidden rounded-2xl bg-black shadow-sm">
            {active?.url ? (
              active.kind === "embed" ? (
                <iframe
                  key={active.id}
                  src={toEmbedSrc(active.url)}
                  title={active.title}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={active.id}
                  src={active.url}
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  onEnded={() => active && markWatched(active.id)}
                  className="aspect-video w-full"
                />
              )
            ) : (
              <div className="flex aspect-video w-full items-center justify-center text-sm text-white/70">
                Vidéo indisponible.
              </div>
            )}
          </div>

          {/* Lesson meta */}
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full bg-[#6967fb]/10 px-2.5 py-1 text-xs font-bold text-[#6967fb]">
              Leçon {current + 1} / {videos.length}
            </span>
            {activeDone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                <Check className="h-3.5 w-3.5" /> Terminée
              </span>
            )}
          </div>
          <h2 className="mt-2 text-xl font-bold text-brilliant-text">
            {active?.title}
          </h2>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => select(current - 1)}
              disabled={current === 0}
              className="inline-flex items-center gap-1 rounded-xl border-2 border-brilliant-border px-3 py-2 text-sm font-bold text-brilliant-text transition hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </button>

            <button
              onClick={() => active && toggleWatched(active.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${
                activeDone
                  ? "border-2 border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-2 border-brilliant-border text-brilliant-text hover:bg-gray-50"
              }`}
            >
              <Check className="h-4 w-4" />
              {activeDone ? "Terminée" : "Marquer comme vue"}
            </button>

            <button
              onClick={() => select(current + 1)}
              disabled={current >= videos.length - 1}
              className="ml-auto inline-flex items-center gap-1 rounded-xl bg-[#6967fb] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Lesson list */}
        <aside className="rounded-2xl border border-brilliant-border bg-white lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center justify-between border-b border-brilliant-border px-4 py-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-brilliant-text">
              Programme
            </h3>
            <span className="text-xs font-semibold text-brilliant-muted">
              {videos.length} leçons
            </span>
          </div>
          <ul className="divide-y divide-brilliant-border lg:max-h-[68vh] lg:overflow-y-auto">
            {videos.map((v, i) => {
              const isActive = i === current;
              const done = watched.has(v.id);
              return (
                <li key={v.id}>
                  <button
                    onClick={() => select(i)}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-gray-50 ${
                      isActive ? "bg-amber-50/70" : ""
                    }`}
                    style={
                      isActive
                        ? { boxShadow: `inset 3px 0 0 0 ${GOLD}` }
                        : undefined
                    }
                  >
                    {/* status / number */}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? "bg-emerald-500 text-white"
                          : isActive
                            ? "text-neutral-900"
                            : "bg-gray-100 text-brilliant-muted"
                      }`}
                      style={
                        isActive && !done
                          ? { backgroundColor: GOLD }
                          : undefined
                      }
                    >
                      {done ? (
                        <Check className="h-4 w-4" />
                      ) : isActive ? (
                        <Play className="h-3.5 w-3.5 fill-neutral-900" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span
                      className={`flex-1 text-sm leading-snug ${
                        isActive
                          ? "font-bold text-brilliant-text"
                          : done
                            ? "font-medium text-brilliant-muted"
                            : "font-medium text-brilliant-text"
                      }`}
                    >
                      {v.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
