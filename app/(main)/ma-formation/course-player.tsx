"use client";

import { useState } from "react";
import { CheckCircle2, PlayCircle } from "lucide-react";

import type { ArabicCourseVideo } from "@/lib/arabic-course";
import { toEmbedSrc } from "@/lib/video-embed";

const STORAGE_KEY = "arabic_course_watched";

function loadWatched(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function CoursePlayer({ videos }: { videos: ArabicCourseVideo[] }) {
  const [current, setCurrent] = useState(0);
  const [watched, setWatched] = useState<Set<number>>(loadWatched);

  const active = videos[current];

  const markWatched = (id: number) => {
    setWatched((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div className="px-4 pb-16 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-brilliant-text">Ma formation</h1>
      <p className="mb-6 text-sm text-brilliant-muted">Lire l&apos;arabe en 7h</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Player */}
        <div>
          <div className="overflow-hidden rounded-2xl bg-black">
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
          <h2 className="mt-4 text-lg font-bold text-brilliant-text">
            {active?.title}
          </h2>
        </div>

        {/* Playlist */}
        <aside className="rounded-2xl border border-brilliant-border bg-white">
          <div className="border-b border-brilliant-border px-4 py-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-brilliant-text">
              {videos.length} chapitres
            </h3>
          </div>
          <ul className="max-h-[70vh] divide-y divide-brilliant-border overflow-y-auto">
            {videos.map((v, i) => {
              const isActive = i === current;
              const done = watched.has(v.id);
              return (
                <li key={v.id}>
                  <button
                    onClick={() => setCurrent(i)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${
                      isActive ? "bg-[#6967fb]/5" : ""
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <PlayCircle
                        className={`h-5 w-5 shrink-0 ${
                          isActive ? "text-[#6967fb]" : "text-brilliant-muted"
                        }`}
                      />
                    )}
                    <span
                      className={`flex-1 text-sm ${
                        isActive
                          ? "font-bold text-brilliant-text"
                          : "font-medium text-brilliant-muted"
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
