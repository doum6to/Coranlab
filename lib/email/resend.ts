import { Resend } from "resend";

// Lazy init so the module can be imported during build without RESEND_API_KEY.
// The key is only required at runtime when we actually send an email.
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local and your Vercel environment."
    );
  }
  _resend = new Resend(key);
  return _resend;
}
