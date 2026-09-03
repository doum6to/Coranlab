"use client";

import { useEffect, useState } from "react";

import { ttqTrack } from "@/lib/analytics/tiktok";
import type { DownloadLinks } from "@/lib/download-links";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  // iPadOS 13+ reports as Mac with touch support.
  if (/ipad|iphone|ipod/i.test(ua)) return "ios";
  if (/Macintosh/.test(ua) && "ontouchend" in document) return "ios";
  return "other";
}

/**
 * Smart download redirect. Detects the device, fires the TikTok pixel, then
 * sends the visitor to the right store (or the fallback). A manual button is
 * always shown so it works even inside TikTok's in-app browser, where an
 * auto-redirect can be blocked.
 */
export function Redirector({ links }: { links: DownloadLinks }) {
  const [target, setTarget] = useState<string>(links.fallbackUrl);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);

    const dest =
      p === "ios" && links.appStoreUrl
        ? links.appStoreUrl
        : p === "android" && links.playStoreUrl
          ? links.playStoreUrl
          : links.fallbackUrl;
    setTarget(dest);

    // Signal the click to TikTok before leaving (ViewContent = closest allowed
    // standard event for a download intent).
    ttqTrack("ViewContent", {
      content_name: "app_download",
      content_category: p,
    });

    // Give the pixel a moment, then redirect.
    const t = setTimeout(() => {
      window.location.replace(dest);
    }, 900);
    return () => clearTimeout(t);
  }, [links]);

  const label =
    platform === "ios"
      ? "Ouvrir l'App Store"
      : platform === "android"
        ? "Ouvrir le Play Store"
        : "Continuer";

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center px-6 text-center"
      style={{ background: "radial-gradient(120% 80% at 50% 12%, #16513b 0%, #0e3527 45%, #0a2119 100%)", color: "#F6F1E7" }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.35em]" style={{ color: "#E9C46A" }}>
        Quranlab
      </p>

      <div
        className="mt-8 h-10 w-10 animate-spin rounded-full border-2 border-white/20"
        style={{ borderTopColor: "#E9C46A" }}
        aria-hidden
      />

      <h1 className="mt-8 max-w-sm text-2xl font-bold">Redirection en cours…</h1>
      <p className="mt-2 max-w-xs text-sm text-white/70">
        Tu vas être redirigé vers le téléchargement. Si rien ne se passe :
      </p>

      <a
        href={target}
        onClick={() => ttqTrack("ViewContent", { content_name: "app_download_manual", content_category: platform })}
        className="mt-5 inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-bold"
        style={{ backgroundColor: "#E9C46A", color: "#0a2119" }}
      >
        {label} →
      </a>

      <p className="mt-6 max-w-xs text-xs text-white/50">
        Astuce : si tu es dans l&apos;application TikTok/Instagram, ouvre ce lien dans
        Safari ou Chrome (menu «&nbsp;•••&nbsp;» → «&nbsp;Ouvrir dans le navigateur&nbsp;»).
      </p>
    </div>
  );
}
