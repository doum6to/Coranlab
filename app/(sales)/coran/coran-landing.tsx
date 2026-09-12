import type { CSSProperties, ReactNode } from "react";
import { Check, ArrowUpRight } from "lucide-react";
import {
  type CoranLandingContent,
  type CoranSectionKey,
  formatCoranPrice,
  formatFcfaFromEur,
  formatFcfaAmount,
  mergeCoranEditorial,
} from "@/lib/coran-landing-content";
import { ReviewsMarquee } from "../offre-a-vie/reviews-marquee";
import { StickyPayBar } from "./sticky-pay-bar";
import { CoranPayment } from "./coran-payment";
import { CoranSamples } from "./coran-samples";
import { mergeCoranConversion } from "@/lib/coran-conversion";
import { CoranAnalytics } from "./coran-analytics";
import styles from "./coran-landing.module.css";
import { DA, DA_FONT_CSS } from "@/lib/da-tokens";

// Colors saved before the "editorial paper" DA (old defaults / teal migration) are
// remapped to the new palette; any other admin-chosen color is respected.
const LEGACY_BG = new Set(["#faf8f3", "#f8faf8", "#ffffff", "#fff"]);
const LEGACY_TX = new Set(["#171717", "#132f37", "#000000", "#000"]);
const LEGACY_ACCENT = new Set(["#075169", "#6967fb"]);
const ARABIC = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\u064B-\u065F]*)/g;

/** Arabic runs → Jomhuria (da-ar). */
function withArabic(text: string, keyBase: string): ReactNode[] {
  return text.split(ARABIC).filter(Boolean).map((part, i) =>
    /[\u0600-\u06FF\uFB50-\uFEFF]/.test(part)
      ? <span key={`${keyBase}-ar-${i}`} className="da-ar" lang="ar">{part}</span>
      : part,
  );
}

/**
 * Editorial headings: `**mot**` → pink block, `__mot__` → espresso block.
 * Without explicit marks, a "85%"-style figure is highlighted automatically.
 */
function rich(text: string, auto = true): ReactNode[] {
  const src = auto && !/\*\*|__/.test(text) ? text.replace(/(\d+\s?%)/, "**$1**") : text;
  return src.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean).map((tok, i) => {
    if (tok.startsWith("**")) return <span key={i} className="da-hl da-hl-pink">{withArabic(tok.slice(2, -2), `p${i}`)}</span>;
    if (tok.startsWith("__")) return <span key={i} className="da-hl da-hl-espresso">{withArabic(tok.slice(2, -2), `e${i}`)}</span>;
    return <span key={i}>{withArabic(tok, `t${i}`)}</span>;
  });
}

