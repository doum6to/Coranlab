import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Repeat,
  Trophy,
  Target,
  Star,
  Zap,
} from "lucide-react";

import { MarketingCTA } from "./marketing-cta";
import { LandingMascot } from "./landing-mascot";
import { StickyCTA } from "./sticky-cta";
import { JsonLd } from "@/components/blog/json-ld";

// Fully static — served from the CDN with no server-side auth lookup.
// The CTA component checks auth client-side and upgrades the buttons.
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Quranlab — Apprends 85% des mots du Coran",
  description:
    "Application gratuite pour apprendre le vocabulaire du Coran. Maîtrise 85% des mots coraniques avec des leçons interactives et des exercices adaptés.",
  keywords: [
    "apprendre le coran",
    "vocabulaire coranique",
    "apprendre l'arabe coranique",
    "apprentissage coran en ligne",
    "mémoriser le coran",
    "hifz coran",
    "tajwid débutant",
  ],
  openGraph: {
    title: "Quranlab — Apprends 85% des mots du Coran",
    description:
      "Application gratuite pour apprendre le vocabulaire du Coran. Maîtrise 85% des mots coraniques avec des leçons interactives.",
    url: "https://www.quranlab.app",
    siteName: "Quranlab",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://www.quranlab.app/hero.png",
        width: 1200,
        height: 630,
        alt: "Quranlab — Apprends le vocabulaire du Coran",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quranlab — Apprends 85% des mots du Coran",
    description:
      "Application gratuite pour apprendre le vocabulaire du Coran.",
    images: ["https://www.quranlab.app/hero.png"],
  },
  alternates: { canonical: "https://www.quranlab.app" },
};

