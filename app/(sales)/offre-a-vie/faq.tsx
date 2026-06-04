import { Plus } from "lucide-react";

const items = [
  {
    q: "« À vie », ça veut dire quoi exactement ?",
    a: "Tu paies une seule fois, 47€, et tu gardes l'accès Premium à l'application pour toujours. Aucun abonnement, aucun prélèvement récurrent, jamais.",
  },
  {
    q: "Comment j'accède à l'application après le paiement ?",
    a: "Juste après le paiement, tu crées ton compte avec l'email utilisé lors de l'achat. Ton accès à vie est activé automatiquement. Tu reçois aussi un email de confirmation.",
  },
  {
    q: "Les futures leçons et mises à jour sont incluses ?",
    a: "Oui. Toutes les nouvelles leçons, fonctionnalités et améliorations de l'application sont incluses, sans supplément.",
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "Oui. Le paiement est traité par Stripe, le standard mondial du paiement en ligne. Nous ne voyons jamais ton numéro de carte.",
  },
  {
    q: "Sur quels appareils puis-je l'utiliser ?",
    a: "Sur tous tes appareils : téléphone, tablette et ordinateur. Tu te connectes simplement avec ton compte, ta progression te suit partout.",
  },
  {
    q: "Et si j'ai déjà un abonnement mensuel ?",
    a: "Pas de souci : écris-nous après ton achat et nous basculons ton compte en accès à vie et annulons ton abonnement.",
  },
];

export function Faq() {
  return (
    <div className="divide-y divide-neutral-200/70 border-y border-neutral-200/70">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
            <span className="font-serif text-lg text-neutral-950">
              {item.q}
            </span>
            <Plus
              className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-45"
              strokeWidth={1.5}
            />
          </summary>
          <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-neutral-600">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
