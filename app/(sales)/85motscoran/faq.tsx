"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const questions = [
  {
    q: "Comment marche l'essai gratuit de 7 jours ?",
    a: "Tu crées ton compte, tu entres ta CB (c'est Stripe qui la collecte, pas nous), et tu as accès immédiatement à toutes les fonctionnalités Premium de l'application pendant 7 jours complets. Aucun prélèvement pendant cette période. Au bout de 7 jours, si tu n'as pas résilié, ton abonnement passe automatiquement à 14,97€/mois.",
  },
  {
    q: "Pourquoi devoir entrer ma CB dès l'inscription ?",
    a: "Parce que ça nous permet de te laisser l'accès complet immédiatement, sans friction, et de basculer en douceur à la fin du trial si tu veux continuer. Tu peux résilier en 1 clic depuis tes paramètres à n'importe quel moment pendant les 7 jours — aucun frais.",
  },
  {
    q: "Comment je résilie ?",
    a: "Dans tes paramètres, tu as un bouton « Gérer mon abonnement » qui t'ouvre le portail Stripe. Tu cliques « Annuler l'abonnement » et c'est fait, en moins de 30 secondes. Tu gardes l'accès jusqu'à la fin de ta période (le 7e jour ou la fin du mois en cours).",
  },
  {
    q: "Qu'est-ce qui est inclus dans l'abonnement ?",
    a: "Toutes les leçons et tous les exercices interactifs de l'application (QCM, flashcards, matching, anagrammes, etc.), la répétition espacée qui s'adapte à ton rythme, les classements, les streaks, et les documents PDF téléchargeables offerts en bonus.",
  },
  {
    q: "C'est compatible avec mon téléphone ?",
    a: "Oui. L'application Quranlab fonctionne directement dans ton navigateur, sur téléphone (iOS, Android) et ordinateur. Aucun téléchargement, aucune installation.",
  },
  {
    q: "Et si je ne veux pas m'abonner, juste les PDFs ?",
    a: "Tu peux acheter uniquement le pack de documents PDF pour 9,99€ (paiement unique, pas d'abonnement). Tu les reçois immédiatement par email et tu les gardes à vie. C'est la deuxième option visible sur la page.",
  },
  {
    q: "Vais-je recevoir un rappel avant la première facturation ?",
    a: "Oui. 3 jours avant la fin de ton trial, tu reçois un email qui te rappelle que la période d'essai se termine bientôt, avec un lien direct pour résilier si tu ne veux pas continuer.",
  },
  {
    q: "Y a-t-il une garantie de remboursement sur les PDFs ?",
    a: "Le pack PDF est un produit digital : une fois envoyé par email, il ne peut pas être « rendu ». Un remboursement reste possible uniquement si tu as réellement appliqué la méthode sans obtenir de résultats, preuves à l'appui (notes, captures, exercices réalisés). On étudie chaque demande au cas par cas.",
  },
];

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-[720px] mx-auto divide-y divide-neutral-200 border-y border-neutral-200">
      {questions.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-base sm:text-lg font-serif text-neutral-900">
                {item.q}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>
            {isOpen && (
              <div className="pb-6 pr-8 text-sm sm:text-[15px] text-neutral-600 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