export default function Home() {
  return (
    <>
      <JsonLd type="website" />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HERO                                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-[988px] mx-auto w-full flex flex-col lg:flex-row items-center justify-center px-6 sm:px-8 py-12 sm:py-16 lg:py-20 gap-8 lg:gap-12">
        <div className="relative w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] lg:w-[400px] lg:h-[400px] shrink-0">
          <Image
            src="/hero.png"
            fill
            alt="Quranlab"
            className="object-contain"
            style={{ mixBlendMode: "multiply" }}
            priority
            sizes="(max-width: 640px) 200px, (max-width: 1024px) 280px, 400px"
          />
        </div>
        <div className="flex flex-col items-center gap-y-6 sm:gap-y-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brilliant-text max-w-[480px] text-center leading-tight font-heading">
            Apprends, pratique et maîtrise 85% des mots du Coran.
          </h1>
          <p className="text-brilliant-muted text-sm sm:text-base text-center max-w-[400px]">
            La méthode gratuite, fun et efficace pour comprendre ce que tu récites.
          </p>
          <div className="flex flex-col items-center gap-y-3 max-w-[330px] w-full">
            <MarketingCTA />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  STATS BAR                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full border-y border-brilliant-border bg-brilliant-surface">
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-heading text-[#6967fb]">85%</p>
              <p className="mt-1 text-xs sm:text-sm text-brilliant-muted">des mots du Coran couverts</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-heading text-[#6967fb]">500+</p>
              <p className="mt-1 text-xs sm:text-sm text-brilliant-muted">exercices interactifs</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-heading text-[#6967fb]">5 min</p>
              <p className="mt-1 text-xs sm:text-sm text-brilliant-muted">par jour suffisent</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-heading text-[#6967fb]">100%</p>
              <p className="mt-1 text-xs sm:text-sm text-brilliant-muted">gratuit pour commencer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FEATURE 1 — Gratuit et efficace                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
              ludique. fun. efficace.
            </h2>
            <p className="mt-4 text-brilliant-muted text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
              Apprendre le vocabulaire du Coran ne devrait pas être compliqué ni
              ennuyeux. Avec Quranlab, chaque leçon est un jeu : des QCM, des
              exercices de correspondance, des anagrammes... le tout conçu pour que
              tu retiennes sans effort.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6967fb]/10 px-4 py-2 text-sm font-medium text-[#6967fb]">
                <Zap className="h-4 w-4" /> Leçons courtes
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6967fb]/10 px-4 py-2 text-sm font-medium text-[#6967fb]">
                <Star className="h-4 w-4" /> Exercices variés
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6967fb]/10 px-4 py-2 text-sm font-medium text-[#6967fb]">
                <Target className="h-4 w-4" /> Résultats rapides
              </span>
            </div>
          </div>
          <div className="shrink-0 grid grid-cols-2 gap-3 w-[260px] sm:w-[300px]">
            <div className="rounded-2xl border-2 border-brilliant-border border-b-4 bg-white p-4 text-center">
              <p className="font-arabic text-2xl">كِتَاب</p>
              <p className="mt-1 text-xs text-brilliant-muted font-medium">livre</p>
            </div>
            <div className="rounded-2xl border-2 border-brilliant-border border-b-4 bg-white p-4 text-center">
              <p className="font-arabic text-2xl">قَلْب</p>
              <p className="mt-1 text-xs text-brilliant-muted font-medium">cœur</p>
            </div>
            <div className="rounded-2xl border-2 border-[#6967fb] border-b-4 bg-[#6967fb]/5 p-4 text-center">
              <p className="font-arabic text-2xl">رَحْمَة</p>
              <p className="mt-1 text-xs text-[#6967fb] font-medium">miséricorde</p>
            </div>
            <div className="rounded-2xl border-2 border-brilliant-border border-b-4 bg-white p-4 text-center">
              <p className="font-arabic text-2xl">نُور</p>
              <p className="mt-1 text-xs text-brilliant-muted font-medium">lumière</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FEATURE 2 — Méthode scientifique                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-brilliant-surface">
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
                une méthode scientifique
              </h2>
              <p className="mt-4 text-brilliant-muted text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                Quranlab utilise la répétition espacée, une technique prouvée par
                les neurosciences. Tu revois chaque mot juste avant de l&apos;oublier,
                pour ancrer le vocabulaire dans ta mémoire à long terme. Pas de
                bachotage, juste de la science.
              </p>
            </div>
            <div className="shrink-0 w-[260px] sm:w-[300px]">
              <div className="rounded-2xl border-2 border-brilliant-border bg-white p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Repeat className="h-5 w-5 text-[#6967fb]" />
                  <p className="font-heading font-bold text-brilliant-text text-sm">Répétition espacée</p>
                </div>
                <div className="space-y-2.5">
                  {[
                    { day: "Jour 1", w: "100%", label: "Apprentissage" },
                    { day: "Jour 2", w: "85%", label: "1ère révision" },
                    { day: "Jour 4", w: "70%", label: "2ème révision" },
                    { day: "Jour 7", w: "55%", label: "3ème révision" },
                    { day: "Jour 30", w: "100%", label: "Ancré !", color: "bg-green-500" },
                  ].map((r) => (
                    <div key={r.day} className="flex items-center gap-2 text-xs">
                      <span className="w-12 font-bold text-brilliant-text">{r.day}</span>
                      <div className="flex-1 h-2 rounded-full bg-[#6967fb]/10">
                        <div
                          className={`h-2 rounded-full ${r.color || "bg-[#6967fb]"}`}
                          style={{ width: r.w }}
                        />
                      </div>
                      <span className="w-20 text-right text-brilliant-muted">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FEATURE 3 — Motivation                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
              une motivation toujours au top
            </h2>
            <p className="mt-4 text-brilliant-muted text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
              On sait que le plus dur, c&apos;est de rester régulier. C&apos;est pour ça que
              Quranlab intègre un système de streaks, de points XP et de classement pour
              te garder motivé jour après jour. Apprendre le Coran devient une habitude,
              pas une corvée !
            </p>
          </div>
          <div className="shrink-0 w-[260px] sm:w-[300px] space-y-3">
            <div className="rounded-2xl border-2 border-brilliant-border border-b-4 bg-white p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                <span className="text-lg">🔥</span>
              </div>
              <div>
                <p className="font-heading font-bold text-brilliant-text text-sm">Streak quotidien</p>
                <p className="text-xs text-brilliant-muted">Garde le rythme chaque jour</p>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-brilliant-border border-b-4 bg-white p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <p className="font-heading font-bold text-brilliant-text text-sm">Points XP</p>
                <p className="text-xs text-brilliant-muted">Gagne des points à chaque leçon</p>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-brilliant-border border-b-4 bg-white p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Trophy className="h-5 w-5 text-[#6967fb]" />
              </div>
              <div>
                <p className="font-heading font-bold text-brilliant-text text-sm">Classement</p>
                <p className="text-xs text-brilliant-muted">Compare-toi aux autres apprenants</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FEATURE 4 — Apprentissage personnalisé                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-brilliant-surface">
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text">
                un apprentissage personnalisé
              </h2>
              <p className="mt-4 text-brilliant-muted text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                Chaque apprenant est différent. Quranlab s&apos;adapte à ton niveau et à
                ton rythme. Les exercices deviennent plus difficiles au fur et à mesure
                que tu progresses, et les mots que tu maîtrises déjà reviennent moins
                souvent.
              </p>
            </div>
            <div className="shrink-0 w-[260px] sm:w-[300px]">
              <div className="rounded-2xl border-2 border-brilliant-border bg-white p-5 sm:p-6">
                <p className="font-heading font-bold text-brilliant-text text-sm mb-4">Ton parcours</p>
                <div className="space-y-3">
                  {[
                    { icon: "📖", label: "Les bases du vocabulaire", done: true },
                    { icon: "🕌", label: "Mots de la prière", done: true },
                    { icon: "⭐", label: "Verbes fréquents", active: true },
                    { icon: "🌙", label: "Vocabulaire avancé", locked: true },
                    { icon: "👑", label: "Maîtrise complète", locked: true },
                  ].map((step) => (
                    <div key={step.label} className={`flex items-center gap-3 rounded-xl p-2.5 ${step.active ? "bg-[#6967fb]/10 border border-[#6967fb]/30" : ""} ${step.locked ? "opacity-40" : ""}`}>
                      <span className="text-lg">{step.icon}</span>
                      <span className={`text-sm ${step.active ? "font-bold text-[#6967fb]" : "text-brilliant-text/70"}`}>{step.label}</span>
                      {step.done && <span className="ml-auto text-green-500 text-xs font-bold">✓</span>}
                      {step.active && <span className="ml-auto text-[#6967fb] text-xs font-bold">En cours</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  ARABIC SHOWCASE — Full width purple section                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section
        className="w-full text-white py-16 sm:py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6967fb 0%, #4a48d4 100%)" }}
      >
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-white/10" />

        <div className="max-w-[988px] mx-auto px-6 sm:px-8 relative">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading">
              Apprends où tu veux, quand tu veux
            </h2>
            <p className="mt-3 text-white/70 text-sm sm:text-base max-w-md mx-auto">
              5 minutes dans le métro, avant de dormir, après la prière... Chaque
              moment est une occasion d&apos;apprendre un nouveau mot du Coran.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { ar: "اللَّه", fr: "Allah", count: "2 699×" },
              { ar: "رَبّ", fr: "Seigneur", count: "980×" },
              { ar: "قَالَ", fr: "il a dit", count: "1 722×" },
              { ar: "يَوْم", fr: "jour", count: "475×" },
            ].map((word) => (
              <div
                key={word.ar}
                className="rounded-2xl bg-white/15 backdrop-blur-sm p-4 sm:p-5 text-center border border-white/20"
              >
                <p className="font-arabic text-2xl sm:text-3xl">{word.ar}</p>
                <p className="mt-2 text-sm font-semibold">{word.fr}</p>
                <p className="mt-0.5 text-xs text-white/60">{word.count} dans le Coran</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm sm:text-base font-bold text-[#6967fb] shadow-[0_4px_0_0_rgba(255,255,255,0.3)] transition hover:scale-[1.02] active:scale-[0.97] active:translate-y-[2px]"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FINAL CTA                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="final-cta" className="w-full bg-white border-t border-brilliant-border">
        <div className="max-w-[988px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <div className="flex flex-col items-center text-center gap-6">
            <LandingMascot
              src="/animations/mascot_breath.riv"
              className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]"
            />
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brilliant-text max-w-md">
              Prêt à comprendre le Coran ?
            </h2>
            <p className="text-brilliant-muted text-sm sm:text-base max-w-sm">
              Rejoins des milliers d&apos;apprenants et commence ton parcours dès
              aujourd&apos;hui. C&apos;est gratuit.
            </p>
            <div className="flex flex-col items-center gap-y-3 max-w-[330px] w-full">
              <MarketingCTA />
            </div>
          </div>
        </div>
      </section>

      <StickyCTA />
    </>
  );
}
