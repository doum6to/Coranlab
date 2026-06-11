/**
 * Preload links for the Rive mascot animations. Rendered ONLY on the surfaces
 * that actually play them (app layout, onboarding) — they used to live in the
 * root layout, which made every page (including the ad landings) download
 * seven .riv files up-front, starving the LCP image on slow mobile networks.
 *
 * Browsers honor <link rel="preload"> in the body, so this can be dropped
 * anywhere in a page/layout tree.
 */
const RIVE_FILES = [
  "/animations/hi_ok.riv",
  "/animations/okok.riv",
  "/animations/eyes_down.riv",
  "/animations/mascot_breath.riv",
  "/animations/completed_lvl.riv",
  "/animations/loading.riv",
  "/animations/bad.riv",
];

export function RivePreloads() {
  return (
    <>
      {RIVE_FILES.map((href) => (
        <link
          key={href}
          rel="preload"
          href={href}
          as="fetch"
          crossOrigin="anonymous"
          type="application/octet-stream"
        />
      ))}
    </>
  );
}
