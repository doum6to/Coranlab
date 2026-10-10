"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Headphones,
  Smartphone,
  Gift,
  Check,
  ShieldCheck,
  Lock,
  Zap,
  ChevronDown,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";

import type { PackContent } from "@/lib/pack-shared";
import { formatCoranPrice } from "@/lib/coran-landing-shared";
import { CoranCheckoutEmbed } from "../coran/checkout-embed";
import { createPackEmbeddedCheckout } from "@/actions/pack-checkout";
import { OpenInBrowserHint } from "@/components/open-in-browser-hint";
import { track } from "@/lib/analytics/track";

/* ─────────────────────────── Design tokens ─────────────────────────── */

const CSS = `
.pk{--ink:#141414;--muted:#6B6B6B;--line:#E8E4DC;--paper:#FFFDF8;--cream:#F6F1E7;--gold:#D9A53C;--gold2:#B9861F;
  background:var(--paper);color:var(--ink);font-family:var(--font-inter),system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.pk h1,.pk h2,.pk .serif{font-family:var(--font-serif),Georgia,serif;letter-spacing:-.01em}
.pk .wrap{max-width:1040px;margin:0 auto;padding:0 20px}
.pk .narrow{max-width:720px;margin:0 auto}
.pk .btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:18px 24px;border-radius:999px;
  background:var(--ink);color:#fff;font-weight:800;font-size:17px;box-shadow:0 10px 30px rgba(20,20,20,.22);transition:transform .12s,box-shadow .12s;position:relative;overflow:hidden}
.pk .btn:hover{transform:translateY(-1px);box-shadow:0 14px 34px rgba(20,20,20,.28)}
.pk .btn:active{transform:translateY(2px);box-shadow:0 4px 12px rgba(20,20,20,.2)}
.pk .btn::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.22) 50%,transparent 70%);transform:translateX(-120%);animation:pk-shine 3.2s ease-in-out infinite}
@keyframes pk-shine{0%,60%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
.pk .btn-accent{background:var(--acc)}
.pk .chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:var(--cream);font-size:12px;font-weight:700;color:var(--ink)}
.pk .card{background:#fff;border:1px solid var(--line);border-radius:22px;box-shadow:0 6px 24px rgba(40,30,10,.06)}
.pk .reveal{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s ease}
.pk .reveal.in{opacity:1;transform:none}
.pk .book{position:relative;width:min(62vw,250px);aspect-ratio:3/4.25;margin:0 auto;transform-style:preserve-3d;transform:perspective(1200px) rotateY(-18deg) rotateX(4deg);animation:pk-float 6s ease-in-out infinite}
@keyframes pk-float{0%,100%{transform:perspective(1200px) rotateY(-18deg) rotateX(4deg) translateY(0)}50%{transform:perspective(1200px) rotateY(-16deg) rotateX(3deg) translateY(-10px)}}
.pk .book .cover{position:absolute;inset:0;border-radius:6px 14px 14px 6px;overflow:hidden;background:linear-gradient(160deg,var(--acc) 0%,color-mix(in srgb,var(--acc) 70%,#000) 100%);
  box-shadow:-18px 24px 50px rgba(0,0,0,.35),inset 8px 0 14px rgba(0,0,0,.25)}
.pk .book .cover img{width:100%;height:100%;object-fit:cover}
.pk .book .spine{position:absolute;left:-14px;top:3px;bottom:3px;width:14px;background:linear-gradient(90deg,color-mix(in srgb,var(--acc) 55%,#000),color-mix(in srgb,var(--acc) 80%,#000));transform:rotateY(-90deg);transform-origin:right;border-radius:3px 0 0 3px}
.pk .book .pages{position:absolute;right:-9px;top:6px;bottom:6px;width:9px;background:repeating-linear-gradient(180deg,#f3efe6 0 2px,#d9d3c6 2px 3px);transform:rotateY(90deg);transform-origin:left;border-radius:0 3px 3px 0}
.pk .book .glow{position:absolute;inset:-12%;background:radial-gradient(closest-side,color-mix(in srgb,var(--acc) 30%,transparent),transparent 70%);z-index:-1;filter:blur(10px)}
.pk .strike{text-decoration:line-through;text-decoration-thickness:2px;text-decoration-color:#C94B4B}
.pk .faq summary{list-style:none;cursor:pointer}
.pk .faq summary::-webkit-details-marker{display:none}
.pk .faq details[open] .chev{transform:rotate(180deg)}
.pk .pages-scroll{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 20px 18px;-webkit-overflow-scrolling:touch}
.pk .pages-scroll>*{scroll-snap-align:center;flex:0 0 min(72vw,280px)}
.pk .pulse{animation:pk-pulse 2.4s ease-in-out infinite}
@keyframes pk-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--acc) 45%,transparent)}60%{box-shadow:0 0 0 14px transparent}}
`;

