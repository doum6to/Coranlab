import { Capacitor } from "@capacitor/core";

/**
 * Runtime platform helpers. On the web (and during SSR) these all report
 * "not native", so the existing Stripe / Orange Money flows stay untouched in
 * the browser. They only flip to `true` inside the Capacitor iOS/Android shell.
 *
 * Use these CLIENT-SIDE (e.g. to swap the Stripe button for the Apple IAP
 * paywall when the user is inside the iOS app).
 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function isNativeIOS(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
}
