import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Home } from "lucide-react";

import { LandingMascot } from "../../landing-mascot";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Merci pour ton achat | Quranlab",
  description:
    "Ton paiement est confirmé. Vérifie ton email dans les prochaines minutes pour accéder à tes documents.",
  robots: { index: false, follow: false },
};

export default function MerciPage() {
  return (
    <section className="min-h-[70vh] max-w-[720px] mx-auto px-6 sm:px-8 py-16 sm:py-24 flex flex-col items-center text-center gap-6">
      <LandingMascot
        src="/animations/completed_lvl.riv"
        className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]"
      />

      <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 uppercase tracking-wide">
        Paiement confirmé
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold font-heading text-brilliant-text max-w-[540px]">
        Merci, ta commande est validée !
      </h1>

      <p className="text-brilliant-muted text-base sm:text-lg max-w-[480px] leading-relaxed">
        Un email avec le lien vers tes documents arrive dans ta boîte de
        réception dans quelques minutes. Pense à vérifier tes spams si tu ne
        le vois pas.
      </p>

      <div className="mt-4 rounded-2xl border-2 border-b-4 border-brilliant-border bg-white p-5 sm:p-6 w-full max-w-[520px]">
        <div className="flex items-start gap-3 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6967fb]/10">
            <Mail className="h-5 w-5 text-[#6967fb]" />
          </span>
          <div>
            <p className="text-sm font-bold text-brilliant-text font-heading">
              Email en route
            </p>
            <p className="mt-1 text-sm text-brilliant-muted leading-relaxed">
              Si tu as pris l&apos;offre complète, tu trouveras aussi un lien
              pour créer ton compte Quranlab et activer ton accès Premium.
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-brilliant-border bg-white px-6 py-3 text-sm font-bold text-brilliant-text uppercase tracking-wide transition hover:bg-brilliant-surface active:border-b-2 active:translate-y-[2px]"
      >
        <Home className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>
    </section>
  );
}
