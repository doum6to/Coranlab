"use client";

import { useState } from "react";
import {
  Check,
  Star,
  Plus,
  Minus,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Repeat,
  Heart,
} from "lucide-react";

import type { CoranLandingContent } from "@/lib/coran-landing-shared";
import { formatCoranPrice } from "@/lib/coran-landing-shared";
import { CoranCheckoutEmbed } from "../coran/checkout-embed";
import { createCoranPriereEmbeddedCheckout } from "@/actions/coran-priere-checkout";

const ORANGE = "#FF6A1A";

function scrollToCheckout() {
  document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Orange CTA button used everywhere, with the soft glow from the reference. */
function Cta({ label, className = "" }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={scrollToCheckout}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(255,106,26,0.7)] transition hover:brightness-105 active:scale-[0.99] ${className}`}
      style={{ backgroundColor: ORANGE }}
    >
      {label} <span aria-hidden>→</span>
    </button>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5" style={{ color: ORANGE }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
      ))}
    </div>
  );
}

/** A tilted device/preview frame; shows an image if provided, else a placeholder. */
function AppFrame({
  src,
  label,
  className = "",
}: {
  src?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-black/10 bg-neutral-900 shadow-2xl ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label || ""} className="block h-full w-full object-cover" />
      ) : (
        <div
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 text-white"
          style={{
            background: `linear-gradient(150deg, #1b1b1f 0%, #2a2118 60%, ${ORANGE}22 100%)`,
          }}
        >
          <BookOpen className="h-8 w-8" style={{ color: ORANGE }} />
          <span className="text-sm font-semibold opacity-80">{label || "Quranlab"}</span>
        </div>
      )}
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "Faut-il connaître l'arabe ?",
    a: "Non, pas du tout. La méthode part de zéro : chaque mot est écrit en arabe, en phonétique et traduit en français. Tu apprends à reconnaître les mots, pas à parler arabe couramment.",
  },
  {
    q: "Combien de temps par jour ?",
    a: "Quelques minutes suffisent. La méthode est faite pour tenir dans un quotidien chargé — dans les transports, avant de dormir, après une prière.",
  },
  {
    q: "C'est un abonnement ?",
    a: "Non. C'est un paiement unique qui te donne un accès à vie, sans abonnement et sans frais cachés.",
  },
  {
    q: "En combien de temps je vais voir la différence ?",
    a: "La plupart des gens reconnaissent leurs premiers mots dans leur prière dès les premiers jours. Plus tu avances, plus les passages s'éclairent.",
  },
  {
    q: "Et si ça ne me convient pas ?",
    a: "Tu es couvert par une garantie 30 jours : si tu n'es pas satisfait, tu es remboursé, sans avoir à te justifier.",
  },
  {
    q: "Comment je reçois mon accès ?",
    a: "Immédiatement après le paiement, par email. Tu crées ton compte avec le même email et ton accès Premium à vie est débloqué.",
  },
];

/**
 * Bespoke dark VSL-style landing for /comprendre-sa-priere, cloned from the
 * reference design (hero + "why so cheap" + how it works + value stack +
 * reviews + FAQ + final CTA + on-page checkout). Editable bits (title, price,
 * reviews, deliverables…) come from the admin content; structural copy is here.
 */
