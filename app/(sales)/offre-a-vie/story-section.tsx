import { BookOpenText, Sparkles } from "lucide-react";

import { Sparkle, Star } from "./doodles";

/** Reusable inline CTA that scrolls to the offer. */
function StoryCta() {
  return (
    <div className="my-12 text-center">
      <a
        href="#offre"
        className="inline-flex items-center justify-center rounded-2xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-7 py-4 font-display text-base font-bold uppercase tracking-wide text-white transition-all hover:brightness-[1.05] active:translate-y-1 active:border-b-0"
      >
        Je veux découvrir ces 300 mots essentiels
      </a>
      <p className="mt-2 text-sm text-neutral-500">
        Et vivre enfin le Coran avec compréhension
      </p>
    </div>
  );
}

const discoveries = [
  {
    n: "01",
    title: "On enseigne le mauvais arabe",
    text: "Les cours classiques s'attardent sur l'arabe moderne et la grammaire savante. Or l'arabe pour commander un café à Marrakech n'a rien à voir avec celui de tes prières. On surcharge l'élève de vocabulaire inutile au lieu d'aller à l'essentiel.",
  },
  {
    n: "02",
    title: "La « grammaire d'abord » tue la motivation",
    text: "Tableaux, conjugaisons, déclinaisons… L'arabe paraît alors impossible. 87% des élèves interrogés ont abandonné parce que c'était « trop académique » et « déconnecté de leur objectif spirituel ».",
  },
  {
    n: "03",
    title: "Le Coran utilise très peu de mots",
    text: "La révélation décisive : seulement ~300 mots reviennent sans cesse et forment 85% du texte coranique. Les cours qui veulent t'enseigner des milliers de mots compliquent inutilement les choses.",
  },
];

const steps = [
  {
    n: "Étape 1",
    title: "Maîtrise les fondations",
    text: "Les 50 mots les plus utilisés — « Allah », « Ar-Raḥmān », « les croyants », « la guidée »… Ils apparaissent dans presque chaque verset que tu récites. C'est la base de toute compréhension.",
  },
  {
    n: "Étape 2",
    title: "Construis ta reconnaissance",
    text: "Ajoute les 150 mots suivants, l'ossature des messages du Coran. Tu commences à saisir des phrases entières, plus seulement des mots isolés.",
  },
  {
    n: "Étape 3",
    title: "Le déclic",
    text: "Les 300 mots maîtrisés, 85% de ce que tu entends en prière, chaque khuṭba du vendredi, chaque récitation du Ramadan deviennent soudain clairs et lumineux.",
  },
];

const perks = [
  "Aucune grammaire écrasante — tu apprends les mots en contexte, naturellement.",
  "Pertinence spirituelle immédiate — chaque mot revient dans tes prières.",
  "Mémorisation visuelle — chaque mot illustré par un verset que tu connais déjà.",
  "Mémorisation audio — chaque mot et verset lu pour ancrer la mémoire.",
  "Rythme flexible — pensé pour les actifs, étudiants et parents débordés.",
  "Méthode éprouvée — testée avec plus de 2 000 musulmans francophones.",
];

const science = [
  { k: "30 mots", v: "38% du Coran" },
  { k: "100 mots", v: "56% du Coran" },
  { k: "300 mots", v: "85% du Coran" },
];

