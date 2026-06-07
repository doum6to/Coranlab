import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Clock, Play, ShieldCheck, X } from "lucide-react";

import { BuyButton } from "./buy-button";
import { StickyCta } from "./sticky-cta";

export const dynamic = "force-static";
export const revalidate = 3600;

const GOLD = "#e0b34a";

export const metadata: Metadata = {
  title: "Lire l'arabe en moins de 7h — sans devoirs, sans cahier | Quranlab",
  description:
    "La méthode pour apprendre à lire l'arabe en moins de 7h, sans devoirs, sans stylo et sans cahier. 21 cours en vidéo. Accès à vie, paiement unique, satisfait ou remboursé.",
  alternates: { canonical: "https://www.quranlab.app/lire-larabe" },
  openGraph: {
    title: "Lire l'arabe en moins de 7h",
    description: "Sans devoirs, sans stylo et sans cahier. 21 cours en vidéo.",
    url: "https://www.quranlab.app/lire-larabe",
    siteName: "Quranlab",
    locale: "fr_FR",
    type: "website",
  },
};

const chapters = [
  "Différence entre l'enseignement classique et la méthode master",
  "La science perdue des arabes",
  "Faut-il apprendre l'alphabet entièrement ?",
  "La première famille",
  "La première lettre emphatique",
  "Premiers exercices : les trios",
  "La deuxième famille : les jumeaux (1/3)",
  "La deuxième famille : les jumeaux (2/3)",
  "Exercice 3 : les jumeaux",
  "Exercice 4 : les jumeaux",
  "La deuxième famille : les jumeaux (3/3)",
  "La troisième famille : les solos",
  "Exercice 5 : les solos, lettres",
  "Exercice 6 : les solos, chiffres",
  "Chapitre 2 : l'attachement des lettres",
  "Règle 1 : les 6 lettres qui ne s'attachent pas à gauche",
  "Règle 2 : la méthode LUC",
  "Exercice : méthode LUC",
  "Règle 3 : les 5 lettres qui ne changent pas",
  "Chapitre 3 : les voyelles courtes",
  "Chapitre 3 : les voyelles longues",
];

const steps = [
  {
    n: "01",
    title: "21 cours en vidéo",
    text: "Des leçons structurées et progressives pour apprendre l'arabe pas à pas.",
  },
  {
    n: "02",
    title: "Apprends à ton rythme",
    text: "Accès 24h/24, depuis ton téléphone ou ton ordinateur, où tu veux.",
  },
  {
    n: "03",
    title: "Résultats rapides",
    text: "Commence à lire le Coran en arabe en moins de 7h de formation.",
  },
  {
    n: "04",
    title: "Accès à vie",
    text: "Paiement unique, reviens autant de fois que tu veux, sans limite.",
  },
];

const classic = [
  "Des années d'études nécessaires",
  "Devoirs, stylo, cahier… c'est l'école",
  "Pas de suivi personnalisé",
  "Méthode ennuyeuse et démotivante",
];
const ours = [
  "Résultats en moins de 7h",
  "Sans devoirs, sans stylo, sans cahier",
  "100% en ligne, à ton rythme",
  "Méthode fun et engageante",
];

const features = [
  "21 cours en vidéo structurés et progressifs",
  "Accès complet au e-learning 24h/24",
  "Apprends à ton rythme, où tu veux",
  "Méthode éprouvée : lis le Coran en moins de 7h",
  "Compatible téléphone et ordinateur",
  "Mises à jour gratuites incluses",
  "Accès à vie — paiement unique",
];

const faq = [
  {
    q: "Je suis un vrai débutant, est-ce pour moi ?",
    a: "Oui, à 100%. La méthode part de zéro : tu n'as besoin d'aucune connaissance préalable. Tout est expliqué pas à pas.",
  },
  {
    q: "Combien de temps faut-il pour savoir lire ?",
    a: "La formation est conçue pour te faire lire l'arabe en moins de 7h au total — à ton rythme, en une fois ou sur plusieurs jours.",
  },
  {
    q: "Comment se déroule la formation ?",
    a: "21 cours en vidéo, accessibles 24h/24 depuis ton espace, sur téléphone ou ordinateur. Tu avances quand tu veux.",
  },
  {
    q: "Et si j'ai des horaires compliqués ?",
    a: "Aucun souci : l'accès est à vie et disponible à toute heure. Tu apprends 10 minutes par-ci par-là, sans contrainte.",
  },
  {
    q: "Est-ce un paiement unique ou un abonnement ?",
    a: "Un paiement unique, sans abonnement. Tu paies une fois et tu gardes l'accès à vie.",
  },
];

function VideoBox({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}
    >
      <div className="flex flex-col items-center gap-2 text-white/40">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: GOLD }}
        >
          <Play className="h-6 w-6 fill-neutral-900 text-neutral-900" />
        </span>
        <span className="text-xs">{label}</span>
      </div>
    </div>
  );
}

