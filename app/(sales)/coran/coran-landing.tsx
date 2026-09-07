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
import { PaymentMethods } from "./payment-methods";
import { CoranSamples } from "./coran-samples";
import styles from "./coran-landing.module.css";

export function CoranLanding({ content: c, createCheckout, topSlot }: {
  content: CoranLandingContent;
  createCheckout?: () => Promise<{ clientSecret: string | null } | { error: string }>;
  topSlot?: ReactNode;
}) {
  const e = mergeCoranEditorial(c.editorial);
  const price = c.showPrice ? formatCoranPrice(c.price.amountCents, c.price.currency) : null;
  const compare = c.showPrice && c.price.compareAtCents > c.price.amountCents
    ? formatCoranPrice(c.price.compareAtCents, c.price.currency) : null;
  const fcfa = c.showPrice && c.showFcfa
    ? c.fcfaAmount > 0 ? formatFcfaAmount(c.fcfaAmount) : formatFcfaFromEur(c.price.amountCents, c.price.currency)
    : null;
  const cover = e.coverUrl || c.samples.find((sample) => sample.cover)?.cover || c.banners[0];
  const hasSamples = c.samples.some((sample) => sample.cover || sample.pdf);
  const hasBody = c.body.length > 0;
  const priceLine = (className = "") => price && (
    <div className={`${styles.price} ${className}`}>
      <strong>{price}</strong>{compare && <del>{compare}</del>}
      {fcfa && <span>≈ {fcfa}</span>}
    </div>
  );
  const cta = <a href="#checkout" className={styles.primary}>{c.ctaLabel}<ArrowUpRight size={18} aria-hidden="true" /></a>;
  const sections: Record<CoranSectionKey, ReactNode> = {
    // Title is the fixed hero. The remaining content keeps its saved order.
    title: null,
    banners: c.banners.length > 0 && (
      <div className={styles.banners}>
        {c.banners.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${src}-${i}`} src={src} alt="" loading="lazy" />
        ))}
      </div>
    ),
    body: hasBody && (
      <section id="contenu" className={styles.story}>
        {e.bodyHeading && <h2>{e.bodyHeading}</h2>}
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
      <section id="extraits" className={styles.samples}>
        <CoranSamples heading={c.samplesHeading} samples={c.samples} readLabel={e.previewLabel} editorial />
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
      <section className={styles.reviews}>
        {c.reviewsHeading && <h2>{c.reviewsHeading}</h2>}
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
    <div className={styles.page} style={{
      "--coran-accent": e.accentColor,
      backgroundColor: c.bgColor, color: c.textColor,
    } as CSSProperties}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>QuranLab</a>
        <nav aria-label="Navigation du guide">
          {hasBody && e.detailsLabel && <a href="#contenu">{e.detailsLabel}</a>}
          {hasSamples && e.previewLabel && <a href="#extraits">{e.previewLabel}</a>}
        </nav>
        <a href="#checkout" className={styles.headerCta}>{c.ctaLabel}</a>
      </header>
      <main>
        {topSlot && <div className={styles.topSlot}>{topSlot}</div>}
        <section className={`${styles.hero} ${!cover ? styles.heroWithoutCover : ""}`}>
          <div className={styles.heroHeading}>
            {e.eyebrow && <p className={styles.eyebrow}>{e.eyebrow}</p>}
            <h1>{c.title}</h1>
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
            {e.introduction && <p className={styles.intro}>{e.introduction}</p>}
            {e.formatNote && <p className={styles.format}>{e.formatNote}</p>}
          </div>
        </section>
        {c.showDeliverables && c.deliverables.length > 0 && <ul className={styles.ribbon}>
          {c.deliverables.map((item, i) => <li key={i}><Check size={18} aria-hidden="true" /><span>{item}</span></li>)}
        </ul>}
        {c.sectionOrder.map((key) => sections[key] ? <div key={key}>{sections[key]}</div> : null)}
        <section id="checkout" className={styles.checkout}>
          <div className={styles.offerCopy}>
            {e.offerLabel && <p className={styles.eyebrow}>{e.offerLabel}</p>}
            {e.offerHeading && <h2>{e.offerHeading}</h2>}
            {c.showDeliverables && c.deliverables.length > 0 && <ul>
              {c.deliverables.map((item, i) => <li key={i}><Check size={20} aria-hidden="true" /><span>{item}</span></li>)}
            </ul>}
            {c.guarantee && <p className={styles.guarantee}>{c.guarantee}</p>}
          </div>
          <div className={styles.payment}>
            {e.checkoutHeading && <h3>{e.checkoutHeading}</h3>}
            {priceLine()}
            <PaymentMethods omEnabled={c.orangeMoney.enabled} om={c.orangeMoney} createCheckout={createCheckout} />
          </div>
        </section>
      </main>
      <footer className={styles.footer}><a href="/" className={styles.brand}>QuranLab</a>{e.formatNote && <p>{e.formatNote}</p>}</footer>
      {c.showStickyBar && <StickyPayBar priceLabel={price} compareLabel={compare} cta={c.ctaLabel} headline={c.stickyBarText} accentColor={e.accentColor} />}
    </div>
  );
}
