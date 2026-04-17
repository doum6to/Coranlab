"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const questions = [
  {
    q: "Comment vais-je recevoir les documents ?",
    a: "Dès que ton paiement est validé (quelques secondes après le checkout), tu reçois un email avec un lien vers tes documents. L'accès est permanent et téléchargeable.",
  },
  {
    q: "Qu'est-ce qui est inclus dans le pack ?",
    a: "Un ensemble de documents PDF qui couvre 85% du vocabulaire du Coran. Les mots sont organisés par fréquence, avec leurs racines arabes, leurs traductions, et des exemples contextuels. Tu peux les imprimer, les consulter sur téléphone, ou les utiliser comme tu veux.",
  },
  {
    q: "Quelle est la différence entre le pack et l'offre complète ?",
    a: "Le pack seul te donne les documents PDF (9,99€ en paiement unique). L'offre complète inclut en plus l'abonnement à l'application Quranlab (14,97€/mois) pour pratiquer tous les jours avec des exercices interactifs, des leçons guidées et un système de progression adapté à ton rythme.",
  },
  {
    q: "Puis-je résilier l'abonnement à l'application ?",
    a: "Oui, à tout moment. Tu peux annuler depuis ton espace client Stripe, sans frais ni justification. L'accès reste actif jusqu'à la fin du mois en cours. Les documents PDF, eux, restent à toi à vie.",
  },
  {
    q: "C'est compatible avec mon téléphone ?",
    a: "Oui. Les PDF s'ouvrent sur tous les appareils (iOS, Android, Windows, Mac). L'application Quranlab fonctionne dans ton navigateur sur téléphone et ordinateur, donc aucun téléchargement n'est nécessaire.",
  },
  {
    q: "Y a-t-il une garantie de remboursement ?",
    a: "Le pack est un produit digital : une fois envoyé par email, il ne peut pas être « rendu ». Un remboursement reste possible uniquement si tu as réellement appliqué la méthode sans obtenir de résultats, preuves à l'appui (notes, captures, exercices réalisés). On étudie chaque demande au cas par cas pour rester juste envers toi et envers nous.",
  },
];

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-[720px] mx-auto space-y-3">
      {questions.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div
            key={item.q}
            className="rounded-2xl border-2 border-b-4 border-brilliant-border bg-white overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm sm:text-base font-bold font-heading text-brilliant-text">
                {item.q}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-brilliant-muted transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-sm text-brilliant-muted leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
