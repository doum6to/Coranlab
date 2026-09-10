/**
 * "Editorial paper" design system used by the new Quranlab funnels (/coran
 * restyle, /commencer onboarding). Cream paper + espresso + pastel pink,
 * Playfair Display / Bodoni Moda serif headlines, Jost sans body & labels,
 * Jomhuria for ALL Arabic (Amiri as a fallback for long, small verses).
 *
 * Fonts are served from /public/fonts (no build-time fetch). Inject
 * `DA_FONT_CSS` once per page via a <style> tag; use the `da-*` classes and
 * CSS variables below. Client-safe (no server imports).
 */

export const DA = {
  paper: "#EFE9DE",
  paperDeep: "#E7E0D2",
  espresso: "#3A281F",
  espressoSoft: "#5B4A40",
  pink: "#F3B6C4",
  pinkDeep: "#E89DB0",
  ink: "#2B1D16",
  muted: "#8B7D74",
  line: "#D9D0C1",
} as const;

const face = (family: string, file: string, weight: number, style: "normal" | "italic" = "normal") =>
  `@font-face{font-family:'${family}';src:url('/fonts/${file}') format('woff2');font-weight:${weight};font-style:${style};font-display:swap}`;

export const DA_FONT_CSS = [
  face("Playfair", "playfair-display-latin-400-normal.woff2", 400),
  face("Playfair", "playfair-display-latin-700-normal.woff2", 700),
  face("Playfair", "playfair-display-latin-900-normal.woff2", 900),
  face("Playfair", "playfair-display-latin-400-italic.woff2", 400, "italic"),
  face("Playfair", "playfair-display-latin-700-italic.woff2", 700, "italic"),
  face("Bodoni", "bodoni-moda-latin-400-normal.woff2", 400),
  face("Bodoni", "bodoni-moda-latin-700-normal.woff2", 700),
  face("Bodoni", "bodoni-moda-latin-400-italic.woff2", 400, "italic"),
  face("Jost", "jost-latin-400-normal.woff2", 400),
  face("Jost", "jost-latin-500-normal.woff2", 500),
  face("Jost", "jost-latin-600-normal.woff2", 600),
  face("Jost", "jost-latin-700-normal.woff2", 700),
  face("Jomhuria", "jomhuria-arabic-400-normal.woff2", 400),
  face("Amiri", "amiri-arabic-400-normal.woff2", 400),
  face("Amiri", "amiri-arabic-700-normal.woff2", 700),
  // Subtle paper grain via SVG noise (data URI) — used by .da-paper.
  `.da{--paper:${DA.paper};--paper-deep:${DA.paperDeep};--espresso:${DA.espresso};--espresso-soft:${DA.espressoSoft};--pink:${DA.pink};--pink-deep:${DA.pinkDeep};--ink:${DA.ink};--muted:${DA.muted};--line:${DA.line};
    --serif:'Playfair',Georgia,serif;--serif-alt:'Bodoni','Playfair',Georgia,serif;--sans:'Jost',system-ui,sans-serif;--arabic:'Jomhuria','Amiri',serif;--arabic-text:'Amiri','Jomhuria',serif;
    font-family:var(--sans);color:var(--ink);background:var(--paper)}`,
  `.da-paper{position:relative;background:var(--paper)}
   .da-paper::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.055;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:220px}
   .da-paper>*{position:relative}`,
  `.da-serif{font-family:var(--serif)} .da-bodoni{font-family:var(--serif-alt)} .da-sans{font-family:var(--sans)}
   .da-ar{font-family:var(--arabic);direction:rtl;line-height:.9} .da-ar-text{font-family:var(--arabic-text);direction:rtl}
   .da-label{font-family:var(--sans);font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:var(--muted);font-weight:500}
   .da-h{font-family:var(--serif);font-weight:700;color:var(--ink);line-height:1.05;letter-spacing:-.01em}
   .da-h em{font-style:italic;font-weight:400}
   .da-hl{display:inline;padding:.02em .22em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
   .da-hl-espresso{background:var(--espresso);color:var(--paper)}
   .da-hl-pink{background:var(--pink);color:var(--ink)}
   .da-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border-radius:999px;padding:14px 26px;font-family:var(--sans);font-weight:600;font-size:15px;transition:transform .15s,box-shadow .15s}
   .da-btn:active{transform:scale(.99)}
   .da-btn-espresso{background:var(--espresso);color:var(--paper);box-shadow:0 10px 30px -14px rgba(58,40,31,.7)}
   .da-btn-pink{background:var(--pink);color:var(--ink)}
   .da-btn-ghost{background:transparent;color:var(--espresso);border:1.5px solid var(--espresso)}
   .da-card{background:#FBF8F2;border:1px solid var(--line);border-radius:18px}
   .da-tile{background:var(--pink);color:var(--ink);border-radius:12px}
   .da-dot{background:var(--espresso);color:var(--paper);border-radius:999px}`,
].join("\n");
