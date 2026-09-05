"use client";

import { useEffect, useRef, useState } from "react";

import type { Ebook30Content } from "@/lib/ebook30-shared";
import { formatCoranPrice } from "@/lib/coran-landing-shared";
import { CoranCheckoutEmbed } from "../coran/checkout-embed";
import { createEbook30EmbeddedCheckout } from "@/actions/ebook30-checkout";
import { OpenInBrowserHint } from "@/components/open-in-browser-hint";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Smoky-teal SVG noise overlay (data URI) for the dark sections. */
const NOISE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.5'/></svg>`,
  );

/** The 3D CSS book shown in the hero. */
function Book3D({ image, title, subtitle }: { image: string; title: string; subtitle: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${-22 + x * 16}deg`);
      el.style.setProperty("--rx", `${6 - y * 10}deg`);
    };
    const reset = () => {
      el.style.setProperty("--ry", "-22deg");
      el.style.setProperty("--rx", "6deg");
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="e30-book" ref={ref}>
      <div className="e30-book-inner">
        <div className="e30-book-cover">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" />
          ) : (
            <div className="e30-cover-fallback">
              <span className="e30-cover-title">{title}</span>
              <span className="e30-cover-sub">{subtitle}</span>
            </div>
          )}
        </div>
        <div className="e30-book-pages" />
        <div className="e30-book-back" />
      </div>
      <div className="e30-book-shadow" />
    </div>
  );
}

/** Page-flip "feuilleter" viewer. */
function Flipper({ pages, accent }: { pages: { image: string; caption: string }[]; accent: string }) {
  const list = pages.length > 0 ? pages : [{ image: "", caption: "" }, { image: "", caption: "" }, { image: "", caption: "" }];
  const total = list.length;
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState<"none" | "next" | "prev">("none");
  const startX = useRef<number | null>(null);

  const go = (dir: 1 | -1) => {
    const ni = i + dir;
    if (ni < 0 || ni >= total || flip !== "none") return;
    setFlip(dir === 1 ? "next" : "prev");
    setTimeout(() => {
      setI(ni);
      setFlip("none");
    }, 280);
  };

  const cur = list[i];
  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <div className="e30-flip">
      <div
        className="e30-page-stage"
        onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (startX.current == null) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          if (dx < -40) go(1);
          else if (dx > 40) go(-1);
          startX.current = null;
        }}
      >
        <div className={`e30-page e30-page-${flip}`}>
          {cur.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cur.image} alt="" className="e30-page-img" />
          ) : (
            <div className="e30-page-blank">
              <span className="e30-bismillah">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ</span>
              <span className="e30-page-note">Extrait à venir</span>
            </div>
          )}
        </div>
      </div>

      <div className="e30-flip-nav">
        <button type="button" aria-label="Page précédente" onClick={() => go(-1)} disabled={i === 0} className="e30-arrow">
          ←
        </button>
        <span className="e30-count">
          <span style={{ color: accent }}>{pad(i)}</span>
          <span className="e30-count-line" />
          <span>{pad(total - 1)}</span>
        </span>
        <button type="button" aria-label="Page suivante" onClick={() => go(1)} disabled={i === total - 1} className="e30-arrow">
          →
        </button>
      </div>

      {cur.caption && <p className="e30-page-caption">{cur.caption}</p>}
    </div>
  );
}

export function Ebook30Landing({ content: c }: { content: Ebook30Content }) {
  const accent = c.accentColor || "#3F7D92";
  const today = formatCoranPrice(c.price.amountCents, c.price.currency);
  const compare =
    c.price.compareAtCents > c.price.amountCents
      ? formatCoranPrice(c.price.compareAtCents, c.price.currency)
      : null;
  const saved =
    c.price.compareAtCents > c.price.amountCents
      ? formatCoranPrice(c.price.compareAtCents - c.price.amountCents, c.price.currency)
      : null;

  const PriceRow = ({ light }: { light?: boolean }) => (
    <div className="e30-price">
      <span className="e30-price-now">{today}</span>
      {compare && <span className="e30-price-old">{compare}</span>}
      {saved && (
        <span className={`e30-save ${light ? "e30-save-light" : ""}`}>Économise {saved}</span>
      )}
    </div>
  );

  return (
    <div className="e30" style={{ ["--acc" as string]: accent }}>
      <style>{CSS}</style>
      <OpenInBrowserHint accent={accent} />

      {/* NAV */}
      <nav className="e30-nav">
        <span className="e30-brand">{c.brand}</span>
        <div className="e30-navlinks">
          {c.navLinks.map((l, k) => (
            <a key={k} href={`#${l.anchor}`}>{l.label}</a>
          ))}
        </div>
        <button type="button" className="e30-nav-cta" onClick={() => scrollTo("offre")}>
          {c.navCta}
        </button>
      </nav>

      {/* HERO */}
      <header className="e30-dark e30-hero" id="livre">
        <div className="e30-hero-grid">
          <div className="e30-hero-copy">
            <p className="e30-eyebrow">{c.eyebrow}</p>
            <h1 className="e30-h1">
              {c.heroTitle}
              <br />
              <em>{c.heroTitleItalic}</em>
            </h1>
            <PriceRow />
            <div className="e30-hero-btns">
              <button type="button" className="e30-btn-primary" onClick={() => scrollTo("offre")}>
                {c.primaryCta}
              </button>
              <button type="button" className="e30-btn-ghost" onClick={() => scrollTo("extraits")}>
                {c.secondaryCta}
              </button>
            </div>
            <p className="e30-hero-text">{c.heroText}</p>
            <p className="e30-hero-small">{c.heroSmall}</p>
          </div>
          <div className="e30-hero-book">
            <Book3D image={c.coverImage} title={c.coverTitle} subtitle={c.coverSubtitle} />
          </div>
        </div>
      </header>

      {/* BAND */}
      {c.bandItems.length > 0 && (
        <div className="e30-band">
          {c.bandItems.map((b, k) => (
            <span key={k} className="e30-band-item">
              <em>{b}</em>
              {k < c.bandItems.length - 1 && <span className="e30-band-dot">✦</span>}
            </span>
          ))}
        </div>
      )}

      {/* ABOUT */}
      <section className="e30-cream e30-about">
        <div className="e30-about-grid">
          <div>
            <p className="e30-label">{c.aboutLabel}</p>
            <h2 className="e30-h2">
              {c.aboutTitle}
              <br />
              <em>{c.aboutTitleItalic}</em>
            </h2>
          </div>
          <div className="e30-about-body">
            {c.aboutBody.map((p, k) => (
              <p key={k}>{p}</p>
            ))}
            {c.aboutLink && (
              <button type="button" className="e30-link" onClick={() => scrollTo("extraits")}>
                {c.aboutLink}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FEUILLETER */}
      <section className="e30-pale e30-flip-section" id="extraits">
        <p className="e30-label e30-center">{c.flipLabel}</p>
        <h2 className="e30-h2 e30-center">
          {c.flipTitle} <em>{c.flipTitleItalic}</em>
        </h2>
        <p className="e30-sub e30-center">{c.flipSubtext}</p>
        <div className="e30-flip-labels">
          <span className="e30-label">{c.flipLeftLabel}</span>
          <span className="e30-label">{c.flipRightLabel}</span>
        </div>
        <Flipper pages={c.pages} accent={accent} />
      </section>

      {/* COLUMNS */}
      {c.cols.length > 0 && (
        <section className="e30-cream e30-cols">
          {c.cols.map((col, k) => (
            <div key={k} className="e30-col">
              <span className="e30-col-rule" />
              <h3 className="e30-col-title">{col.title}</h3>
              <p className="e30-col-body">{col.body}</p>
            </div>
          ))}
        </section>
      )}

      {/* CHECKOUT */}
      <section className="e30-cream e30-checkout-wrap" id="offre">
        <div className="e30-checkout">
          <p className="e30-label e30-center">{c.finalLabel}</p>
          <div className="e30-checkout-price">
            <PriceRow />
            {c.checkoutBadge && <span className="e30-badge">{c.checkoutBadge}</span>}
          </div>
          <CoranCheckoutEmbed createSession={createEbook30EmbeddedCheckout} />
          {c.guarantee && <p className="e30-guarantee">{c.guarantee}</p>}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="e30-dark e30-final">
        <p className="e30-eyebrow e30-center">{c.finalLabel}</p>
        <h2 className="e30-h2 e30-center e30-final-title">
          {c.finalTitle} <em>{c.finalTitleItalic}</em>
        </h2>
        <p className="e30-final-text">{c.finalText}</p>
        <div className="e30-center-flex">
          <PriceRow light />
        </div>
        <button type="button" className="e30-btn-primary" onClick={() => scrollTo("offre")}>
          {c.finalCta}
        </button>
        <p className="e30-hero-small e30-center">{c.finalSmall}</p>
      </section>

      {/* FOOTER */}
      <footer className="e30-footer">
        <span className="e30-brand">{c.brand}</span>
        <em className="e30-footer-tag">{c.footerTagline}</em>
        <span className="e30-footer-copy">{c.footerCopyright}</span>
      </footer>
    </div>
  );
}