export function CoranLanding({ content: c, createCheckout, topSlot }: {
  content: CoranLandingContent;
  createCheckout?: () => Promise<{ clientSecret: string | null } | { error: string }>;
  topSlot?: ReactNode;
}) {
  const e = mergeCoranEditorial(c.editorial);
  const v = mergeCoranConversion(c.conversion);
  const price = c.showPrice ? formatCoranPrice(c.price.amountCents, c.price.currency) : null;
  // The historic annual comparison is not like-for-like with this lifetime pack.
  const compare = null;
  const fcfa = c.showPrice && c.showFcfa
    ? c.fcfaAmount > 0 ? formatFcfaAmount(c.fcfaAmount) : formatFcfaFromEur(c.price.amountCents, c.price.currency)
    : null;
  const bg = LEGACY_BG.has((c.bgColor || "").toLowerCase()) ? DA.paper : c.bgColor;
  const tx = LEGACY_TX.has((c.textColor || "").toLowerCase()) ? DA.ink : c.textColor;
  const accent = LEGACY_ACCENT.has((e.accentColor || "").toLowerCase()) ? DA.pink : e.accentColor;
  const cover = e.coverUrl || c.samples.find((sample) => sample.cover)?.cover || c.banners[0];
  const hasSamples = c.samples.some((sample) => sample.cover || sample.pdf);
  const hasBody = c.body.length > 0;
  const priceLine = (className = "") => price && (
    <div className={`${styles.price} ${className}`}>
      <strong>{price}</strong><span>une seule fois</span>
      {fcfa && <span>≈ {fcfa}</span>}
    </div>
  );
  const ctaText = price ? `${c.ctaLabel} — ${price}` : c.ctaLabel;
  const cta = <a href="#checkout" className={styles.primary}>{ctaText}<ArrowUpRight size={18} aria-hidden="true" /></a>;
  const sections: Record<CoranSectionKey, ReactNode> = {
    // Title is the fixed hero. The remaining content keeps its saved order.
    title: null,
    banners: v.showBanners && c.banners.length > 0 && (
      <div className={styles.banners}>
        {c.banners.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${src}-${i}`} src={src} alt="" loading="lazy" />
        ))}
      </div>
    ),
    body: hasBody && (
      <section id="contenu" className={styles.story}>
        {e.bodyHeading && <h2>{rich(e.bodyHeading, false)}</h2>}
        <div className={styles.body}>
          {c.body.map((block, i) => block.type === "image" ? (
            // Keep the original graphics (some contain copy) at their readable width.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={block.url} alt="" loading="lazy" />
          ) : <div key={i}>{block.heading && <h3>{block.heading}</h3>}<p>{block.text}</p></div>)}
        </div>
      </section>
    ),
    samples: hasSamples && (
      <section id="pack" className={styles.samples}>
        <div className={styles.packHeading}>
          <h2>{rich(v.packHeading, false)}</h2><p>{v.packIntro}</p>
        </div>
        <div className={styles.packGrid}>
          {c.samples.map((sample, i) => <article key={i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {sample.cover && <img src={sample.cover} alt={sample.title} loading="lazy" />}
            <h3>{sample.title}</h3>
            {sample.pdf && <a href={sample.pdf} target="_blank" rel="noopener noreferrer" data-coran-extract>{e.previewLabel}</a>}
          </article>)}
        </div>
        <div className={styles.midCta}>{priceLine()}<a href="#checkout" className={styles.primary}>{price ? `${v.packCta} — ${price}` : v.packCta}</a><p>{v.paymentNote}</p></div>
      </section>
    ),
    gifs: c.gifs.length > 0 && (
      <div className={styles.gifs}>
        {c.gifs.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${src}-${i}`} src={src} alt="" loading="lazy" />
        ))}
      </div>
    ),
    reviews: (c.reviewImages.length > 0 || c.reviews.length > 0) && (
      <section id="avis" className={styles.reviews}>
        {c.reviewsHeading && <h2>{rich(c.reviewsHeading, false)}</h2>}
        {c.reviewImages.length > 0 && <ReviewsMarquee images={c.reviewImages} />}
        <div className={styles.reviewGrid}>
          {c.reviews.map((review, i) => (
            <figure key={i}>
              <blockquote dir="auto">{review.text}</blockquote>
              {review.name && <figcaption dir="auto">{review.name}</figcaption>}
            </figure>
          ))}
        </div>
      </section>
    ),
  };
  return (
    <div className={`${styles.page} da da-paper`} style={{
      "--coran-accent": accent,
      backgroundColor: bg, color: tx,
    } as CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: DA_FONT_CSS }} />
      <CoranAnalytics />
      <header className={styles.header}>
        <span className={styles.brand}>QuranLab</span>
        <nav aria-label="Navigation du guide">
          {hasBody && e.detailsLabel && <a href="#contenu">{e.detailsLabel}</a>}
          {hasSamples && e.previewLabel && <a href="#extraits">{e.previewLabel}</a>}
        </nav>
        <a href="#checkout" className={styles.headerCta}>{ctaText}</a>
      </header>
      <main>
        {topSlot && <div className={styles.topSlot}>{topSlot}</div>}
        <section id="coran-hero" className={`${styles.hero} ${!cover ? styles.heroWithoutCover : ""}`}>
          <div className={styles.heroHeading}>
            {e.eyebrow && <p className={styles.eyebrow}>{e.eyebrow}</p>}
            <h1>{rich(c.title)}</h1>
            {c.subtitle && <p className={styles.subtitle}>{c.subtitle}</p>}

          </div>
          {cover && <div className={styles.heroVisual}>
            <a href={hasSamples ? "#extraits" : "#checkout"} aria-label={hasSamples ? e.previewLabel || c.title : c.ctaLabel}>
              {/* Use the actual product cover, including its existing tablet frame. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={c.title} fetchPriority="high" />
            </a>
          </div>}
          <div className={styles.heroOffer}>
            {priceLine()}
            <div className={styles.actions}>{cta}
              {hasSamples && e.previewLabel && <a className={styles.textLink} href="#extraits">{e.previewLabel}</a>}
            </div>
            {v.heroBenefits && <ul className={styles.heroBenefits}>{v.heroBenefits.split("\n").filter(Boolean).map((text,i)=><li key={i}><Check size={18} aria-hidden="true"/>{text}</li>)}</ul>}
            {v.paymentNote && <p className={styles.paymentNote}>{v.paymentNote}</p>}
            {c.guarantee && <p className={styles.heroGuarantee}>{c.guarantee}</p>}
            {e.formatNote && <p className={styles.format}>{e.formatNote}</p>}
          </div>
        </section>
        {hasSamples && <section id="extraits" className={styles.preview}>
          <div className={styles.previewIntro}>
            <p className={styles.eyebrow}>DÉCOUVRE LE CONTENU AVANT D’ACHETER</p>
            <h2>Ouvre le guide.<br />Fais-toi une idée.</h2>
            <p>Feuillette les vrais documents du pack : le vocabulaire, la méthode et les ressources pour approfondir. Les extraits sont accessibles sans inscription.</p>
          </div>
          <CoranSamples heading="" samples={c.samples} readLabel={e.previewLabel} editorial />
        </section>}
        {hasSamples && sections.samples}
        {v.steps.length > 0 && <section className={styles.method}>
          <h2>{rich(v.stepsHeading, false)}</h2><div>{v.steps.map((step,i)=><article key={i}><span>{String(i+1).padStart(2,"0")}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
        </section>}
        {c.sectionOrder.filter(key => key !== "samples").map((key) => sections[key] ? <div key={key}>{sections[key]}</div> : null)}
        <section id="checkout" className={styles.checkout}>
          <div className={styles.offerCopy}>
            {e.offerLabel && <p className={styles.eyebrow}>{e.offerLabel}</p>}
            {e.offerHeading && <h2>{rich(e.offerHeading, false)}</h2>}
            {c.showDeliverables && c.deliverables.length > 0 && <ul>
              {c.deliverables.map((item, i) => <li key={i}><Check size={20} aria-hidden="true" /><span>{item}</span></li>)}
            </ul>}
            {c.guarantee && <p className={styles.guarantee}>{c.guarantee}</p>}
          </div>
          <div className={styles.payment}>
            {e.checkoutHeading && <h3>{e.checkoutHeading}</h3>}
            {priceLine()}
            <p className={styles.checkoutNote}>{v.paymentNote}</p>
            <p className={styles.checkoutNote}>{v.finalNote}</p>
            <CoranPayment omEnabled={c.orangeMoney.enabled} om={c.orangeMoney} createCheckout={createCheckout} />
          </div>
        </section>
        {v.faq.length > 0 && <section className={styles.faq}>
          <h2>{rich(v.faqHeading, false)}</h2><div>{v.faq.map((item,i)=><details key={i}><summary>{item.title}</summary><p>{item.text}</p></details>)}</div>
        </section>}
        <div className={styles.finalCta}>{cta}<p>{v.paymentNote}</p></div>
      </main>
      <footer className={styles.footer}><span className={styles.brand}>QuranLab</span>{e.formatNote && <p>{e.formatNote}</p>}</footer>
      {c.showStickyBar && <StickyPayBar priceLabel={price} compareLabel={compare} cta={c.ctaLabel} headline={v.paymentNote || c.stickyBarText} accentColor={DA.espresso} />}
    </div>
  );
}
