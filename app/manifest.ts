import type { MetadataRoute } from "next";

/**
 * Web App Manifest — lets the site be installed to the home screen and launch
 * full-screen, like a native app (see components/add-to-home-tutorial.tsx).
 * Next.js serves this at /manifest.webmanifest and links it automatically.
 *
 * TODO: add proper square PNG icons (192x192 and 512x512, incl. a maskable one)
 * in /public for the sharpest home-screen icon. quranlab-logo.png is a fallback.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quranlab",
    short_name: "Quranlab",
    description: "Apprends 85% des mots du Coran",
    start_url: "/learn",
    display: "standalone",
    background_color: "#FAF8F3",
    theme_color: "#6967FB",
    icons: [
      { src: "/quranlab-logo.png", sizes: "any", type: "image/png", purpose: "any" },
      { src: "/quranlab-logo.png", sizes: "any", type: "image/png", purpose: "maskable" },
    ],
  };
}