const CSS = `
@font-face{font-family:'Cormorant';src:url('/fonts/cormorant-400.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'Cormorant';src:url('/fonts/cormorant-500.woff2') format('woff2');font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:'Cormorant';src:url('/fonts/cormorant-600.woff2') format('woff2');font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:'Cormorant';src:url('/fonts/cormorant-400-italic.woff2') format('woff2');font-weight:400;font-style:italic;font-display:swap}
@font-face{font-family:'Cormorant';src:url('/fonts/cormorant-500-italic.woff2') format('woff2');font-weight:500;font-style:italic;font-display:swap}
@font-face{font-family:'EBGaramond';src:url('/fonts/ebgaramond-400.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'EBGaramond';src:url('/fonts/ebgaramond-500.woff2') format('woff2');font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:'EBGaramond';src:url('/fonts/ebgaramond-400-italic.woff2') format('woff2');font-weight:400;font-style:italic;font-display:swap}

.e30{--ink:#12333c;--cream:#F5F2EC;--pale:#DCE6EA;--body:#33454b;
  font-family:'EBGaramond',Georgia,serif;color:var(--ink);background:var(--cream);
  overflow-x:hidden;line-height:1.5}
.e30 *{box-sizing:border-box}
.e30 em{font-style:italic}
.e30-center{text-align:center}
.e30-label{font-family:'EBGaramond',serif;font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:#7d8b8f;font-weight:500}
.e30-sub{font-size:18px;color:var(--body);opacity:.85;max-width:620px;margin:14px auto 0}

/* dark smoky teal */
.e30-dark{position:relative;color:#F3EFE7;
  background:radial-gradient(90% 60% at 18% 8%, #1e5a68 0%, rgba(30,90,104,0) 55%),
    radial-gradient(80% 70% at 88% 92%, #0b2932 0%, rgba(11,41,50,0) 60%),
    linear-gradient(160deg,#15414c 0%,#0f333c 55%,#0b2932 100%)}
.e30-dark::before{content:"";position:absolute;inset:0;background-image:url("${NOISE}");background-size:240px;opacity:.06;mix-blend-mode:overlay;pointer-events:none}
.e30-dark>*{position:relative;z-index:1}

/* NAV */
.e30-nav{position:absolute;top:0;left:0;right:0;z-index:20;display:flex;align-items:center;justify-content:space-between;
  padding:26px 40px;color:#F3EFE7}
.e30-brand{font-family:'Cormorant',serif;font-weight:600;font-size:22px;letter-spacing:.18em}
.e30-navlinks{display:flex;gap:34px;font-size:15px;letter-spacing:.02em}
.e30-navlinks a{color:#F3EFE7;opacity:.85;text-decoration:none}
.e30-navlinks a:hover{opacity:1}
.e30-nav-cta{border:1px solid rgba(243,239,231,.5);background:transparent;color:#F3EFE7;
  font-family:'EBGaramond',serif;font-size:14px;padding:10px 20px;border-radius:2px;cursor:pointer}
.e30-nav-cta:hover{background:rgba(243,239,231,.1)}

/* HERO */
.e30-hero{padding:150px 40px 90px}
.e30-hero-grid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.e30-eyebrow{font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:rgba(243,239,231,.7);font-weight:500}
.e30-h1{font-family:'Cormorant',serif;font-weight:500;font-size:76px;line-height:1.02;margin:18px 0 0;letter-spacing:.5px}
.e30-h1 em{font-weight:500}
.e30-price{display:flex;align-items:baseline;gap:14px;margin:26px 0 0;flex-wrap:wrap}
.e30-price-now{font-family:'Cormorant',serif;font-size:40px;font-weight:600}
.e30-price-old{font-size:22px;opacity:.55;text-decoration:line-through}
.e30-save{font-size:13px;letter-spacing:.04em;border:1px solid currentColor;opacity:.8;padding:5px 12px;border-radius:2px}
.e30-hero-btns{display:flex;gap:14px;margin:26px 0 0;flex-wrap:wrap}
.e30-btn-primary{background:#F3EFE7;color:#12333c;border:none;font-family:'EBGaramond',serif;font-size:16px;
  padding:15px 30px;border-radius:2px;cursor:pointer;transition:transform .15s}
.e30-btn-primary:hover{transform:translateY(-1px)}
.e30-btn-ghost{background:transparent;color:#F3EFE7;border:1px solid rgba(243,239,231,.45);
  font-family:'EBGaramond',serif;font-size:16px;padding:15px 26px;border-radius:2px;cursor:pointer}
.e30-btn-ghost:hover{background:rgba(243,239,231,.08)}
.e30-hero-text{font-size:17px;line-height:1.65;color:rgba(243,239,231,.82);max-width:460px;margin:26px 0 0}
.e30-hero-small{font-size:13px;letter-spacing:.02em;color:rgba(243,239,231,.55);margin:16px 0 0}
.e30-hero-book{display:flex;justify-content:center;align-items:center;min-height:460px}

/* 3D BOOK */
.e30-book{perspective:1800px;width:300px}
.e30-book-inner{position:relative;width:300px;height:430px;transform-style:preserve-3d;
  transform:rotateY(var(--ry,-22deg)) rotateX(var(--rx,6deg));transition:transform .3s ease-out;
  animation:e30float 6s ease-in-out infinite}
@keyframes e30float{0%,100%{transform:rotateY(var(--ry,-22deg)) rotateX(var(--rx,6deg)) translateY(0)}
  50%{transform:rotateY(var(--ry,-22deg)) rotateX(var(--rx,6deg)) translateY(-14px)}}
.e30-book-cover{position:absolute;inset:0;transform:translateZ(16px);border-radius:2px 6px 6px 2px;overflow:hidden;
  box-shadow:0 30px 60px -20px rgba(0,0,0,.5);background:#0f333c}
.e30-book-cover img{width:100%;height:100%;object-fit:cover;display:block}
.e30-cover-fallback{width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:14px;
  text-align:center;padding:30px;color:#Efeadf;
  background:radial-gradient(120% 90% at 30% 15%,#20606f,#0d2e37 70%)}
.e30-cover-title{font-family:'Cormorant',serif;font-weight:600;font-size:34px;line-height:1.1;letter-spacing:.06em;white-space:pre-line}
.e30-cover-sub{font-size:12px;letter-spacing:.32em;opacity:.8}
.e30-book-pages{position:absolute;top:3px;bottom:3px;right:0;width:32px;transform:translateX(284px) rotateY(90deg);
  transform-origin:left center;background:linear-gradient(90deg,#efe9dc,#cfc7b5)}
.e30-book-back{position:absolute;inset:0;transform:translateZ(-16px);border-radius:2px 6px 6px 2px;background:#0a262e}
.e30-book-shadow{position:absolute;left:50%;bottom:-42px;width:280px;height:34px;transform:translateX(-50%);
  background:radial-gradient(closest-side,rgba(0,0,0,.45),transparent 75%);filter:blur(3px)}

/* BAND */
.e30-band{background:var(--cream);border-top:1px solid #e3ddd0;border-bottom:1px solid #e3ddd0;
  display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:22px 30px;text-align:center}
.e30-band-item{font-family:'Cormorant',serif;font-size:21px;color:#3a4b51;display:inline-flex;align-items:center;gap:26px}
.e30-band-dot{color:var(--acc);font-size:12px}

/* ABOUT */
.e30-cream{background:var(--cream)}
.e30-about{padding:110px 40px}
.e30-about-grid{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start}
.e30-h2{font-family:'Cormorant',serif;font-weight:500;font-size:52px;line-height:1.05;margin:16px 0 0}
.e30-h2 em{color:var(--acc)}
.e30-about-body{font-size:18px;line-height:1.7;color:var(--body)}
.e30-about-body p{margin:0 0 18px}
.e30-link{background:none;border:none;padding:0;margin-top:6px;cursor:pointer;font-family:'EBGaramond',serif;
  font-size:16px;color:var(--acc);border-bottom:1px solid var(--acc)}

/* FEUILLETER */
.e30-pale{background:var(--pale)}
.e30-flip-section{padding:96px 40px}
.e30-flip-labels{max-width:920px;margin:40px auto 0;display:flex;justify-content:space-between}
.e30-flip{max-width:920px;margin:22px auto 0}
.e30-page-stage{perspective:1800px;display:flex;justify-content:center}
.e30-page{width:340px;max-width:82vw;aspect-ratio:3/4;background:#fff;border-radius:2px;
  box-shadow:0 30px 60px -24px rgba(18,51,60,.4);overflow:hidden;transform-origin:left center;
  transition:transform .28s ease,opacity .28s ease}
.e30-page-next{transform:rotateY(-105deg);opacity:.2}
.e30-page-prev{transform:rotateY(105deg);opacity:.2}
.e30-page-img{width:100%;height:100%;object-fit:cover;display:block}
.e30-page-blank{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
  background:linear-gradient(180deg,#fff,#f4f1ea)}
.e30-bismillah{font-family:'Amiri','Cormorant',serif;font-size:22px;color:#2b3a40;direction:rtl}
.e30-page-note{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#9aa6aa}
.e30-flip-nav{display:flex;align-items:center;justify-content:center;gap:22px;margin:26px 0 0}
.e30-arrow{width:46px;height:46px;border-radius:50%;border:1px solid #b7c4c9;background:transparent;
  font-size:18px;color:#3a4b51;cursor:pointer;display:grid;place-items:center}
.e30-arrow:disabled{opacity:.35;cursor:default}
.e30-arrow:not(:disabled):hover{background:#fff}
.e30-count{display:flex;align-items:center;gap:14px;font-family:'Cormorant',serif;font-size:20px;color:#3a4b51}
.e30-count-line{width:60px;height:1px;background:#93a3a8;display:inline-block}
.e30-page-caption{text-align:center;font-style:italic;color:#4a5a60;margin:22px auto 0;max-width:520px}

/* COLUMNS */
.e30-cols{padding:96px 40px;max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:44px}
.e30-col-rule{display:block;width:100%;height:1px;background:#cfc7b5;margin-bottom:22px}
.e30-col-title{font-family:'Cormorant',serif;font-weight:600;font-size:27px;margin:0 0 12px}
.e30-col-body{font-size:16px;line-height:1.65;color:var(--body)}

/* CHECKOUT */
.e30-checkout-wrap{padding:20px 20px 100px}
.e30-checkout{max-width:520px;margin:0 auto;background:#fff;border:1px solid #e6e0d3;border-radius:6px;
  padding:26px;box-shadow:0 30px 60px -40px rgba(18,51,60,.4)}
.e30-checkout-price{display:flex;align-items:center;gap:14px;justify-content:center;margin:16px 0 20px}
.e30-badge{background:#eef4f2;color:#2f6b58;font-size:12px;font-weight:600;letter-spacing:.04em;padding:6px 12px;border-radius:999px}
.e30-guarantee{text-align:center;font-size:13px;color:#7d8b8f;margin:16px 0 0}

/* FINAL */
.e30-final{padding:110px 40px 120px;text-align:center}
.e30-final-title{color:#F3EFE7}
.e30-final-title em{color:#F3EFE7;opacity:.92}
.e30-final .e30-eyebrow{color:rgba(243,239,231,.7)}
.e30-final-text{font-size:18px;line-height:1.65;color:rgba(243,239,231,.82);max-width:520px;margin:18px auto 0}
.e30-center-flex{display:flex;justify-content:center;margin:26px 0}
.e30-final .e30-btn-primary{margin-top:4px}
.e30-final .e30-hero-small{margin-top:18px}

/* FOOTER */
.e30-footer{background:var(--cream);border-top:1px solid #e3ddd0;display:flex;align-items:center;justify-content:space-between;
  padding:34px 40px;color:#3a4b51}
.e30-footer-tag{font-family:'Cormorant',serif;font-size:19px}
.e30-footer-copy{font-size:13px;color:#8b969a}

/* RESPONSIVE */
@media(max-width:860px){
  .e30-nav{padding:20px}
  .e30-navlinks{display:none}
  .e30-hero{padding:120px 22px 70px}
  .e30-hero-grid{grid-template-columns:1fr;gap:10px;text-align:center}
  .e30-price,.e30-hero-btns{justify-content:center}
  .e30-h1{font-size:52px}
  .e30-hero-text{margin-left:auto;margin-right:auto}
  .e30-hero-book{min-height:420px;order:-1;margin-bottom:10px}
  .e30-book,.e30-book-inner{width:230px}
  .e30-book-inner{height:330px}
  .e30-book-pages{transform:translateX(214px) rotateY(90deg)}
  .e30-band-item{gap:14px;font-size:18px}
  .e30-about,.e30-flip-section,.e30-cols,.e30-final{padding-left:22px;padding-right:22px}
  .e30-about-grid{grid-template-columns:1fr;gap:22px}
  .e30-h2{font-size:38px}
  .e30-cols{grid-template-columns:1fr;gap:34px;padding-top:70px;padding-bottom:70px}
  .e30-footer{flex-direction:column;gap:10px;text-align:center}
}
@media(max-width:480px){
  .e30-hero{padding:104px 18px 56px}
  .e30-h1{font-size:37px;line-height:1.05}
  .e30-eyebrow{font-size:10px;letter-spacing:.14em}
  .e30-price-now{font-size:32px}
  .e30-price-old{font-size:19px}
  .e30-save{font-size:12px;padding:4px 9px}
  .e30-hero-btns{gap:10px}
  .e30-btn-primary,.e30-btn-ghost{font-size:15px;padding:13px 20px}
  .e30-hero-text{font-size:16px}
  .e30-hero-small{font-size:12px}
  .e30-cover-title{font-size:24px}
  .e30-cover-sub{font-size:10px;letter-spacing:.24em}
  .e30-band{padding:18px 16px}
  .e30-band-item{font-size:15px;gap:8px}
  .e30-h2{font-size:32px}
  .e30-sub{font-size:16px}
  .e30-flip-labels{display:none}
  .e30-count-line{width:40px}
}
`;