const TrustRow = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/60">
    <span className="inline-flex items-center gap-1.5">
      <ShieldCheck className="h-4 w-4" style={{ color: GOLD }} /> Paiement unique
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Clock className="h-4 w-4" style={{ color: GOLD }} /> Accès à vie
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-4 w-4" style={{ color: GOLD }} /> Satisfait ou
      remboursé
    </span>
  </div>
);

export default function LireLArabePage() {
  return (
    <div className="w-full bg-neutral-950 text-white">
      <StickyCta />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(224,179,74,0.18) 0%, rgba(224,179,74,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[860px] px-5 sm:px-8 pt-6 pb-14 sm:pb-20">
          <div className="flex justify-center">
            <Link href="/85motscoran" aria-label="Accueil Quranlab">
              <Image
                src="/quranlab-logo.svg"
                alt="Quranlab"
                width={160}
                height={52}
                priority
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
          </div>

          <div className="mt-12 text-center">
            <span
              className="inline-block rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ borderColor: `${GOLD}55`, color: GOLD }}
            >
              Méthode Master
            </span>
            <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Comment lire l&apos;arabe en{" "}
              <span style={{ color: GOLD }}>moins de 7h</span> ?
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/70">
              Sans devoirs, sans stylo et sans cahier…
            </p>
          </div>

          <div className="mt-10">
            <VideoBox label="Vidéo de présentation (à venir)" />
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <BuyButton className="w-full max-w-[360px]" />
            <TrustRow />
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-[1000px] px-5 sm:px-8 py-14 sm:py-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Tu n&apos;y crois toujours pas ?
            </h2>
            <p className="mt-3 text-white/60">
              Écoute ce que disent nos élèves
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <VideoBox key={i} label={`Témoignage ${i} (à venir)`} />
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="border-t border-white/10">
        <div className="mx-auto max-w-[560px] px-5 sm:px-8 py-16 sm:py-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Rejoins Quranlab maintenant
            </h2>
            <p className="mt-3 text-sm text-white/60">
              Accès à vie • Paiement unique • Satisfait ou remboursé
            </p>
          </div>

          <div
            className="relative overflow-hidden rounded-[28px] border bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 sm:p-10"
            style={{ borderColor: `${GOLD}40` }}
          >
            <p
              className="text-center text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              Accès complet
            </p>
            <p className="mt-1 text-center text-sm text-white/50">
              Paiement unique — Accès à vie
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-white/40 line-through">
                97€
              </span>
              <span className="text-6xl font-extrabold" style={{ color: GOLD }}>
                27€
              </span>
            </div>
            <p className="mt-2 text-center text-sm font-semibold text-[#e0b34a]">
              Économise 70€ !
            </p>

            <ul className="mt-8 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/85">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: GOLD }}
                    strokeWidth={3}
                  />
                  {f}
                </li>
              ))}
            </ul>

            <BuyButton className="mt-8" label="Je veux lire en arabe !" />
            <p className="mt-3 text-center text-[11px] text-white/40">
              Paiement unique • Sécurisé • Accès à vie
            </p>
          </div>
        </div>
      </section>

      {/* MÉTHODE */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-[1000px] px-5 sm:px-8 py-16 sm:py-20">
          <div className="text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              Méthode
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
              Comment ça marche ?
            </h2>
            <p className="mt-3 text-white/60">
              C&apos;est simple : tu t&apos;inscris et tu commences immédiatement.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <span
                  className="text-3xl font-extrabold"
                  style={{ color: GOLD }}
                >
                  {s.n}
                </span>
                <h3 className="mt-3 font-bold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPITRES */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-[820px] px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold">
            Le programme — 21 cours
          </h2>
          <div className="mt-8 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
            {chapters.map((c, i) => (
              <div
                key={c}
                className="flex items-center gap-4 px-4 py-3.5 sm:px-6"
              >
                <span
                  className="w-7 shrink-0 text-sm font-bold tabular-nums"
                  style={{ color: GOLD }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-white/85">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold">
            Pourquoi les méthodes classiques ne fonctionnent pas ?
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-bold text-white/70">Méthodes classiques</h3>
              <ul className="mt-4 space-y-3">
                {classic.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-3 text-sm text-white/60"
                  >
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" strokeWidth={3} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl border bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6"
              style={{ borderColor: `${GOLD}40` }}
            >
              <h3 className="font-bold" style={{ color: GOLD }}>
                Méthode Quranlab
              </h3>
              <ul className="mt-4 space-y-3">
                {ours.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-3 text-sm text-white/90"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: GOLD }}
                      strokeWidth={3}
                    />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-[760px] px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold">
            Questions fréquentes
          </h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {faq.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-semibold text-white">{item.q}</span>
                  <span
                    className="text-xl transition-transform group-open:rotate-45"
                    style={{ color: GOLD }}
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-white/65">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <BuyButton className="mx-auto max-w-[360px]" />
            <p className="mt-3 text-[11px] text-white/40">
              Paiement unique • Sécurisé • Accès à vie
            </p>
          </div>
        </div>
      </section>

      <div aria-hidden className="h-24" />
    </div>
  );
}
