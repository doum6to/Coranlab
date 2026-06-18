import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor wraps the DEPLOYED Next.js site in a native iOS shell.
 *
 * Why a remote URL and not a static export? This app uses Next.js server
 * components / server actions / API routes, so it can't be exported to static
 * files. The native app therefore loads the live site (`server.url`) inside a
 * managed WebView. `webDir` is only a local fallback splash (mobile/www).
 *
 * The real iOS project lives in `ios/` and is generated + built in the cloud
 * (see codemagic.yaml) — no Mac required locally.
 */
const config: CapacitorConfig = {
  appId: process.env.CAPACITOR_APP_ID || "app.quranlab",
  appName: "Quranlab",
  webDir: "mobile/www",
  server: {
    // Override per build (Codemagic) with CAPACITOR_SERVER_URL.
    url: process.env.CAPACITOR_SERVER_URL || "https://quranlab.app",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
    // Lets the in-app browser / WebView keep the native status bar tidy.
    limitsNavigationsToAppBoundDomains: false,
  },
};

export default config;
