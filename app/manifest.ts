import type { MetadataRoute } from "next";

/**
 * Web App Manifest — lets the site be installed to the home screen and launch
 * full-screen, like a native app (see components/add-to-home-tutorial.tsx).
 * Next.js serves this at /manifest.webmanifest and links it automatically.
 * The icons are Koji's eyes on the brand purple, as on the splash screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quranlab",
    short_name: "Quranlab",
    description: "Apprends 85% des mots du Coran",
    start_url: "/learn",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