export function PriereVsl({ content }: { content: CoranLandingContent }) {
  const c = content;
  const [open, setOpen] = useState<number | null>(0);

  const todayPrice = formatCoranPrice(c.price.amountCents, c.price.currency);
  const comparePrice =
    c.price.compareAtCents > c.price.amountCents
      ? formatCoranPrice(c.price.compareAtCents, c.price.currency)
      : null;

  const bullets =
    c.deliverables.length > 0
      ? c.deliverables.slice(0, 3)
      : [
          "Les 500 mots essentiels du Coran",
          "Une méthode simple, quelques minutes par jour",
          "Accès Premium à vie à l'application",
        ];

  const stack = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Accès Premium à vie à l'app",
      desc: "Les 500 mots qui composent 85% du Coran, expliqués simplement.",
      value: "29 €",
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Le guide des 500 mots (PDF)",
      desc: "À garder, imprimer et réviser où tu veux.",
      value: "15 €",
    },
    {
      icon: <Repeat className="h-5 w-5" />,
      title: "Mises à jour & nouveaux contenus",
      desc: "L'app s'enrichit — tu en profites, à vie.",
      value: "5 €",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF8F3] font-sans text-neutral-900">
      <style>{`html{scroll-behavior:smooth}`}</style>

      {/* NAV */}
      <div className="sticky top-3 z-50 px-3">
        <nav className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full border border-white/10 bg-neutral-900/95 px-3 py-2 text-white shadow-lg backdrop-blur">
          <span className="flex items-center gap-1.5 pl-2 text-sm font-bold">
            <Sparkles className="h-4 w-4" style={{ color: ORANGE }} /> Quranlab
          </span>
          <div className="hidden items-center gap-5 text-xs font-medium text-neutral-300 sm:flex">
            <a href="#declic" className="hover:text-white">Le déclic</a>
            <a href="#etapes" className="hover:text-white">Comment ça marche</a>
            <a href="#inclus" className="hover:text-white">Ce que tu reçois</a>
            <a href="#avis" className="hover:text-white">Avis</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
          <button
            type="button"
            onClick={scrollToCheckout}
            className="rounded-full px-4 py-2 text-xs font-bold text-white"
            style={{ backgroundColor: ORANGE }}
          >
            Commencer
          </button>
        </nav>
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-4xl px-5 pt-12 text-center">
        <p className="text-sm font-extrabold tracking-wide" style={{ color: ORANGE }}>
          Accès à vie · Sans abonnement
        </p>
        <h1 className="mx-auto mt-2 max-w-2xl font-display text-3xl font-extrabold leading-[1.1] sm:text-5xl">
          {c.title}
        </h1>
        {c.subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-600">
            {c.subtitle}
          </p>
        )}

        {/* badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {["Sans apprendre l'arabe", "5 min par jour", "Accès à vie"].map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} /> {b}
            </span>
          ))}
        </div>

        {/* hero visual + bullets */}
        <div className="mt-9 grid items-center gap-6 sm:grid-cols-2 sm:text-left">
          <div className="relative mx-auto w-full max-w-sm">
            <div
              className="absolute inset-0 -rotate-6 rounded-2xl"
              style={{ backgroundColor: `${ORANGE}22` }}
            />
            <div className="absolute inset-0 rotate-3 rounded-2xl bg-neutral-900/10" />
            <AppFrame
              src={c.banners[0]}
              label="Quranlab · comprendre le Coran"
              className="relative aspect-[3/4]"
            />
          </div>

          <ul className="mx-auto max-w-sm space-y-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] font-medium">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: ORANGE }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>{b}</span>
              </li>
            ))}
            <li className="pt-2">
              <Cta label={c.ctaLabel || "Je veux comprendre ma prière"} className="w-full sm:w-auto" />
            </li>
          </ul>
        </div>

        {/* social proof */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {["🧕", "🧔", "👳", "🧕🏽"].map((e, i) => (
              <span
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#FAF8F3] bg-neutral-200 text-sm"
              >
                {e}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-neutral-500">
            Rejoins 1 500+ musulmans qui comprennent enfin leur prière
          </span>
        </div>
      </section>

      {/* THE CATCH → "pourquoi si peu cher" */}
      <section id="declic" className="mx-auto mt-16 max-w-4xl px-5">
        <div className="overflow-hidden rounded-3xl bg-neutral-950 text-white">
          <div className="grid gap-6 p-7 sm:grid-cols-[1fr_1.3fr] sm:p-9">
            <AppFrame label="Notre mission" className="aspect-[4/3] self-center" src={c.banners[1]} />
            <div>
              <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                Attends — pourquoi seulement {todayPrice}&nbsp;?
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-300">
                <p>
                  Je sais ce que tu penses : «&nbsp;comprendre le Coran, ça devrait coûter cher, ou
                  prendre des années.&nbsp;» Laisse-moi être honnête avec toi.
                </p>
                <p>
                  Notre but n&apos;est pas de faire de l&apos;argent sur un livre. C&apos;est que le maximum de
                  musulmans <span style={{ color: ORANGE }} className="font-semibold">comprennent enfin ce qu&apos;ils récitent</span>.
                </p>
                <p>
                  Alors on a rendu le prix ridicule exprès&nbsp;: {comparePrice ? `${comparePrice} de valeur, ` : ""}
                  {todayPrice} aujourd&apos;hui, une fois, à vie. Aucun abonnement, aucun piège.
                </p>
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-sm font-semibold">Mamadou</p>
                <p className="text-xs text-neutral-400">Fondateur de Quranlab</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="etapes" className="mx-auto mt-16 max-w-4xl px-5">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Comment ça marche</h2>
        <div className="mt-8 space-y-8">
          {[
            {
              n: "1",
              icon: <BookOpen className="h-5 w-5" />,
              title: "Débloque les 500 mots",
              desc: "Le cœur du Coran, réuni au même endroit et expliqué simplement, du plus fréquent au plus rare.",
              img: c.samples[0]?.cover,
            },
            {
              n: "2",
              icon: <Repeat className="h-5 w-5" />,
              title: "Apprends quelques minutes par jour",
              desc: "Une méthode de répétition simple qui ancre les mots sans effort. Aucune grammaire compliquée.",
              img: c.gifs[0],
            },
            {
              n: "3",
              icon: <Heart className="h-5 w-5" />,
              title: "Comprends enfin ta prière",
              desc: "Tu ne récites plus dans le vide : tu reconnais les mots, tu comprends, tu ressens.",
              img: c.banners[2],
            },
          ].map((s, i) => (
            <div
              key={s.n}
              className={`grid items-center gap-5 sm:grid-cols-2 ${
                i % 2 === 1 ? "sm:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: ORANGE }}
                >
                  {s.icon} Étape {s.n}
                </span>
                <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.desc}</p>
              </div>
              <AppFrame src={s.img} label={`Étape ${s.n}`} className="aspect-[4/3]" />
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Cta label={c.ctaLabel || "Commencer maintenant"} />
        </div>
      </section>

      {/* FULL STACK / VALUE */}
      <section id="inclus" className="mx-auto mt-16 max-w-4xl px-5">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
          Tout est inclus. <span style={{ color: ORANGE }}>À vie.</span>
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-neutral-500">
          Tout ce dont tu as besoin pour comprendre ta prière, dans un seul accès.
        </p>

        <div className="mx-auto mt-7 max-w-xl overflow-hidden rounded-3xl bg-neutral-950 text-white">
          <div className="flex items-center justify-between px-6 pt-5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Ton accès</span>
            <span>Valeur</span>
          </div>
          <div className="divide-y divide-white/10 px-6">
            {stack.map((item) => (
              <div key={item.title} className="flex items-start gap-3 py-4">
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: `${ORANGE}33`, color: ORANGE }}
                >
                  {item.icon}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-xs leading-relaxed text-neutral-400">{item.desc}</p>
                </div>
                <span className="text-sm font-semibold text-neutral-300 line-through decoration-neutral-500">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-6 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Valeur totale
              </p>
              <p className="text-lg font-bold text-neutral-300 line-through decoration-neutral-500">
                {comparePrice || "49 €"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Ton prix aujourd&apos;hui
              </p>
              <p className="text-3xl font-extrabold" style={{ color: ORANGE }}>
                {todayPrice}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Cta label={c.ctaLabel || "Je débloque mon accès à vie"} />
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            {c.guarantee || "Paiement sécurisé · Garantie 30 jours"}
          </p>
        </div>
      </section>

      {/* REVIEWS */}
      {c.reviews.length > 0 && (
        <section id="avis" className="mx-auto mt-16 max-w-4xl px-5">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
            Ils ressentent enfin leur prière
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {c.reviews.slice(0, 6).map((r, i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <Stars />
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">{r.text}</p>
                {r.name && (
                  <p className="mt-3 text-xs font-semibold text-neutral-500">{r.name}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="mx-auto mt-16 max-w-2xl px-5">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Questions fréquentes</h2>
        <div className="mt-8 space-y-2.5">
          {FAQ_ITEMS.map((item, i) => {
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
                {isOpen && (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-neutral-600">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CHECKOUT */}
      <section className="mx-auto mt-16 max-w-xl px-5">
        <div id="checkout" className="scroll-mt-20 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold">{todayPrice}</span>
            {comparePrice && (
              <span className="text-sm text-neutral-400 line-through">{comparePrice}</span>
            )}
            <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              Accès à vie
            </span>
          </div>
          <CoranCheckoutEmbed createSession={createCoranPriereEmbeddedCheckout} />
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            {c.guarantee || "Paiement sécurisé · Garantie 30 jours"}
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto mt-16 max-w-4xl px-5 pb-20">
        <div className="rounded-3xl bg-neutral-950 px-6 py-12 text-center text-white">
          <Sparkles className="mx-auto mb-3 h-6 w-6" style={{ color: ORANGE }} />
          <h2 className="mx-auto max-w-lg text-2xl font-extrabold leading-tight sm:text-3xl">
            Ton accès à vie est à <span style={{ color: ORANGE }}>un clic</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400">
            Les 500 mots, l&apos;app, le guide PDF — pour comprendre enfin ce que tu récites. Un seul
            paiement, sans abonnement.
          </p>
          <div className="mt-6">
            <Cta label={c.ctaLabel || "Je veux comprendre ma prière"} />
          </div>
          <p className="mt-3 text-xs text-neutral-500">Accès immédiat · Garantie 30 jours</p>
        </div>
      </section>

      <footer className="pb-10 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} Quranlab · comprends le Coran
      </footer>
    </div>
  );
}
