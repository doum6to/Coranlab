import crypto from "crypto";

/**
 * TikTok Events API (server-side) — the gold-standard way to report
 * conversions. Unaffected by ad blockers, iOS tracking prevention, or
 * client-side timing races.
 *
 * Setup:
 *   1. TikTok Business Center → Events Manager → your pixel
 *      → Settings → Events API → "Generate Access Token"
 *   2. Add env vars on Vercel:
 *        TIKTOK_PIXEL_ID = D2EE5VRC77U9TM002EK0
 *        TIKTOK_ACCESS_TOKEN = <the generated token>
 *   3. Call `ttqServerTrack()` from webhooks or server actions when a
 *      critical conversion (purchase, trial start) occurs.
 *
 * When `TIKTOK_ACCESS_TOKEN` is missing, the helper no-ops and logs once
 * so nothing blows up in dev.
 *
 * Ref: https://business-api.tiktok.com/portal/docs?id=1741601162187777
 */

type ServerEvent =
  | "ViewContent"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "CompletePayment"
  | "Subscribe"
  | "CompleteRegistration"
  | "StartTrial";

type ServerEventPayload = {
  /** ISO timestamp of when the event happened. Defaults to now. */
  event_time?: number;
  /** Unique ID to dedup client+server events. Recommended: stripe session id. */
  event_id?: string;
  /** Email of the user (hashed before sending). */
  email?: string;
  /** Optional user IP (from req headers). */
  ip?: string;
  /** Optional user agent (from req headers). */
  userAgent?: string;
  /** Monetary fields */
  value?: number;
  currency?: string;
  contentId?: string;
  contentName?: string;
  contentCategory?: string;
};

function sha256Lower(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

let warnedMissingToken = false;

export async function ttqServerTrack(
  event: ServerEvent,
  payload: ServerEventPayload = {}
): Promise<void> {
  const pixelId = process.env.TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    if (!warnedMissingToken) {
      console.warn(
        "[ttqServer] TIKTOK_PIXEL_ID or TIKTOK_ACCESS_TOKEN missing — server-side tracking disabled."
      );
      warnedMissingToken = true;
    }
    return;
  }

  const eventTime =
    payload.event_time ?? Math.floor(Date.now() / 1000);

  const user: Record<string, unknown> = {};
  if (payload.email) user.email = [sha256Lower(payload.email)];
  if (payload.ip) user.ip = payload.ip;
  if (payload.userAgent) user.user_agent = payload.userAgent;

  const properties: Record<string, unknown> = {};
  if (payload.value !== undefined) properties.value = payload.value;
  if (payload.currency) properties.currency = payload.currency;
  if (payload.contentId || payload.contentName) {
    properties.contents = [
      {
        ...(payload.contentId && { content_id: payload.contentId }),
        ...(payload.contentName && { content_name: payload.contentName }),
        ...(payload.contentCategory && {
          content_category: payload.contentCategory,
        }),
      },
    ];
  }

  const body = {
    event_source: "web",
    event_source_id: pixelId,
    data: [
      {
        event: event,
        event_time: eventTime,
        ...(payload.event_id && { event_id: payload.event_id }),
        ...(Object.keys(user).length && { user }),
        ...(Object.keys(properties).length && { properties }),
      },
    ],
  };

  try {
    const res = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": accessToken,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `[ttqServer] ${event} failed — ${res.status} ${text.slice(0, 300)}`
      );
      return;
    }

    const json: any = await res.json().catch(() => null);
    if (json?.code !== 0) {
      console.error(`[ttqServer] ${event} API error:`, json);
    }
  } catch (err) {
    console.error(`[ttqServer] ${event} fetch error:`, err);
  }
}
