import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Lightweight auth for the /admin portal, fully separate from Supabase user
 * auth. Credentials live in env vars (never in code/repo):
 *   ADMIN_USERNAME, ADMIN_PASSWORD
 *
 * On login we set an httpOnly cookie holding a SHA-256 of "user:pass" — the
 * raw password is never stored in the cookie. Every admin page/action
 * re-derives that hash from the env vars and compares (timing-safe).
 */
const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function creds() {
  return {
    username: process.env.ADMIN_USERNAME || "",
    password: process.env.ADMIN_PASSWORD || "",
  };
}

export function adminConfigured() {
  const { username, password } = creds();
  return !!username && !!password;
}

function expectedToken() {
  const { username, password } = creds();
  return crypto
    .createHash("sha256")
    .update(`${username}:${password}`)
    .digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function verifyCredentials(username: string, password: string) {
  const { username: u, password: p } = creds();
  if (!u || !p) return false;
  return safeEqual(`${username}:${password}`, `${u}:${p}`);
}

export function setAdminCookie() {
  cookies().set(COOKIE, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearAdminCookie() {
  cookies().delete(COOKIE);
}

/** Read-only — safe to call from server components. */
export function isAdminAuthed() {
  if (!adminConfigured()) return false;
  const token = cookies().get(COOKIE)?.value;
  if (!token) return false;
  return safeEqual(token, expectedToken());
}