const ICONS: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  book: BookOpen,
  audio: Headphones,
  app: Smartphone,
  gift: Gift,
};

/** `**bold**` → <strong>, French ? ! get a narrow no-break space. */
function rich(text: string) {
  const t = text.replace(/ ([?!:;])/g, " $1");
  return t.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
  );
}

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".pk .reveal"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const scrollToCheckout = () => {
  track("pack_cta_click");
  document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/* ───────────────────────────── Component ───────────────────────────── */

export function PackLanding({ content: c }: { content: PackContent }) {
  useReveal();
  const price = formatCoranPrice(c.price.amountCents, c.price.currency);
  const compare = c.price.compareAtCents > c.price.amountCents
    ? formatCoranPrice(c.price.compareAtCents, c.price.currency)
    : null;
  const pct = compare ? Math.round((1 - c.price.amountCents / c.price.compareAtCents) * 100) : 0;

  useEffect(() => {
    track("pack_view");
  }, []);

  return (
    <div className="pk min-h-screen pb-28" style={{ ["--acc" as any]: c.accentColor }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <OpenInBrowserHint accent={c.accentColor} />

      {/* Top bar */}
      {c.topBar && (
        <div className="sticky top-0 z-40 bg-[var(--ink)] px-4 py-2.5 text-center text-[12.5px] font-semibold text-white">
          {rich(c.topBar)}
        </div>
      )}

      {/* HERO */}
      <header className="wrap overflow-hidden pt-8 sm:pt-14">
        <div className="grid items-center gap-10 sm:grid-cols-[1.1fr_.9fr]">
          <div className="order-2 sm:order-1">
            <span className="chip" style={{ color: c.accentColor }}>
              <Zap className="h-3.5 w-3.5" /> {c.eyebrow}
            </span>
            <h1 className="mt-4 text-[34px] font-semibold leading-[1.08] sm:text-[52px]">
              {c.heroTitle}{" "}
              <em className="not-italic" style={{ color: c.accentColor, fontStyle: "italic" }}>
                {c.heroTitleItalic}
              </em>
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-[var(--muted)] sm:text-[18px]">{rich(c.heroText)}</p>

            <div className="mt-6 flex items-end gap-3">
              <span className="serif text-[44px] font-semibold leading-none" style={{ color: c.accentColor }}>{price}</span>
              {compare && (
                <span className="mb-1 flex flex-col leading-tight">
                  <span className="strike text-[18px] text-[var(--muted)]">{compare}</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C94B4B]">−{pct} %</span>
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px] font-semibold text-[var(--muted)]">{c.priceNote}</p>

            <div className="mt-6">
              <button className="btn pulse" onClick={scrollToCheckout}>
                {c.primaryCta}
              </button>
              <p className="mt-2.5 text-center text-[12px] text-[var(--muted)]">{c.ctaSub}</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start">
              {c.trust.map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--muted)]">
                  {i === 0 ? <Lock className="h-3.5 w-3.5" /> : i === 1 ? <Zap className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="order-1 sm:order-2">
            <div className="book">
              <div className="glow" />
              <div className="spine" />
              <div className="pages" />
              <div className="cover">
                {c.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.coverImage} alt={c.coverTitle} />
                ) : (
                  <div className="flex h-full flex-col justify-between p-6 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-[.25em] opacity-80">Quranlab</span>
                    <div>
                      <p className="serif text-[26px] font-semibold leading-tight">{c.coverTitle}</p>
                      <p className="mt-2 text-[12px] opacity-85">{c.coverSubtitle}</p>
                    </div>
                    <span className="font-arabic text-[28px] opacity-90" dir="rtl">ٱلْحَمْدُ لِلَّٰهِ</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="flex" style={{ color: "#F2B705" }}>
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />)}
              </span>
              <span className="text-[12.5px] font-semibold text-[var(--muted)]">{c.ratingLabel}</span>
            </div>
          </div>
        </div>
      </header>

      {/* PAIN */}
      <section className="wrap mt-20">
        <div className="narrow reveal">
          <h2 className="text-center text-[28px] font-semibold leading-tight sm:text-[36px]">{rich(c.painTitle)}</h2>
          <ul className="mt-8 space-y-3">
            {c.painItems.map((p, i) => (
              <li key={i} className="card flex gap-3 p-4 text-[15px] leading-relaxed">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FBE9E9] text-[#C94B4B]">
                  <X className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span>{rich(p)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-2xl p-5 text-[15.5px] leading-relaxed text-white" style={{ background: c.accentColor }}>
            {rich(c.painClose)}
          </p>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="wrap mt-20">
        <div className="narrow reveal">
          <h2 className="text-center text-[28px] font-semibold leading-tight sm:text-[36px]">{rich(c.transfoTitle)}</h2>
          <div className="card mt-8 overflow-hidden">
            <div className="grid grid-cols-2 text-[11px] font-extrabold uppercase tracking-wider">
              <div className="bg-[var(--cream)] px-4 py-3 text-[var(--muted)]">Avant</div>
              <div className="px-4 py-3 text-white" style={{ background: c.accentColor }}>Après</div>
            </div>
            {c.transfo.map((r, i) => (
              <div key={i} className="grid grid-cols-2 border-t border-[var(--line)] text-[14px] sm:text-[15px]">
                <div className="px-4 py-4 text-[var(--muted)]">{r.before}</div>
                <div className="flex items-start gap-2 px-4 py-4 font-semibold">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: c.accentColor }} strokeWidth={3} />
                  {r.after}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STACK */}
      <section className="mt-20 bg-[var(--cream)] py-16">
        <div className="wrap narrow reveal">
          <p className="text-center text-[12px] font-extrabold uppercase tracking-[.2em]" style={{ color: c.accentColor }}>{c.stackLabel}</p>
          <h2 className="mt-2 text-center text-[28px] font-semibold leading-tight sm:text-[36px]">{rich(c.stackTitle)}</h2>

          <div className="card mt-8 p-5 sm:p-7" style={{ borderColor: c.accentColor, boxShadow: `0 12px 40px color-mix(in srgb, ${c.accentColor} 18%, transparent)` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: c.accentColor }}>
                  <BookOpen className="h-5 w-5" />
                </span>
                <h3 className="serif text-[20px] font-semibold leading-tight sm:text-[22px]">{c.mainTitle}</h3>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--cream)] px-2.5 py-1 text-[11px] font-extrabold" style={{ color: c.accentColor }}>{c.mainValue}</span>
            </div>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--muted)]">{c.mainDesc}</p>
            <ul className="mt-4 space-y-2">
              {c.mainBullets.map((b, i) => (
                <li key={i} className="flex gap-2 text-[14px]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: c.accentColor }} strokeWidth={3} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 space-y-3">
            {c.bonuses.map((b, i) => {
              const Icon = ICONS[b.icon] ?? Gift;
              return (
                <div key={i} className="card flex gap-4 p-4 sm:p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF4DC] text-[var(--gold2)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[15px] font-extrabold leading-tight">{b.title}</h3>
                      {b.value && <span className="shrink-0 text-[11px] font-extrabold text-[var(--gold2)]">{b.value}</span>}
                    </div>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--muted)]">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card mt-5 flex items-center justify-between p-5">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)]">{c.totalLabel}</p>
              <p className="strike serif text-[24px] text-[var(--muted)]">{c.totalValue}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: c.accentColor }}>{c.todayLabel}</p>
              <p className="serif text-[36px] font-semibold leading-none" style={{ color: c.accentColor }}>{price}</p>
            </div>
          </div>

          <button className="btn btn-accent mt-6" onClick={scrollToCheckout}>{c.primaryCta}</button>
          <p className="mt-2.5 text-center text-[12px] text-[var(--muted)]">{c.ctaSub}</p>
        </div>
      </section>

      {/* STEPS */}
      <section className="wrap mt-20">
        <div className="narrow reveal">
          <h2 className="text-center text-[28px] font-semibold leading-tight sm:text-[36px]">{rich(c.stepsTitle)}</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {c.steps.map((s, i) => (
              <li key={i} className="card p-5">
                <span className="serif text-[34px] font-semibold leading-none" style={{ color: c.accentColor }}>{i + 1}</span>
                <h3 className="mt-3 text-[16px] font-extrabold">{s.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--muted)]">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PREVIEW */}
      {c.pages.length > 0 && (
        <section className="mt-20 reveal">
          <h2 className="wrap text-center text-[28px] font-semibold leading-tight sm:text-[36px]">{rich(c.previewTitle)}</h2>
          <div className="pages-scroll mt-8">
            {c.pages.map((p, i) => (
              <figure key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.caption} className="card w-full object-cover" style={{ aspectRatio: "3/4" }} loading="lazy" />
                {p.caption && <figcaption className="mt-2 text-center text-[12px] text-[var(--muted)]">{p.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section className="wrap mt-20">
        <div className="reveal">
          <h2 className="text-center text-[28px] font-semibold leading-tight sm:text-[36px]">{rich(c.reviewsTitle)}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {c.reviews.map((r, i) => (
              <figure key={i} className="card p-5">
                <span className="flex" style={{ color: "#F2B705" }}>
                  {[0, 1, 2, 3, 4].map((k) => <Star key={k} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />)}
                </span>
                <blockquote className="serif mt-3 text-[16px] leading-relaxed">« {r.text} »</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  {r.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-extrabold text-white" style={{ background: c.accentColor }}>
                      {r.name.slice(0, 1)}
                    </span>
                  )}
                  <span>
                    <span className="block text-[13.5px] font-extrabold">{r.name}</span>
                    {r.meta && <span className="block text-[12px] text-[var(--muted)]">{r.meta}</span>}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="wrap mt-16">
        <div className="narrow reveal card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left" style={{ borderColor: c.accentColor }}>
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${c.accentColor} 12%, #fff)`, color: c.accentColor }}>
            <ShieldCheck className="h-8 w-8" />
          </span>
          <div>
            <h2 className="text-[22px] font-semibold leading-tight">{c.guaranteeTitle}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--muted)]">{rich(c.guaranteeText)}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap mt-16">
        <div className="narrow reveal faq">
          <h2 className="text-center text-[28px] font-semibold leading-tight sm:text-[36px]">{rich(c.faqTitle)}</h2>
          <div className="mt-8 space-y-2">
            {c.faq.map((f, i) => (
              <details key={i} className="card px-5 py-4">
                <summary className="flex items-center justify-between gap-3 text-[15px] font-extrabold">
                  {f.q}
                  <ChevronDown className="chev h-5 w-5 shrink-0 text-[var(--muted)] transition-transform" />
                </summary>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--muted)]">{rich(f.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CHECKOUT */}
      <section id="checkout" className="wrap mt-20 scroll-mt-16">
        <div className="narrow">
          <div className="card overflow-hidden">
            <div className="p-6 text-white" style={{ background: c.accentColor }}>
              <h2 className="text-[26px] font-semibold leading-tight">{c.checkoutTitle}</h2>
              <div className="mt-3 flex items-end gap-3">
                <span className="serif text-[40px] font-semibold leading-none">{price}</span>
                {compare && <span className="strike mb-1 text-[16px] opacity-80">{compare}</span>}
              </div>
              <p className="mt-1 text-[12.5px] opacity-90">{c.priceNote}</p>
              <ul className="mt-4 space-y-1.5">
                {c.checkoutBullets.map((b, i) => (
                  <li key={i} className="flex gap-2 text-[13.5px]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 sm:p-5">
              <CoranCheckoutEmbed createSession={createPackEmbeddedCheckout} />
            </div>
            <p className="flex items-center justify-center gap-1.5 pb-5 text-center text-[12px] text-[var(--muted)]">
              <Lock className="h-3.5 w-3.5" /> {c.checkoutSmall}
            </p>
          </div>
        </div>
      </section>

      <footer className="wrap mt-16 text-center text-[12px] text-[var(--muted)]">{c.footer}</footer>

      <StickyBar price={price} compare={compare} label={c.stickyText} cta={c.primaryCta} accent={c.accentColor} />
    </div>
  );
}

/* Bottom sticky CTA: appears after the hero, hides when the checkout is on screen. */
function StickyBar({ price, compare, label, cta, accent }: { price: string; compare: string | null; label: string; cta: string; accent: string }) {
  const [show, setShow] = useState(false);
  const raf = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const co = document.getElementById("checkout")?.getBoundingClientRect();
        const visible = !!co && co.top < window.innerHeight * 0.8 && co.bottom > 0;
        setShow(window.scrollY > 520 && !visible);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-white/95 backdrop-blur transition-transform duration-300 ${show ? "translate-y-0" : "translate-y-full"}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 leading-tight">
          <div className="flex items-baseline gap-2">
            <span className="serif text-[22px] font-semibold" style={{ color: accent }}>{price}</span>
            {compare && <span className="strike text-[13px] text-[var(--muted)]">{compare}</span>}
          </div>
          <span className="block truncate text-[11.5px] font-semibold text-[var(--muted)]">{label}</span>
        </div>
        <button onClick={scrollToCheckout} className="shrink-0 rounded-full px-5 py-3 text-[14px] font-extrabold text-white" style={{ background: accent }}>
          {cta.length > 22 ? "Je commande" : cta}
        </button>
      </div>
    </div>
  );
}
