"use client";

import { useState } from "react";
import { Check, Star, Plus, Minus, ShieldCheck, Sparkles, BookOpen } from "lucide-react";

import type { PriereVslContent } from "@/lib/priere-vsl-shared";
import { formatCoranPrice } from "@/lib/coran-landing-shared";
import { CoranCheckoutEmbed } from "../coran/checkout-embed";
import { createCoranPriereEmbeddedCheckout } from "@/actions/coran-priere-checkout";

function scrollToCheckout() {
  document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Bespoke, fully admin-editable dark VSL landing for /comprendre-sa-priere.
 * Every string, image, color and list comes from `content` (PriereVslContent).
 */
export function PriereVsl({ content: c }: { content: PriereVslContent }) {
  const accent = c.accentColor || "#FF6A1A";
  const [open, setOpen] = useState<number | null>(0);

  const todayPrice = formatCoranPrice(c.price.amountCents, c.price.currency);
  const comparePrice =
    c.price.compareAtCents > c.price.amountCents
      ? formatCoranPrice(c.price.compareAtCents, c.price.currency)
      : null;

  const declicHeading = c.declicHeading.replace(/\{price\}/g, todayPrice);

  const Cta = ({ label, className = "" }: { label: string; className?: string }) => (
    <button
      type="button"
      onClick={scrollToCheckout}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(255,106,26,0.6)] transition hover:brightness-105 active:scale-[0.99] ${className}`}
      style={{ backgroundColor: accent }}
    >
      {label} <span aria-hidden>→</span>
    </button>
  );

  const Stars = () => (
    <div className="flex gap-0.5" style={{ color: accent }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
      ))}
    </div>
  );

  const AppFrame = ({
    src,
    label,
    className = "",
  }: {
    src?: string;
    label?: string;
    className?: string;
  }) => (
    <div className={`overflow-hidden rounded-2xl border border-black/10 bg-neutral-900 shadow-2xl ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label || ""} className="block h-full w-full object-cover" />
      ) : (
        <div
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 text-white"
          style={{ background: `linear-gradient(150deg, #1b1b1f 0%, #2a2118 60%, ${accent}22 100%)` }}
        >
          <BookOpen className="h-8 w-8" style={{ color: accent }} />
          <span className="text-sm font-semibold opacity-80">{label || c.brand}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full font-sans text-neutral-900" style={{ backgroundColor: c.bgColor }}>
      <style>{`html{scroll-behavior:smooth}`}</style>

      {/* NAV */}
      <div className="sticky top-3 z-50 px-3">
        <nav className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full border border-white/10 bg-neutral-900/95 px-3 py-2 text-white shadow-lg backdrop-blur">
          <span className="flex items-center gap-1.5 pl-2 text-sm font-bold">
            <Sparkles className="h-4 w-4" style={{ color: accent }} /> {c.brand}
          </span>
          <div className="hidden items-center gap-5 text-xs font-medium text-neutral-300 sm:flex">
            {c.navLinks.map((l, i) => (
              <a key={i} href={`#${l.anchor}`} className="hover:text-white">
                {l.label}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={scrollToCheckout}
            className="rounded-full px-4 py-2 text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            {c.navCta}
          </button>
        </nav>
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-4xl px-5 pt-12 text-center">
        {c.eyebrow && (
          <p className="text-sm font-extrabold tracking-wide" style={{ color: accent }}>
            {c.eyebrow}
          </p>
        )}
        <h1 className="mx-auto mt-2 max-w-2xl font-display text-3xl font-extrabold leading-[1.1] sm:text-5xl">
          {c.title}
        </h1>
        {c.subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-600">{c.subtitle}</p>
        )}

        {c.badges.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {c.badges.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} /> {b}
              </span>
            ))}
          </div>
        )}

        <div className="mt-9 grid items-center gap-6 sm:grid-cols-2 sm:text-left">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 -rotate-6 rounded-2xl" style={{ backgroundColor: `${accent}22` }} />
            <div className="absolute inset-0 rotate-3 rounded-2xl bg-neutral-900/10" />
            <AppFrame src={c.heroImage} label={c.brand} className="relative aspect-[3/4]" />
          </div>

          <ul className="mx-auto max-w-sm space-y-3">
            {c.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] font-medium">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: accent }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>{b}</span>
              </li>
            ))}
            <li className="pt-2">
              <Cta label={c.heroCta} className="w-full sm:w-auto" />
            </li>
          </ul>
        </div>

        {(c.socialProof || c.avatars.length > 0) && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {c.avatars.length > 0 && (
              <div className="flex -space-x-2">
                {c.avatars.map((e, i) => (
                  <span
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-neutral-200 text-sm"
                    style={{ borderColor: c.bgColor }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}
            {c.socialProof && (
              <span className="text-xs font-medium text-neutral-500">{c.socialProof}</span>
            )}
          </div>
        )}
      </section>

      {/* DÉCLIC */}
      <section id="declic" className="mx-auto mt-16 max-w-4xl px-5">
        <div className="overflow-hidden rounded-3xl bg-neutral-950 text-white">
          <div className="grid gap-6 p-7 sm:grid-cols-[1fr_1.3fr] sm:p-9">
            <AppFrame src={c.declicImage} label="Notre mission" className="aspect-[4/3] self-center" />
            <div>
              <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">{declicHeading}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-300">
                {c.declicParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {(c.declicAuthorName || c.declicAuthorRole) && (
                <div className="mt-5 border-t border-white/10 pt-4">
                  {c.declicAuthorName && <p className="text-sm font-semibold">{c.declicAuthorName}</p>}
                  {c.declicAuthorRole && <p className="text-xs text-neutral-400">{c.declicAuthorRole}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="etapes" className="mx-auto mt-16 max-w-4xl px-5">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">{c.stepsHeading}</h2>
        <div className="mt-8 space-y-8">
          {c.steps.map((step, i) => (
            <div
              key={i}
              className={`grid items-center gap-5 sm:grid-cols-2 ${i % 2 === 1 ? "sm:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                {step.badge && (
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {step.badge}
                  </span>
                )}
                <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.desc}</p>
              </div>
              <AppFrame src={step.image} label={step.badge} className="aspect-[4/3]" />
            </div>
          ))}
        </div>
        {c.stepsCta && (
          <div className="mt-8 text-center">
            <Cta label={c.stepsCta} />
          </div>
        )}
      </section>

      {/* FULL STACK / VALUE */}
      <section id="inclus" className="mx-auto mt-16 max-w-4xl px-5">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">{c.stackHeading}</h2>
        {c.stackSubheading && (
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-neutral-500">{c.stackSubheading}</p>
        )}

        <div className="mx-auto mt-7 max-w-xl overflow-hidden rounded-3xl bg-neutral-950 text-white">
          <div className="flex items-center justify-between px-6 pt-5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Ton accès</span>
            <span>Valeur</span>
          </div>
          <div className="divide-y divide-white/10 px-6">
            {c.stackItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-4">
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${accent}33`, color: accent }}
                >
                  <Check className="h-5 w-5" strokeWidth={3} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-xs leading-relaxed text-neutral-400">{item.desc}</p>
                </div>
                {item.value && (
                  <span className="text-sm font-semibold text-neutral-300 line-through decoration-neutral-500">
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-6 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {c.stackTotalLabel}
              </p>
              <p className="text-lg font-bold text-neutral-300 line-through decoration-neutral-500">
                {comparePrice || "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {c.stackTodayLabel}
              </p>
              <p className="text-3xl font-extrabold" style={{ color: accent }}>
                {todayPrice}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Cta label={c.stackCta} />
          {c.guarantee && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {c.guarantee}
            </p>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      {c.reviews.length > 0 && (
        <section id="avis" className="mx-auto mt-16 max-w-4xl px-5">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">{c.reviewsHeading}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {c.reviews.slice(0, 6).map((r, i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <Stars />
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">{r.text}</p>
                {r.name && <p className="mt-3 text-xs font-semibold text-neutral-500">{r.name}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {c.faq.length > 0 && (
        <section id="faq" className="mx-auto mt-16 max-w-2xl px-5">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">{c.faqHeading}</h2>
          <div className="mt-8 space-y-2.5">
            {c.faq.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="text-sm font-semibold">{item.q}</span>
                    {isOpen ? (
                      <Minus className="h-4 w-4 shrink-0 text-neutral-400" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0 text-neutral-400" />
                    )}
                  </button>
                  {isOpen && <p className="px-4 pb-4 text-sm leading-relaxed text-neutral-600">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CHECKOUT */}
      <section className="mx-auto mt-16 max-w-xl px-5">
        <div id="checkout" className="scroll-mt-20 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold">{todayPrice}</span>
            {comparePrice && <span className="text-sm text-neutral-400 line-through">{comparePrice}</span>}
            {c.checkoutBadge && (
              <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                {c.checkoutBadge}
              </span>
            )}
          </div>
          <CoranCheckoutEmbed createSession={createCoranPriereEmbeddedCheckout} />
          {c.guarantee && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {c.guarantee}
            </p>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto mt-16 max-w-4xl px-5 pb-20">
        <div className="rounded-3xl bg-neutral-950 px-6 py-12 text-center text-white">
          <Sparkles className="mx-auto mb-3 h-6 w-6" style={{ color: accent }} />
          <h2 className="mx-auto max-w-lg text-2xl font-extrabold leading-tight sm:text-3xl">
            {c.finalHeading}
          </h2>
          {c.finalSubtext && (
            <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400">{c.finalSubtext}</p>
          )}
          <div className="mt-6">
            <Cta label={c.finalCta} />
          </div>
          {c.finalFinePrint && <p className="mt-3 text-xs text-neutral-500">{c.finalFinePrint}</p>}
        </div>
      </section>

      {c.footer && (
        <footer className="pb-10 text-center text-xs text-neutral-400">{c.footer}</footer>
      )}
    </div>
  );
}
