import "server-only";
import crypto from "crypto";

/**
 * Stateless unsubscribe tokens for lead emails. We sign the (lowercased) email
 * with an HMAC so the unsubscribe link needs no per-lead token stored in the DB
 * and can't be forged. Falls back to CRON_SECRET, then a constant, so it always
 * works even if a dedicated secret isn't set.
 */
const SECRET =
  process.env.LEAD_UNSUB_SECRET || process.env.CRON_SECRET || "quranlab-leads-unsub";

export function signEmail(email: string): string {
  const e = email.trim().toLowerCase();
  return crypto.createHmac("sha256", SECRET).update(e).digest("hex").slice(0, 32);
}

export function verifyEmailToken(email: string, token: string): boolean {
  if (!token) return false;
  const expected = signEmail(email);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Builds the absolute unsubscribe URL for a lead email. */
export function unsubscribeUrl(email: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.quranlab.app";
  const e = encodeURIComponent(email.trim().toLowerCase());
  return `${base}/api/leads/unsubscribe?e=${e}&t=${signEmail(email)}`;
}
