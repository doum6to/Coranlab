"use client";

import { useEffect, useState } from "react";

import { isNativeApp } from "@/lib/platform";

/**
 * Renders its children ONLY on the web — never inside the native (Capacitor)
 * app. Used to keep third-party advertising pixels (TikTok, Meta) out of the
 * iOS shell so Apple's App Tracking Transparency (ATT) isn't triggered and the
 * App Store privacy label can honestly declare "data not used to track you".
 *
 * The native check is only reliable client-side (Capacitor loads in the
 * WebView), so we render nothing until after mount. The pixels therefore never
 * appear in the native WebView; on the web they load right after hydration.
 */
export function WebOnly({ children }: { children: React.ReactNode }) {
  const [isWeb, setIsWeb] = useState(false);
  useEffect(() => setIsWeb(!isNativeApp()), []);
  return isWeb ? <>{children}</> : null;
}
