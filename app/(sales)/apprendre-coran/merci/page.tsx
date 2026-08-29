import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement reçu — Quranlab",
  robots: { index: false, follow: false },
};

export default function ApprendreCoranMerci() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#FFF9F0", color: "#171326" }}
    >
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full text-5xl text-white"
        style={{ background: "#22C55E" }}
      >
        ✓
      </div>
      <h1 className="mt-6 font-serif text-3xl sm:text-4xl leading-tight">
        Paiement reçu, barak Allah fik !
      </h1>
      <p className="mt-4 max-w-md text-base" style={{ color: "#6B6880" }}>
        Ton accès Premium est activé. Un e-mail vient de t&apos;être envoyé pour{" "}
        <strong>créer ton compte</strong> et commencer.
      </p>
      <p className="mt-2 max-w-md text-sm" style={{ color: "#8A86A0" }}>
        Pense à vérifier tes spams. Rien reçu d&apos;ici quelques minutes ?
        Écris-nous à contact@quranlab.app.
      </p>
      <a
        href="/auth/signup"
        className="mt-8 rounded-2xl px-8 py-4 text-base font-bold text-white"
        style={{ background: "#6967FB", boxShadow: "0 6px 0 0 #2D1F4F40" }}
      >
        Créer mon compte
      </a>
    </div>
  );
}
