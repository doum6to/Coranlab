/**
 * A note the lesson leaves for the home page: "this level has just been finished". The home
 * page reads it once and plays the progress (the level validates, Koji moves on, the daily
 * goal lights up) instead of simply appearing in its new state.
 */
export type JustFinished = { lessonId: number; /** This lesson was the first of the day. */ firstToday: boolean };

const KEY = "ql_just_finished";
let held: JustFinished | undefined;

export function markJustFinished(value: JustFinished) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ ...value, at: Date.now() }));
  } catch { /* private mode: the home page simply appears without the animation */ }
}

/** Read by each part of the home page as it mounts; the note is gone for the next visit. */
export function takeJustFinished(): JustFinished | null {
  if (held) return held;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(KEY);
    const v = JSON.parse(raw) as JustFinished & { at: number };
    if (!Number.isInteger(v.lessonId) || Date.now() - v.at > 120_000) return null;
    held = { lessonId: v.lessonId, firstToday: !!v.firstToday };
    // Kept a moment so every part of the page mounting now gets it, then forgotten.
    window.setTimeout(() => { held = undefined; }, 4000);
    return held;
  } catch {
    return null;
  }
}
