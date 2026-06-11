"use client";

/**
 * Minimal client-side event tracking for the landing. Fire-and-forget: uses
 * sendBeacon when available (survives navigation, e.g. before a checkout
 * redirect), falling back to fetch keepalive. Never throws.
 */
const SESSION_KEY = "ql_sid";

/** Random id (UUID when available, else a good-enough fallback). */
function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// In-memory id generated once per page load — last-resort bucket so that
// visitors with blocked storage don't ALL merge into one.
let memoryId: string | null = null;

/**
 * Anonymous id for visitor counting. Tries localStorage, then sessionStorage,
 * then a per-load in-memory id. The old version returned a CONSTANT "anon"
 * when storage threw — which is exactly what happens in TikTok's in-app
 * browser (storage partitioned/blocked), so every ad visitor was merged into
 * a single "unique visitor". This fallback keeps real visitors distinct.
 */
function getSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = randomId();
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    /* storage blocked — fall through */
  }
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = randomId();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    /* fall through */
  }
  if (!memoryId) memoryId = randomId();
  return memoryId;
}

export function track(event: string, meta?: string) {
  try {
    const payload = JSON.stringify({
      event,
      path: typeof location !== "undefined" ? location.pathname : undefined,
      locale: document?.documentElement?.lang || undefined,
      sessionId: getSessionId(),
      meta,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([payload], { type: "application/json" }),
      );
    } else {
      fetch("/api/track", {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}
