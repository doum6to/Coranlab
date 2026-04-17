import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sofiane",
    role: "Étudiant, Lyon",
    text: "Franchement, en deux semaines j'ai compris plus de mots dans la Fatiha que pendant des années de récitation sans comprendre. Le format PDF est parfait pour réviser dans le métro.",
    initials: "S",
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Amina",
    role: "Maman, Marseille",
    text: "J'ai pris l'offre complète pour moi et mon fils. Les documents servent pour les révisions du week-end, et l'application le motive au quotidien avec les streaks. On apprend ensemble.",
    initials: "A",
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Yacine",
    role: "Développeur, Bruxelles",
    text: "La logique de fréquence est brillante. En se concentrant sur les mots qui reviennent le plus, on débloque une compréhension réelle très vite. Je recommande à tous les convertis.",
    initials: "Y",
    color: "bg-green-100 text-green-600",
  },
];

export function Testimonials() {
  return (
    <div className="grid gap-5 md:grid-cols-3 max-w-[1040px] mx-auto">
      {testimonials.map((t) => (
        <div
          key={t.name}
          className="rounded-2xl border-2 border-b-4 border-brilliant-border bg-white p-5 sm:p-6 flex flex-col"
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>

          <p className="mt-4 text-sm text-brilliant-text leading-relaxed flex-1">
            « {t.text} »
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${t.color}`}
            >
              {t.initials}
            </div>
            <div>
              <p className="text-sm font-bold font-heading text-brilliant-text">
                {t.name}
              </p>
              <p className="text-xs text-brilliant-muted">{t.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
