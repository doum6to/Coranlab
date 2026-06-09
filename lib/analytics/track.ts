"use client";

/**
 * Minimal client-side event tracking for the landing. Fire-and-forget: uses
 * sendBeacon when available (survives navigation, e.g. before a checkout
 * redirect), falling back to fetch keepalive. Never throws.
 */
const SESSION_KEY = "ql_sid";

function getSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        (crypto.randomUUID && crypto.randomUUID()) ||
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "anon";
  }
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
