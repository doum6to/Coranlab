import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Check, Lock, Star as StarIcon, X } from "lucide-react";

import { formatEuros, type OfferSettings } from "@/lib/offer";
import type { LandingContent } from "@/lib/landing-content";
import { BuyButton } from "./buy-button";
import { Faq } from "./faq";
import { LandingReviews } from "./reviews";
import { SpotsProgress } from "./spots";
import { ProductGallery } from "./product-gallery";

/**
 * Screenshots of the real post-payment flow, paired with the "Comment ça se
 * passe" steps by index: paiement confirmé → création du compte → l'app.
 */
const HOW_SHOTS = [
  "/onboarding/1-paiement.jpeg",
  "/onboarding/2-compte.jpeg",
  "/onboarding/3-app.jpeg",
];

function Placeholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-100 text-xs text-neutral-400 ${className}`}
    >
      Image à venir
    </div>
  );
}

function Stars() {
  return (
    <div className="flex items-center gap-0.5 text-[#f6c343]">
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
      ))}
    </div>
  );
}

export function ProductLanding({
  content,
  offer,
}: {
  content: LandingContent;
  offer: OfferSettings;
}) {
  const { priceCents, compareAtCents, spotsJoined, spotsTotal } = offer;
  const PRICE = formatEuros(priceCents);
  const COMPARE =
    compareAtCents > priceCents ? formatEuros(compareAtCents) : null;
  const priceValue = priceCents / 100;
  const p = content.product;
  const hidden = new Set(content.hidden ?? []);
  const show = (k: string) => !hidden.has(k);

  return (
    <div className="w-full bg-white text-neutral-900 font-sans">
      {/* top bar */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/85motscoran" aria-label="Accueil Quranlab">
            <Image
              src="/quranlab-logo.svg"
              alt="Quranlab"
              width={140}
              height={44}
              priority
              className="h-8 sm:h-9 w-auto"
            />
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full bg-neutral-950 px-4 py-2 text-xs sm:text-sm font-semibold text-white"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* PRODUCT HERO */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* gallery */}
          <ProductGallery
            images={p.gallery}
            alt={p.title}
            showThumbnails={p.showThumbnails}
          />

          {/* info / buy box */}
          <div className="lg:py-4">
            <div className="flex items-center gap-2">
              <Stars />
              <span className="text-sm text-neutral-500">{p.rating}</span>
            </div>
            <h1 className="mt-3 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight text-neutral-950">
              {p.title}
            </h1>
            <p className="mt-3 text-base text-neutral-600 leading-relaxed whitespace-pre-line">
              {p.subtitle}
            </p>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display font-bold text-4xl text-neutral-950">
                {PRICE}
              </span>
              {COMPARE && (
                <span className="text-xl text-neutral-400 line-through">
                  {COMPARE}
                </span>
              )}
              <span className="rounded-full bg-[#6967fb]/10 px-2.5 py-1 text-xs font-bold text-[#6967fb]">
                Offre de lancement
              </span>
            </div>

            <ul className="mt-5 space-y-2">
              {p.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-sm text-neutral-700"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#58cc6a]"
                    strokeWidth={3}
                  />
                  {b}
                </li>
              ))}
            </ul>

            <BuyButton
              className="mt-6"
              label={content.offer.buttonLabel}
              subLabel={content.offer.buttonSub}
              priceValue={priceValue}
            />
            <SpotsProgress
              tone="light"
              joined={spotsJoined}
              total={spotsTotal}
              priceLabel={PRICE}
              compareLabel={COMPARE ?? undefined}
            />
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
              <Lock className="h-3 w-3" strokeWidth={1.5} />
              {p.guarantee}
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      {show("p_benefits") && (
      <section className="bg-[#FAF8F3] border-y border-neutral-200/70">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-center font-display font-bold text-2xl sm:text-3xl text-neutral-950">
            {p.benefitsHeading}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {p.benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-3xl border-2 border-neutral-900/10 bg-white p-6 text-center"
              >
                <h3 className="font-display font-bold text-lg text-neutral-950">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* INSIDE */}
      {show("p_inside") && (
      <section className="mx-auto max-w-[1000px] px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-center font-display font-bold text-2xl sm:text-3xl text-neutral-950">
          {p.insideHeading}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {p.insideItems.map((it) => (
            <div
              key={it.title}
              className="flex gap-4 rounded-3xl border-2 border-neutral-900/10 bg-white p-4"
            >
              {it.image ? (
                <Image
                  src={it.image}
                  alt=""
                  width={160}
                  height={200}
                  className="h-24 w-20 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <Placeholder className="h-24 w-20 shrink-0" />
              )}
              <div>
                <h3 className="font-display font-bold text-neutral-950">
                  {it.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                  {it.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* HOW — post-payment onboarding, illustrated with real screenshots */}
      {show("p_how") && (
      <section className="bg-[#FAF8F3] border-y border-neutral-200/70">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-center font-display font-bold text-2xl sm:text-3xl text-neutral-950">
            {p.howHeading}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {p.steps.map((s, i) => {
              const shot = HOW_SHOTS[i];
              return (
                <div key={s.title} className="flex flex-col items-center text-center">
                  {shot ? (
                    <div className="relative mb-5 w-[180px] overflow-hidden rounded-[28px] border-[6px] border-neutral-900 bg-white shadow-xl">
                      <Image
                        src={shot}
                        alt={s.title}
                        width={360}
                        height={720}
                        className="h-auto w-full"
                      />
                    </div>
                  ) : null}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6967fb] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-display font-bold text-lg text-neutral-950">
                    {s.title.replace(/^\d+\.\s*/, "")}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                    {s.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* COMPARISON */}
      {show("p_compare") && (
      <section className="mx-auto max-w-[760px] px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-center font-display font-bold text-2xl sm:text-3xl text-neutral-950">
          {p.compareHeading}
        </h2>
        <div className="mt-8 overflow-hidden rounded-3xl border-2 border-neutral-900/10">
          <div className="grid grid-cols-[1fr_auto_auto] bg-neutral-950 text-white text-xs sm:text-sm font-bold">
            <div className="px-4 py-3" />
            <div className="px-3 py-3 text-center sm:px-5">{p.compareUs}</div>
            <div className="px-3 py-3 text-center text-white/60 sm:px-5">
              {p.compareThem}
            </div>
          </div>
          {p.compareRows.map((row, i) => (
            <div
              key={row}
              className={`grid grid-cols-[1fr_auto_auto] items-center ${
                i % 2 ? "bg-[#FAF8F3]" : "bg-white"
              }`}
            >
              <div className="px-4 py-3 text-sm text-neutral-700">{row}</div>
              <div className="flex justify-center px-3 py-3 sm:px-5">
                <Check className="h-5 w-5 text-[#58cc6a]" strokeWidth={3} />
              </div>
              <div className="flex justify-center px-3 py-3 sm:px-5">
                <X className="h-5 w-5 text-neutral-300" strokeWidth={3} />
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* REVIEWS */}
      {show("reviews") && (
      <section className="bg-[#FAF8F3] border-y border-neutral-200/70">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              {content.reviews.eyebrow}
            </p>
            <h2 className="mt-3 font-display font-bold text-2xl sm:text-3xl text-neutral-950">
              {content.reviews.heading}
            </h2>
          </div>
          <LandingReviews
            items={content.reviews.items}
            screenshots={content.reviews.screenshots}
          />
        </div>
      </section>
      )}

      {/* FOUNDER */}
      {show("p_founder") && (
      <section className="mx-auto max-w-[860px] px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid items-center gap-8 sm:grid-cols-[200px_1fr]">
          <div className="mx-auto sm:mx-0">
            {p.founderImage ? (
              <Image
                src={p.founderImage}
                alt=""
                width={300}
                height={300}
                className="h-40 w-40 rounded-2xl object-cover"
              />
            ) : (
              <Placeholder className="h-40 w-40" />
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="font-display font-bold text-2xl text-neutral-950">
              {p.founderHeading}
            </h2>
            <p className="mt-3 text-base text-neutral-600 leading-relaxed whitespace-pre-line">
              {p.founderText}
            </p>
          </div>
        </div>
      </section>
      )}

      {/* OFFER CARD */}
      <section
        id="offre"
        className="bg-[#FAF8F3] border-t border-neutral-200/70"
      >
        <div className="mx-auto max-w-[560px] px-4 sm:px-6 py-14 sm:py-20">
          <div className="relative overflow-hidden rounded-[32px] bg-neutral-950 p-8 sm:p-12 text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#6967fb] opacity-40 blur-3xl"
            />
            <div className="relative text-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-white/50">
                {content.offer.eyebrow}
              </p>
              <div className="mt-4 flex items-baseline justify-center gap-2">
                {COMPARE && (
                  <span className="font-display text-3xl text-white/40 line-through">
                    {COMPARE}
                  </span>
                )}
                <span className="font-display font-bold text-6xl sm:text-7xl tracking-tight">
                  {PRICE}
                </span>
                <span className="text-sm text-white/60">une seule fois</span>
              </div>
              <p className="mt-2 text-xs text-white/50">
                {content.offer.cycleNote}
              </p>

              <ul className="mt-10 space-y-3 text-left max-w-[360px] mx-auto">
                {content.offer.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-white/90"
                  >
                    <BadgeCheck
                      className="h-4 w-4 shrink-0 mt-0.5 text-[#a6a5ff]"
                      strokeWidth={2.5}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <BuyButton
                className="mt-10"
                label={content.offer.buttonLabel}
                subLabel={content.offer.buttonSub}
                priceValue={priceValue}
              />
              <SpotsProgress
                tone="dark"
                joined={spotsJoined}
                total={spotsTotal}
                priceLabel={PRICE}
                compareLabel={COMPARE ?? undefined}
              />
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
                <Lock className="h-3 w-3" strokeWidth={1.5} />
                {content.offer.secure}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {show("faq") && (
      <section className="mx-auto max-w-[820px] px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
            {content.faq.eyebrow}
          </p>
          <h2 className="mt-3 font-display font-bold text-2xl sm:text-3xl text-neutral-950">
            {content.faq.heading}
          </h2>
        </div>
        <Faq items={content.faq.items} />
      </section>
      )}

      <div aria-hidden className="h-24" />
    </div>
  );
}
