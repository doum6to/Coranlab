/**
 * Typed wrapper around the TikTok Pixel's `ttq` global.
 *
 * The pixel script is injected in `app/layout.tsx` via next/script with
 * strategy="afterInteractive", so there's a small window on first paint
 * where `window.ttq` isn't defined yet. The wrapper handles this with
 * a short retry loop, so the event is never silently dropped due to load
 * ordering.
 *
 * Debug: set localStorage.TTQ_DEBUG = "1" to log every fired event to
 * the console. Useful to verify the pixel is actually receiving events
 * after a purchase.
 */

export type TikTokContent = {
  content_id?: string;
  content_name?: string;
  content_type?: string;
  content_category?: string;
  quantity?: number;
  price?: number;
};

export type TikTokProps = {
  value?: number;
  currency?: "EUR" | "USD" | string;
  contents?: TikTokContent[];
  content_id?: string;
  content_name?: string;
  content_category?: string;
};

type TikTokEvent =
  | "ViewContent"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "CompletePayment"
  | "Subscribe"
  | "CompleteRegistration"
  | "StartTrial";

declare global {
  interface Window {
    ttq?: {
      track: (event: string, props?: Record<string, unknown>) => void;
      page: () => void;
    };
  }
}

const MAX_RETRY_MS = 5000;
const RETRY_INTERVAL_MS = 150;

function debug(...args: unknown[]) {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem("TTQ_DEBUG") === "1") {
      console.log("[ttq]", ...args);
    }
  } catch {
    /* ignore */
  }
}

export function ttqTrack(event: TikTokEvent, props?: TikTokProps) {
  if (typeof window === "undefined") return;

  const start = Date.now();

  const fire = () => {
    const ttq = window.ttq;
    if (ttq && typeof ttq.track === "function") {
      try {
        ttq.track(event, props as Record<string, unknown> | undefined);
        debug("fired", event, props);
      } catch (e) {
        debug("fire error", e);
      }
      return true;
    }
    return false;
  };

  // Fast path: pixel already loaded.
  if (fire()) return;

  // Retry path: poll every ~150ms for up to 5s. Pixel script usually
  // becomes available within a few hundred ms of `afterInteractive`.
  const interval = setInterval(() => {
    if (fire()) {
      clearInterval(interval);
      return;
    }
    if (Date.now() - start > MAX_RETRY_MS) {
      clearInterval(interval);
      debug("gave up waiting for ttq; event dropped:", event, props);
    }
  }, RETRY_INTERVAL_MS);
}
