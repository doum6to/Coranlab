import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Mail } from "lucide-react";

import { LandingMascot } from "../../landing-mascot";
import { TrackPurchase } from "./track-purchase";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Merci — Quranlab",
  description:
    "Ton paiement est confirmé. Vérifie ton email dans les prochaines minutes.",
  robots: { index: false, follow: false },
};

export default function MerciPage() {
  return (
    <div className="min-h-[70vh] w-full bg-[#FAF8F3] text-neutral-900 flex items-center justify-center">
      <Suspense fallback={null}>
        <TrackPurchase />
      </Suspense>

      <section className="max-w-[680px] mx-auto px-6 sm:px-8 py-16 sm:py-24 flex flex-col items-center text-center gap-6">
        <LandingMascot
          src="/animations/completed_lvl.riv"
          className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px]"
        />

        <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
          Paiement confirmé
        </p>

        <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] text-neutral-950 max-w-[540px]">
          Merci.
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 max-w-[480px] leading-relaxed">
          Un email arrive dans ta boîte de réception dans les prochaines
          minutes. Pense à vérifier tes spams si tu ne le vois pas.
        </p>

        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 w-full max-w-[480px]">
          <div className="flex items-start gap-4 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
              <Mail className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-serif text-neutral-900">
                Email en route
              </p>
              <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                Si tu as pris l&apos;offre complète, tu y trouveras aussi un
                lien pour créer ton compte et activer ton accès Premium.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950 underline-offset-4 hover:underline transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </section>
    </div>
  );
}
