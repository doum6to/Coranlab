/**
 * Tiny typed wrapper around the TikTok Pixel's `ttq` global.
 *
 * The pixel script is injected in `app/layout.tsx` via next/script. Because
 * the script is loaded `afterInteractive`, there's a small window on first
 * paint where `window.ttq` isn't defined yet. The wrapper buffers calls
 * into `ttq` (which itself queues its own calls via `setAndDefer`), so this
 * is safe to call anywhere on the client.
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
  // Flat alias fields, useful on single-item events
  content_id?: string;
  content_name?: string;
  content_category?: string;
};

// Events we actually use. Keep this union narrow on purpose.
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

export function ttqTrack(event: TikTokEvent, props?: TikTokProps) {
  if (typeof window === "undefined") return;
  const ttq = window.ttq;
  if (!ttq || typeof ttq.track !== "function") return;
  try {
    ttq.track(event, props as Record<string, unknown> | undefined);
  } catch {
    /* swallow — analytics must never break the UI */
  }
}