export function StorySection() {
  return (
    <section className="bg-white">
      <div className="relative max-w-[720px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <Sparkle className="absolute right-6 top-10 h-6 w-6 text-[#6967fb] hidden sm:block" />
        <Star className="absolute left-5 top-1/4 h-5 w-5 text-neutral-900/15 hidden sm:block" />

        {/* HOOK */}
        <h2 className="font-display font-bold text-3xl sm:text-[40px] leading-[1.1] text-neutral-950">
          Réciter les paroles d&apos;Allah pendant des années… sans en
          comprendre un seul mot.
        </h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-neutral-700">
          <p>
            Imagine la scène. Tu es debout en prière, tu récites Al-Fātiḥa pour
            la millième fois. L&apos;arabe coule parfaitement de tes lèvres, ton
            tajwīd est impeccable.
          </p>
          <p>
            Mais à l&apos;intérieur… le vide. Tu n&apos;as aucune idée de ce que
            tu viens de dire à ton Créateur.
          </p>
          <p>
            Autour de toi, certains ont les larmes aux yeux, touchés par les
            versets. Toi, tu continues les gestes, mécaniquement — comme dans une
            pièce où tout le monde parle une langue magnifique qui touche
            l&apos;âme, pendant que tu restes là, perdu.
          </p>
          <p>
            Et pendant le Ramadan, au Tarāwīḥ, c&apos;est pire : tous vivent le{" "}
            <span className="font-semibold text-neutral-900">khushūʿ</span>,
            tandis que toi tu attends la traduction pour comprendre ce qui les a
            émus jusqu&apos;aux larmes.
          </p>
          <p className="font-semibold text-neutral-900">
            Cette déconnexion crée un cercle de frustration que beaucoup de
            musulmans portent en silence pendant des années. Mais ce n&apos;est
            pas ta faute.
          </p>
        </div>

        <StoryCta />

        {/* THE IGNORED PATTERN */}
        <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl leading-tight text-neutral-950">
          Un « schéma linguistique » que l&apos;enseignement traditionnel a
          ignoré
        </h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-neutral-700">
          <p>
            En tant que chercheur en linguistique coranique, j&apos;ai vu des
            musulmans brillants et sincères — médecins, ingénieurs, enseignants
            — avoir mémorisé des sourates entières sans comprendre un seul verset
            sans traduction.
          </p>
          <p>
            Partout, on se concentre sur le tajwīd et le ḥifẓ, mais on néglige
            la <span className="font-semibold text-neutral-900">compréhension</span>
            . Et quand on tente enfin d&apos;apprendre l&apos;arabe, on est noyé
            dans une grammaire conçue pour des savants, pas pour des croyants qui
            veulent simplement comprendre leurs prières.
          </p>
        </div>

        {/* WHY IT FAILS */}
        <h3 className="mt-14 font-display font-bold text-2xl sm:text-3xl text-neutral-950">
          Pourquoi l&apos;arabe classique échoue pour 95% des musulmans
        </h3>
        <div className="mt-6 space-y-4">
          {discoveries.map((d) => (
            <div
              key={d.n}
              className="flex gap-4 rounded-2xl border-2 border-neutral-900/10 bg-[#FAF8F3] p-5"
            >
              <span className="font-display text-2xl font-bold text-[#6967fb]">
                {d.n}
              </span>
              <div>
                <h4 className="font-display font-bold text-neutral-950">
                  {d.title}
                </h4>
                <p className="mt-1 text-[15px] leading-relaxed text-neutral-600">
                  {d.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <StoryCta />

        {/* SOLUTION */}
        <div className="rounded-3xl bg-neutral-950 p-8 sm:p-10 text-white">
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/50">
            La méthode « Fréquence avant tout »
          </p>
          <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl leading-tight">
            Comprends 85% du Coran en 30 jours — 10 mots par jour
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/80">
            Au lieu de lutter des années contre la grammaire, tu te concentres
            sur les bons 300 mots. C&apos;est tout l&apos;objet de
            l&apos;ebook interactif{" "}
            <span className="font-semibold text-white">
              « Débloque 85% du vocabulaire coranique »
            </span>{" "}
            : ni manuel de grammaire, ni cours traditionnel — un système ciblé
            sur les mots les plus fréquents et les plus puissants.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border-2 border-neutral-900/10 bg-white p-5"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#6967fb]">
                {s.n}
              </p>
              <h4 className="mt-1 font-display font-bold text-lg text-neutral-950">
                {s.title}
              </h4>
              <p className="mt-1 text-[15px] leading-relaxed text-neutral-600">
                {s.text}
              </p>
            </div>
          ))}
        </div>

        {/* DIFFERENT */}
        <h3 className="mt-14 font-display font-bold text-2xl sm:text-3xl text-neutral-950">
          Ce qui change tout
        </h3>
        <ul className="mt-6 space-y-3">
          {perks.map((p) => (
            <li key={p} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#58cc6a] text-white">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="text-[15px] leading-relaxed text-neutral-700">
                {p}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl bg-[#FAF8F3] border-2 border-neutral-900/10 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <BookOpenText className="h-5 w-5 text-[#6967fb]" strokeWidth={2} />
            <h3 className="font-display font-bold text-xl text-neutral-950">
              Pourquoi ça marche là où le reste échoue
            </h3>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">
            Quand tu as appris ta langue maternelle, tu n&apos;as pas commencé
            par la littérature classique : tu as appris « le », « et », « est »…
            puis tu as progressé. Le Coran fonctionne pareil — Allah répète
            certains mots parce qu&apos;ils sont au cœur de Son message. En te
            concentrant sur ces répétitions, tu apprends d&apos;abord ce
            qu&apos;Il a voulu que tu retiennes le plus.
          </p>
        </div>

        <StoryCta />

        {/* SCIENCE */}
        <h3 className="font-display font-bold text-2xl sm:text-3xl text-center text-neutral-950">
          La science derrière la méthode
        </h3>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          {science.map((s) => (
            <div
              key={s.k}
              className="rounded-2xl border-2 border-neutral-900/10 bg-white p-4 text-center"
            >
              <p className="font-display font-bold text-xl sm:text-2xl text-[#6967fb]">
                {s.k}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{s.v}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[15px] text-neutral-600">
          Ce n&apos;est pas du bricolage : c&apos;est la voie intelligente que
          l&apos;éducation traditionnelle a oubliée.
        </p>

        {/* PRICE FRAMING */}
        <div className="mt-12 text-center">
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-neutral-950">
            Une fraction du prix d&apos;un cours d&apos;arabe
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-neutral-700">
            Un cours complet d&apos;arabe coûte{" "}
            <span className="font-semibold text-neutral-900">300€ à 500€</span> et
            dure 2 à 3 ans. Les cours particuliers, 30€ à 50€ de l&apos;heure.
            « Débloque 85% du vocabulaire coranique » vise de meilleurs
            résultats, pour une fraction du temps et du coût.
          </p>
        </div>

        <StoryCta />
      </div>
    </section>
  );
}
