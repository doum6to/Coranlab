import fs from "fs";
import path from "path";
import Link from "next/link";
import matter from "gray-matter";

import { renderMarkdown } from "./markdown";

export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  readingTime: number;
  content: () => JSX.Element;
};

/* ------------------------------------------------------------------ */
/*  Reusable visual blocks                                             */
/* ------------------------------------------------------------------ */

/** Purple-left-bordered tip/info callout */
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-xl border-l-4 border-[#6967fb] bg-[#6967fb]/5 px-5 py-4 text-[15px] leading-relaxed text-brilliant-text/80">
      {children}
    </div>
  );
}

/** Centered Arabic word showcase card */
function ArabicWord({
  word,
  translation,
  info,
}: {
  word: string;
  translation: string;
  info?: string;
}) {
  return (
    <div className="not-prose my-4 inline-flex flex-col items-center rounded-xl border border-brilliant-border bg-brilliant-surface px-5 py-3 text-center">
      <span className="font-arabic text-2xl leading-relaxed">{word}</span>
      <span className="mt-1 text-sm font-semibold text-brilliant-text">
        {translation}
      </span>
      {info && (
        <span className="mt-0.5 text-xs text-brilliant-muted">{info}</span>
      )}
    </div>
  );
}

/** Row of Arabic word cards */
function ArabicWordRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 flex flex-wrap gap-3 justify-center">
      {children}
    </div>
  );
}

/** Numbered step card */
function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="not-prose my-6 rounded-xl border-2 border-brilliant-border bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6967fb] text-sm font-bold text-white">
          {number}
        </span>
        <div>
          <h3 className="font-heading text-lg font-bold text-brilliant-text mb-2">
            {title}
          </h3>
          <div className="text-[15px] leading-relaxed text-brilliant-text/80">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small inline CTA to drive action mid-article */
function InlineCTA({
  text,
  label,
  href = "/onboarding",
}: {
  text: string;
  label?: string;
  href?: string;
}) {
  return (
    <div className="not-prose my-8 rounded-2xl border-2 border-[#6967fb]/20 bg-gradient-to-r from-[#6967fb]/5 to-[#6967fb]/10 p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
      <p className="flex-1 text-[15px] font-medium text-brilliant-text/80">
        {text}
      </p>
      <Link
        href={href}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#6967fb] px-5 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_0_#5250d4] transition hover:scale-[1.02] active:scale-[0.97] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[2px]"
      >
        {label || "Essayer Quranlab →"}
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Articles                                                           */
/* ------------------------------------------------------------------ */

const VocabulaireCoranContent = () => (
  <>
    <p>
      Tu lis le Coran en arabe depuis des années, mais si on te demandait de
      traduire un verset au hasard… tu serais un peu perdu ? Pas de panique, tu
      n&apos;es pas seul. La bonne nouvelle, c&apos;est que c&apos;est bien plus
      accessible que tu ne le crois.
    </p>

    <p>
      Le Coran contient environ 77 000 mots. Ça paraît énorme, non ? Sauf que
      la plupart se <strong>répètent</strong>. En fait,{" "}
      <strong>quelques centaines de racines arabes couvrent environ 85% du
      texte coranique</strong>. Tu n&apos;as pas besoin de devenir prof d&apos;arabe
      pour comprendre ce que tu récites.
    </p>

    <Tip>
      💡 <strong>Le savais-tu ?</strong> Avec seulement 300 mots bien choisis,
      tu peux comprendre environ la moitié de chaque page du Coran. C&apos;est
      comme apprendre les mots les plus fréquents d&apos;une langue — 80% du
      travail vient de 20% du vocabulaire.
    </Tip>

    <h2>Pourquoi c&apos;est un vrai game-changer</h2>
    <p>
      Imagine : tu es en prière, tu récites sourate Al-Fatiha, et au lieu de
      simplement prononcer des sons, tu <em>comprends</em> ce que tu dis. Le
      mot <span className="font-arabic">الْحَمْدُ</span> résonne différemment
      quand tu sais qu&apos;il veut dire « la louange ». Ta prière passe d&apos;un
      exercice mécanique à un vrai dialogue.
    </p>
    <p>
      C&apos;est ça, le pouvoir du vocabulaire coranique : il transforme ta
      relation au Coran.
    </p>

    <h2>Les méthodes qui marchent vraiment</h2>

    <Step number={1} title="La répétition espacée">
      <p>
        C&apos;est la technique la plus efficace selon les neurosciences. Le
        principe est simple : au lieu de tout réviser chaque jour (ennuyeux et
        inefficace), tu revois un mot <strong>juste avant de
        l&apos;oublier</strong>. Ton cerveau le consolide à chaque révision, et
        les intervalles s&apos;allongent naturellement.
      </p>
      <p className="mt-2">
        C&apos;est exactement ce que fait Quranlab dans ses exercices — le
        système s&apos;adapte à ton rythme.
      </p>
    </Step>

    <Step number={2} title="Apprendre par fréquence, pas par sourate">
      <p>
        Erreur classique : vouloir apprendre les mots sourate par sourate. Le
        problème ? Tu tombes sur des mots rares dès le début. La bonne approche,
        c&apos;est de commencer par les{" "}
        <Link href="/blog/mots-frequents-coran">
          100 mots les plus fréquents du Coran
        </Link>
        . Ces mots reviennent des <em>centaines</em> de fois — tu les retrouveras
        partout.
      </p>
    </Step>

    <Step number={3} title="Toujours apprendre en contexte">
      <p>
        Un mot isolé sur une flashcard, c&apos;est bien. Mais un mot dans son
        verset, c&apos;est 10 fois plus puissant. Quand tu vois{" "}
        <span className="font-arabic text-lg">كِتَاب</span> (kitab — livre),
        tu le retiens bien mieux si tu sais qu&apos;il apparaît 230 fois dans
        le Coran, souvent en référence aux Écritures révélées.
      </p>
    </Step>

    <Step number={4} title="Varier les exercices">
      <p>
        QCM, correspondance, anagrammes, flashcards… Chaque type d&apos;exercice
        sollicite un circuit neuronal différent. C&apos;est comme entraîner un
        muscle sous différents angles — ça ancre le vocabulaire bien plus
        profondément qu&apos;une seule méthode.
      </p>
    </Step>

    <InlineCTA text="Quranlab utilise exactement ces 4 méthodes — répétition espacée, fréquence, contexte et exercices variés — dans chaque leçon." />

    <h2>Un plan réaliste (et faisable)</h2>
    <p>
      Oublie les programmes de « fluent en 30 jours ». Voici un planning
      honnête :
    </p>
    <ul>
      <li>
        <strong>Semaines 1-4</strong> : 10 mots par jour, les plus fréquents.
        En un mois → ~300 mots → ~50% du Coran compris. Oui, vraiment.
      </li>
      <li>
        <strong>Mois 2-3</strong> : les mots de fréquence moyenne. Tu atteins
        70% de compréhension.
      </li>
      <li>
        <strong>Mois 4-6</strong> : les mots plus rares. Tu dépasses 85%.
      </li>
    </ul>

    <Tip>
      🎯 <strong>Conseil perso</strong> : ne te fixe pas des objectifs
      démesurés. 10 mots par jour, c&apos;est 5 minutes de ton temps. L&apos;important
      c&apos;est la régularité, pas l&apos;intensité.
    </Tip>

    <h2>Commence par les sourates que tu connais déjà</h2>
    <p>
      Si tu débutes, les{" "}
      <Link href="/blog/sourates-courtes">
        sourates les plus courtes
      </Link>{" "}
      sont un excellent point de départ. Tu les récites déjà dans tes prières,
      donc chaque mot appris aura un impact immédiat. C&apos;est la meilleure
      motivation possible.
    </p>

    <h2>La clé : la régularité</h2>
    <p>
      15 minutes par jour, tous les jours, ça bat 2 heures le week-end. Et c&apos;est
      pas juste un dicton — le cerveau consolide la mémoire pendant le sommeil.
      Des sessions courtes et quotidiennes sont scientifiquement plus efficaces
      que des marathons occasionnels.
    </p>
    <p>
      C&apos;est pour ça que Quranlab intègre un système de streak — pour
      t&apos;aider à garder le rythme, jour après jour. Pas de pression, juste
      de la consistance.
    </p>
  </>
);

const SouratesCourtesContent = () => (
  <>
    <p>
      Si tu te demandes par où commencer avec le Coran, j&apos;ai une réponse
      simple : les sourates courtes. Tu les connais peut-être déjà par cœur
      sans comprendre ce qu&apos;elles signifient. Et c&apos;est justement là
      que ça devient intéressant.
    </p>

    <p>
      Ces sourates sont idéales pour débuter parce qu&apos;elles combinent
      tout : un{" "}
      <Link href="/blog/vocabulaire-coran">vocabulaire fondamental</Link>, une
      mémorisation rapide, et une utilisation quotidienne dans la prière.
    </p>

    <h2>1. Sourate Al-Kawthar — 3 versets (la plus courte !)</h2>

    <div className="not-prose my-6 rounded-xl border-2 border-brilliant-border bg-brilliant-surface p-5 sm:p-6 text-center">
      <p className="font-arabic text-xl sm:text-2xl leading-loose">
        إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ ۝
        إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ
      </p>
    </div>

    <p>
      Seulement <strong>3 versets et 10 mots</strong>. C&apos;est la sourate
      la plus courte du Coran et le point de départ parfait. Tu peux la
      mémoriser en une seule session.
    </p>

    <ArabicWordRow>
      <ArabicWord word="الْكَوْثَرَ" translation="l'abondance" />
      <ArabicWord word="صَلِّ" translation="prie" />
      <ArabicWord word="انْحَرْ" translation="sacrifie" />
    </ArabicWordRow>

    <h2>2. Sourate Al-Ikhlas — 4 versets</h2>
    <p>
      Probablement la sourate la plus connue après Al-Fatiha. Avec 15 mots,
      elle résume le concept fondamental du <em>tawhid</em> (unicité divine).
      Le Prophète ﷺ a dit qu&apos;elle équivaut à un tiers du Coran en termes
      de sens. Rien que ça.
    </p>

    <ArabicWordRow>
      <ArabicWord word="أَحَدٌ" translation="unique" />
      <ArabicWord word="الصَّمَدُ" translation="l'Absolu" />
      <ArabicWord word="لَمْ يَلِدْ" translation="n'a pas engendré" />
    </ArabicWordRow>

    <h2>3. Sourate Al-Asr — 3 versets</h2>
    <p>
      L&apos;Imam Ash-Shafi&apos;i disait que si Allah n&apos;avait révélé que
      cette sourate, elle aurait suffi comme preuve pour l&apos;humanité.
      14 mots qui résument les 4 conditions du salut. Chaque mot compte.
    </p>

    <ArabicWordRow>
      <ArabicWord word="الْعَصْرِ" translation="le temps" />
      <ArabicWord word="خُسْرٍ" translation="perdition" />
      <ArabicWord word="الصَّبْرِ" translation="patience" />
    </ArabicWordRow>

    <InlineCTA text="Envie d'apprendre le vocabulaire de ces sourates ? Quranlab te fait pratiquer chaque mot avec des exercices interactifs." label="Commencer les exercices →" />

    <h2>4. Sourate Al-Falaq — 5 versets</h2>
    <p>
      Une sourate de protection qu&apos;on récite tous les jours. 23 mots qui
      t&apos;enseignent à chercher refuge auprès d&apos;Allah contre le mal.
      Le vocabulaire de la protection et du refuge est fondamental dans le Coran.
    </p>

    <ArabicWordRow>
      <ArabicWord word="أَعُوذُ" translation="je cherche refuge" />
      <ArabicWord word="الْفَلَقِ" translation="l'aube" />
      <ArabicWord word="شَرِّ" translation="mal" />
    </ArabicWordRow>

    <h2>5. Sourate An-Nas — 6 versets</h2>
    <p>
      La sœur jumelle d&apos;Al-Falaq. Elle utilise un vocabulaire similaire
      avec des répétitions qui facilitent la mémorisation. Le mot{" "}
      <span className="font-arabic text-lg">النَّاسِ</span> (les gens)
      y apparaît 5 fois — parfait pour l&apos;ancrer dans ta mémoire.
    </p>

    <Tip>
      🤲 <strong>Astuce pratique</strong> : récite Al-Falaq et An-Nas ensemble
      avant de dormir, comme le faisait le Prophète ﷺ. Tu révises ET tu
      pratiques une Sunna. D&apos;une pierre, deux coups.
    </Tip>

    <h2>Comment les mémoriser efficacement</h2>

    <Step number={1} title="Écoute avant de réciter">
      Écoute chaque sourate au moins 10 fois (en voiture, en cuisine, peu
      importe). Ton cerveau va commencer à mémoriser passivement avant même
      que tu essaies.
    </Step>

    <Step number={2} title="Verset par verset, pas en bloc">
      N&apos;essaie pas de mémoriser toute la sourate d&apos;un coup. Un verset
      à la fois, bien ancré, c&apos;est plus efficace qu&apos;une sourate
      entière mal retenue.
    </Step>

    <Step number={3} title="Comprends ce que tu dis">
      C&apos;est le secret le mieux gardé de la mémorisation : quand tu
      comprends le sens de chaque mot, ta vitesse de mémorisation double. C&apos;est
      prouvé.
    </Step>

    <Step number={4} title="Récite dans ta prière">
      Dès que tu maîtrises une sourate, utilise-la dans ta prière. Tu as 5
      prières par jour, soit au minimum 17 occasions de pratiquer. C&apos;est
      le meilleur système de révision qui existe.
    </Step>

    <p>
      Pour aller plus loin, consulte notre{" "}
      <Link href="/blog/memoriser-coran">guide complet de mémorisation</Link>{" "}
      et notre{" "}
      <Link href="/blog/tajwid-debutants">guide du Tajwid pour débutants</Link>{" "}
      pour une prononciation correcte.
    </p>
  </>
);

const TajwidDebutantsContent = () => (
  <>
    <p>
      Le Tajwid, ça te fait un peu peur ? Tu imagines des règles ultra
      complexes réservées aux étudiants en science islamique ? Je te rassure
      tout de suite : les bases du Tajwid sont accessibles à tout le monde,
      et ça va transformer ta récitation.
    </p>

    <p>
      Le mot <span className="font-arabic text-lg">تَجْوِيد</span> vient de
      la racine <span className="font-arabic">جَوَّدَ</span> qui signifie
      « embellir » ou « perfectionner ». Concrètement, c&apos;est donner à
      chaque lettre son droit : sa prononciation correcte, ses
      caractéristiques, et ses règles d&apos;interaction avec les lettres
      voisines.
    </p>

    <Tip>
      📖 <strong>Important</strong> : le Tajwid n&apos;est pas un luxe — c&apos;est
      une obligation pour tout musulman qui lit le Coran. Mais pas de panique,
      ça s&apos;apprend étape par étape, et tu vas voir que c&apos;est plus
      intuitif que tu ne le penses.
    </Tip>

    <h2>Les points d&apos;articulation — d&apos;où sortent les sons ?</h2>
    <p>
      L&apos;arabe a 28 lettres produites depuis 5 zones de ta bouche et ta
      gorge. C&apos;est ce qui donne à l&apos;arabe cette richesse sonore
      unique. Voici les 5 zones :
    </p>

    <div className="not-prose my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="rounded-xl border-2 border-brilliant-border bg-white p-4">
        <p className="font-heading font-bold text-brilliant-text text-sm mb-1">🫁 La gorge</p>
        <p className="font-arabic text-lg">ع غ ح خ ه ء</p>
      </div>
      <div className="rounded-xl border-2 border-brilliant-border bg-white p-4">
        <p className="font-heading font-bold text-brilliant-text text-sm mb-1">👅 La langue</p>
        <p className="text-sm text-brilliant-muted">La majorité des lettres</p>
      </div>
      <div className="rounded-xl border-2 border-brilliant-border bg-white p-4">
        <p className="font-heading font-bold text-brilliant-text text-sm mb-1">👄 Les lèvres</p>
        <p className="font-arabic text-lg">ب م و</p>
      </div>
      <div className="rounded-xl border-2 border-brilliant-border bg-white p-4">
        <p className="font-heading font-bold text-brilliant-text text-sm mb-1">👃 Le nez</p>
        <p className="text-sm text-brilliant-muted">La nasalisation (ghunna)</p>
      </div>
    </div>

    <h2>Les 4 règles du Noun Sakin — le cœur du Tajwid</h2>
    <p>
      Si tu ne devais retenir qu&apos;une chose du Tajwid, ce serait ça. Quand
      un <span className="font-arabic text-lg">نْ</span> (noun sakin) ou un
      tanwin rencontre certaines lettres, 4 choses peuvent se passer :
    </p>

    <div className="not-prose my-6 space-y-3">
      <div className="rounded-xl border-2 border-brilliant-border bg-white p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">1</span>
        <div>
          <p className="font-heading font-bold text-brilliant-text text-sm">Idh-har <span className="font-arabic">(إظْهَار)</span></p>
          <p className="text-sm text-brilliant-muted mt-0.5">Prononciation claire — devant les lettres de la gorge</p>
        </div>
      </div>
      <div className="rounded-xl border-2 border-brilliant-border bg-white p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">2</span>
        <div>
          <p className="font-heading font-bold text-brilliant-text text-sm">Idgham <span className="font-arabic">(إدْغَام)</span></p>
          <p className="text-sm text-brilliant-muted mt-0.5">Fusion avec les lettres <span className="font-arabic">يرملون</span></p>
        </div>
      </div>
      <div className="rounded-xl border-2 border-brilliant-border bg-white p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">3</span>
        <div>
          <p className="font-heading font-bold text-brilliant-text text-sm">Iqlab <span className="font-arabic">(إقْلَاب)</span></p>
          <p className="text-sm text-brilliant-muted mt-0.5">Le noun se transforme en « m » devant <span className="font-arabic">ب</span></p>
        </div>
      </div>
      <div className="rounded-xl border-2 border-brilliant-border bg-white p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">4</span>
        <div>
          <p className="font-heading font-bold text-brilliant-text text-sm">Ikhfa <span className="font-arabic">(إخْفَاء)</span></p>
          <p className="text-sm text-brilliant-muted mt-0.5">Nasalisation discrète — devant les 15 lettres restantes</p>
        </div>
      </div>
    </div>

    <Tip>
      🎵 <strong>Astuce</strong> : retiens le mot <span className="font-arabic">يَرْمُلُونَ</span> —
      ce sont les 6 lettres de l&apos;Idgham. C&apos;est un moyen
      mnémotechnique utilisé dans toutes les écoles coraniques.
    </Tip>

    <h2>Le Madd — quand allonger un son</h2>
    <p>
      Le Madd, c&apos;est l&apos;allongement d&apos;une voyelle. Deux catégories
      à retenir :
    </p>
    <ul>
      <li>
        <strong>Madd Tabii</strong> (naturel) : 2 temps. C&apos;est
        l&apos;allongement de base avec les lettres{" "}
        <span className="font-arabic">ا و ي</span>. Tu le fais déjà
        naturellement sans le savoir.
      </li>
      <li>
        <strong>Madd Far&apos;i</strong> (secondaire) : 4 à 6 temps. Il se
        déclenche quand un hamza ou un sukun suit la lettre de prolongation.
        C&apos;est là que ça demande un peu plus d&apos;attention.
      </li>
    </ul>

    <InlineCTA text="Le meilleur moyen d'appliquer le Tajwid, c'est de pratiquer sur du vrai vocabulaire coranique. Quranlab t'aide à apprendre les mots tout en perfectionnant ta lecture." label="Découvrir Quranlab →" />

    <h2>Par où commencer concrètement ?</h2>
    <p>
      Mon conseil : ne te noie <strong>surtout pas</strong> dans la théorie.
      Voici un plan d&apos;action simple :
    </p>

    <Step number={1} title="Commence par les règles du Noun Sakin">
      Ce sont les plus fréquentes. Tu les rencontreras à chaque ligne du Coran.
      Maîtrise-les en premier et tu sentiras déjà une énorme différence dans
      ta récitation.
    </Step>

    <Step number={2} title="Pratique sur les sourates que tu connais">
      Prends les{" "}
      <Link href="/blog/sourates-courtes">sourates courtes</Link> que tu
      récites déjà et applique les règles dessus. C&apos;est plus motivant
      que de travailler sur du texte inconnu.
    </Step>

    <Step number={3} title="Écoute et imite">
      Choisis un récitateur reconnu (Husary ou Minshawi sont parfaits pour
      apprendre) et essaie de reproduire exactement sa prononciation.
      Enregistre-toi et compare — tu seras surpris de tes progrès.
    </Step>

    <Step number={4} title="Apprends le vocabulaire en parallèle">
      Comprendre ce que tu récites aide à bien prononcer. C&apos;est
      contre-intuitif, mais quand tu sais ce que signifie un mot, tu mets
      naturellement plus d&apos;intention dans sa prononciation. Découvre
      notre guide sur le{" "}
      <Link href="/blog/vocabulaire-coran">vocabulaire coranique</Link>.
    </Step>

    <p>
      Le Tajwid, c&apos;est comme apprendre à conduire : au début tu penses à
      chaque règle consciemment, et puis ça devient automatique. La pratique
      vaut 10 fois la théorie. Alors ouvre ton mushaf et commence, maintenant.
    </p>
  </>
);

const MotsFrequentsCoranContent = () => (
  <>
    <p>
      Et si je te disais que <strong>100 mots suffisent pour comprendre
      plus de la moitié du Coran</strong> ? Pas 10 000, pas 1 000 — juste 100.
      C&apos;est la magie de la fréquence : certains mots reviennent tellement
      souvent qu&apos;en les maîtrisant, tu débloques une compréhension
      massive du texte.
    </p>

    <Tip>
      📊 <strong>Chiffre clé</strong> : les 100 mots les plus fréquents
      couvrent plus de 50% de l&apos;ensemble du texte coranique. Ça veut
      dire que sur chaque page, tu comprendras au moins un mot sur deux.
      C&apos;est un excellent début.
    </Tip>

    <h2>Les noms d&apos;Allah et attributs divins</h2>
    <p>
      Sans surprise, les mots les plus fréquents du Coran sont liés à Allah.
      Ces mots forment la colonne vertébrale de chaque sourate.
    </p>

    <ArabicWordRow>
      <ArabicWord word="اللَّه" translation="Allah" info="2 699 fois" />
      <ArabicWord word="رَبّ" translation="Seigneur" info="980 fois" />
      <ArabicWord word="رَحْمَة" translation="Miséricorde" info="339 fois" />
      <ArabicWord word="عِلْم" translation="Savoir" info="854 fois" />
    </ArabicWordRow>

    <h2>Les verbes les plus courants</h2>
    <p>
      Les verbes donnent vie au texte coranique. Tu vas retrouver ceux-ci
      partout — dans les récits des prophètes, les commandements, les
      descriptions du Jour dernier…
    </p>

    <ArabicWordRow>
      <ArabicWord word="قَالَ" translation="il a dit" info="1 722 fois" />
      <ArabicWord word="كَانَ" translation="il était" info="1 390 fois" />
      <ArabicWord word="عَلِمَ" translation="il a su" info="854 fois" />
      <ArabicWord word="آمَنَ" translation="il a cru" info="811 fois" />
    </ArabicWordRow>

    <ArabicWordRow>
      <ArabicWord word="جَعَلَ" translation="il a fait" info="346 fois" />
      <ArabicWord word="عَمِلَ" translation="il a agi" info="360 fois" />
      <ArabicWord word="جَاءَ" translation="il est venu" info="278 fois" />
      <ArabicWord word="أَرَادَ" translation="il a voulu" info="139 fois" />
    </ArabicWordRow>

    <h2>Les mots liés à la foi</h2>
    <p>
      Ces mots reviennent dans pratiquement chaque sourate. Les connaître,
      c&apos;est comprendre les thèmes centraux du Coran.
    </p>

    <ArabicWordRow>
      <ArabicWord word="إِيمَان" translation="foi" info="811 fois" />
      <ArabicWord word="كِتَاب" translation="livre" info="230 fois" />
      <ArabicWord word="آيَة" translation="signe / verset" info="382 fois" />
      <ArabicWord word="حَقّ" translation="vérité" info="287 fois" />
    </ArabicWordRow>

    <ArabicWordRow>
      <ArabicWord word="صَلَاة" translation="prière" info="99 fois" />
      <ArabicWord word="كُفْر" translation="mécréance" info="525 fois" />
    </ArabicWordRow>

    <InlineCTA text="Tu reconnais déjà certains de ces mots ? Avec Quranlab, transforme cette reconnaissance passive en maîtrise active." label="Tester mes connaissances →" />

    <h2>Les mots du quotidien</h2>
    <p>
      Le Coran parle de la terre, du ciel, de l&apos;eau, du cœur, de
      l&apos;âme… Des mots concrets que tu retrouves dans la vie de tous les
      jours.
    </p>

    <ArabicWordRow>
      <ArabicWord word="أَرْض" translation="terre" info="461 fois" />
      <ArabicWord word="سَمَاء" translation="ciel" info="310 fois" />
      <ArabicWord word="يَوْم" translation="jour" info="475 fois" />
      <ArabicWord word="نَاس" translation="gens" info="241 fois" />
    </ArabicWordRow>

    <ArabicWordRow>
      <ArabicWord word="قَلْب" translation="cœur" info="132 fois" />
      <ArabicWord word="مَاء" translation="eau" info="63 fois" />
      <ArabicWord word="نَفْس" translation="âme" info="295 fois" />
    </ArabicWordRow>

    <h2>Les particules — les petits mots qui changent tout</h2>
    <p>
      On les oublie souvent, mais ces « petits mots » sont les plus fréquents
      du Coran. Sans eux, impossible de comprendre la structure des versets.
    </p>

    <ArabicWordRow>
      <ArabicWord word="مِنْ" translation="de / parmi" info="3 226 fois" />
      <ArabicWord word="مَا" translation="ce que" info="2 065 fois" />
      <ArabicWord word="لَا" translation="ne…pas" info="1 738 fois" />
      <ArabicWord word="فِي" translation="dans" info="1 701 fois" />
    </ArabicWordRow>

    <ArabicWordRow>
      <ArabicWord word="إِنَّ" translation="certes" info="1 604 fois" />
      <ArabicWord word="الَّذِي" translation="celui qui" info="1 464 fois" />
      <ArabicWord word="عَلَى" translation="sur" info="984 fois" />
    </ArabicWordRow>

    <Tip>
      🔥 <strong>Challenge</strong> : apprends ces particules en premier.
      Elles représentent à elles seules des <em>milliers</em> d&apos;occurrences.
      Une fois que tu les reconnais automatiquement, chaque verset devient
      plus lisible.
    </Tip>

    <h2>Comment les apprendre efficacement</h2>
    <p>
      Mémoriser une liste, c&apos;est ennuyeux et ça ne marche pas. La
      meilleure approche, c&apos;est de pratiquer avec des{" "}
      <Link href="/blog/vocabulaire-coran">exercices interactifs</Link> qui
      testent ta mémoire sous différents angles : reconnaissance visuelle,
      traduction, contexte. C&apos;est exactement ce que propose Quranlab.
    </p>
    <p>
      Et combine ça avec la{" "}
      <Link href="/blog/memoriser-coran">mémorisation des sourates</Link> — tu
      verras ces mots en action, dans leur contexte naturel. C&apos;est comme
      ça qu&apos;ils se gravent dans ta mémoire pour de bon.
    </p>
  </>
);

const MemoriserCoranContent = () => (
  <>
    <p>
      Mémoriser le Coran — le <em>hifz</em> — c&apos;est un des projets les
      plus beaux et les plus ambitieux qu&apos;un musulman puisse entreprendre.
      Que tu vises le Coran entier ou simplement quelques sourates pour enrichir
      ta prière, ce guide te donne une méthode claire et des techniques qui ont
      fait leurs preuves.
    </p>

    <p>
      Mais soyons honnêtes dès le départ : c&apos;est un marathon, pas un
      sprint. Et comme tout marathon, il se prépare avec méthode.
    </p>

    <Tip>
      🌟 <strong>Rappel motivant</strong> : tu n&apos;as pas besoin de
      mémoriser tout le Coran pour bénéficier de cet apprentissage. Même 10
      sourates bien ancrées transformeront ta prière et ta connexion au Coran.
    </Tip>

    <h2>Avant de commencer : le bon état d&apos;esprit</h2>
    <p>
      Fixe-toi un objectif réaliste. « Je veux mémoriser le Coran entier en
      6 mois » → non. « Je veux mémoriser Juz Amma en 2 mois » → oui, faisable
      et motivant. Commence petit, et laisse l&apos;élan te porter.
    </p>

    <h2>La règle d&apos;or : comprends avant de mémoriser</h2>
    <p>
      C&apos;est le conseil que tout le monde donne mais que peu appliquent.
      Pourtant, les neurosciences sont formelles : <strong>nous retenons
      2 à 3 fois mieux ce que nous comprenons</strong>.
    </p>
    <p>
      Quand tu sais que <span className="font-arabic text-lg">الْحَمْدُ</span>{" "}
      signifie « la louange » et{" "}
      <span className="font-arabic text-lg">رَبِّ</span> signifie « Seigneur »,
      le verset{" "}
      <span className="font-arabic text-lg">
        الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
      </span>{" "}
      se grave naturellement. Tu ne mémorises plus des sons, tu mémorises du
      <em> sens</em>.
    </p>
    <p>
      C&apos;est pour ça qu&apos;apprendre le{" "}
      <Link href="/blog/vocabulaire-coran">vocabulaire coranique</Link> en
      parallèle de la mémorisation est un multiplicateur de force.
    </p>

    <h2>La méthode des 3 blocs</h2>
    <p>
      Cette méthode est utilisée dans les écoles coraniques traditionnelles
      et elle marche. 40 minutes par jour, découpées en 3 blocs :
    </p>

    <Step number={1} title="Nouvelle mémorisation — 20 min">
      <p>
        Apprends 3 à 5 nouveaux versets. La technique : lis chaque verset
        10 fois en regardant le mushaf, puis 10 fois sans regarder. Si tu
        bloques, pas grave — reviens au mushaf et recommence.
      </p>
    </Step>

    <Step number={2} title="Révision récente — 10 min">
      <p>
        Révise les versets appris dans les 7 derniers jours. C&apos;est la
        période critique où ta mémoire est fragile. Si tu ne révises pas
        maintenant, tu vas oublier.
      </p>
    </Step>

    <Step number={3} title="Révision ancienne — 10 min">
      <p>
        Révise une page ou une sourate plus ancienne. C&apos;est ce qui
        transforme la mémoire à court terme en mémoire à long terme.
      </p>
    </Step>

    <InlineCTA text="Quranlab applique la méthode des 3 blocs automatiquement : nouveaux mots, révision récente et révision ancienne, dans chaque session." label="Commencer une session →" />

    <h2>La répétition espacée — la science à ton service</h2>
    <p>
      Le cerveau oublie selon une courbe prévisible (la fameuse courbe de
      l&apos;oubli d&apos;Ebbinghaus). Pour contrer ça, révise selon ce
      rythme :
    </p>

    <div className="not-prose my-6 rounded-xl border-2 border-brilliant-border bg-white p-5">
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-3">
          <span className="w-16 font-heading font-bold text-[#6967fb]">Jour 1</span>
          <div className="flex-1 h-2 rounded-full bg-[#6967fb]/10"><div className="h-2 rounded-full bg-[#6967fb]" style={{ width: "100%" }} /></div>
          <span className="text-brilliant-muted text-xs">Apprentissage</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-16 font-heading font-bold text-[#6967fb]">Jour 2</span>
          <div className="flex-1 h-2 rounded-full bg-[#6967fb]/10"><div className="h-2 rounded-full bg-[#6967fb]" style={{ width: "85%" }} /></div>
          <span className="text-brilliant-muted text-xs">1ère révision</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-16 font-heading font-bold text-[#6967fb]">Jour 4</span>
          <div className="flex-1 h-2 rounded-full bg-[#6967fb]/10"><div className="h-2 rounded-full bg-[#6967fb]" style={{ width: "70%" }} /></div>
          <span className="text-brilliant-muted text-xs">2ème révision</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-16 font-heading font-bold text-[#6967fb]">Jour 7</span>
          <div className="flex-1 h-2 rounded-full bg-[#6967fb]/10"><div className="h-2 rounded-full bg-[#6967fb]" style={{ width: "55%" }} /></div>
          <span className="text-brilliant-muted text-xs">3ème révision</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-16 font-heading font-bold text-[#6967fb]">Jour 14</span>
          <div className="flex-1 h-2 rounded-full bg-[#6967fb]/10"><div className="h-2 rounded-full bg-[#6967fb]" style={{ width: "40%" }} /></div>
          <span className="text-brilliant-muted text-xs">4ème révision</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-16 font-heading font-bold text-[#6967fb]">Jour 30</span>
          <div className="flex-1 h-2 rounded-full bg-[#6967fb]/10"><div className="h-2 rounded-full bg-green-500" style={{ width: "100%" }} /></div>
          <span className="text-brilliant-muted text-xs">✓ Ancré</span>
        </div>
      </div>
    </div>

    <h2>Utilise la prière comme ancrage</h2>
    <p>
      C&apos;est gratuit, c&apos;est quotidien, et c&apos;est puissant. Récite
      tes nouveaux versets dans tes prières. 5 prières × minimum 17 rakaat =
      17 opportunités de révision par jour. Aucune app au monde ne peut battre
      ça.
    </p>

    <h2>Maîtrise le Tajwid en parallèle</h2>
    <p>
      Une bonne prononciation aide la mémorisation. Les règles du{" "}
      <Link href="/blog/tajwid-debutants">Tajwid</Link> donnent une « mélodie »
      à chaque verset qui facilite le rappel. Le cerveau retient mieux les
      motifs sonores que les séquences aléatoires — c&apos;est pour ça que tu
      retiens les chansons plus facilement que les cours de math.
    </p>

    <h2>Les erreurs qui font abandonner</h2>

    <Tip>
      ⚠️ <strong>Attention</strong> : 80% des gens qui abandonnent le hifz le
      font à cause de ces erreurs. Lis bien ce qui suit.
    </Tip>

    <ul>
      <li>
        <strong>Vouloir aller trop vite</strong> : mieux vaut 3 versets
        solides que 10 versets fragiles que tu oublieras dans une semaine.
      </li>
      <li>
        <strong>Négliger la révision</strong> : la règle d&apos;or, c&apos;est
        80% révision, 20% nouvelle mémorisation. Pas l&apos;inverse.
      </li>
      <li>
        <strong>Mémoriser sans comprendre</strong> : apprends au minimum les{" "}
        <Link href="/blog/mots-frequents-coran">100 mots les plus fréquents</Link>
        . Ça change tout.
      </li>
      <li>
        <strong>Abandonner après une pause</strong> : tu as manqué une semaine ?
        Pas grave. Reprends là où tu en étais, sans culpabiliser. Le Coran
        reviendra.
      </li>
    </ul>

    <h2>Un planning pour débutants</h2>
    <ul>
      <li>
        <strong>Mois 1</strong> : Juz Amma (30e partie) — les{" "}
        <Link href="/blog/sourates-courtes">sourates courtes</Link> que tu
        connais probablement déjà en partie.
      </li>
      <li>
        <strong>Mois 2-3</strong> : sourate Al-Mulk, Yasin, Ar-Rahman — des
        sourates magnifiques qui vont booster ta motivation.
      </li>
      <li>
        <strong>Mois 4-6</strong> : sourate Al-Kahf, Al-Baqarah — tu entres
        dans le vif du sujet.
      </li>
    </ul>
    <p>
      Ce planning suppose 30-40 minutes par jour. Adapte-le à ton rythme —
      la régularité prime toujours sur la quantité. Mieux vaut 15 minutes
      chaque jour que 3 heures une fois par semaine.
    </p>
  </>
);

/* ------------------------------------------------------------------ */
/*  Registry                                                           */
/* ------------------------------------------------------------------ */

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "vocabulaire-coran",
    title: "Comment apprendre le vocabulaire du Coran efficacement",
    description:
      "Découvre les meilleures méthodes pour apprendre le vocabulaire du Coran. 85% des mots coraniques proviennent de quelques centaines de racines arabes.",
    keywords: [
      "vocabulaire coranique",
      "apprendre le coran",
      "apprentissage coran en ligne",
      "apprendre l'arabe coranique",
    ],
    publishedAt: "2026-03-10",
    readingTime: 7,
    content: VocabulaireCoranContent,
  },
  {
    slug: "sourates-courtes",
    title: "Les 5 sourates les plus courtes pour commencer le Coran",
    description:
      "Les sourates les plus courtes du Coran sont idéales pour débuter. Découvre lesquelles apprendre en premier et comment les mémoriser efficacement.",
    keywords: [
      "sourates faciles à mémoriser",
      "apprendre le coran",
      "sourates courtes",
      "mémoriser le coran",
    ],
    publishedAt: "2026-03-17",
    readingTime: 8,
    content: SouratesCourtesContent,
  },
  {
    slug: "tajwid-debutants",
    title: "Guide du Tajwid pour débutants",
    description:
      "Apprends les règles de base du Tajwid pour lire le Coran correctement. Guide complet pour débutants avec exemples pratiques.",
    keywords: [
      "tajwid débutant",
      "apprendre l'arabe coranique",
      "apprendre le coran",
      "règles tajwid",
    ],
    publishedAt: "2026-03-24",
    readingTime: 9,
    content: TajwidDebutantsContent,
  },
  {
    slug: "mots-frequents-coran",
    title: "100 mots arabes les plus fréquents dans le Coran",
    description:
      "Les 100 mots les plus fréquents couvrent plus de 50% du texte coranique. Maîtrise-les pour comprendre le Coran en arabe.",
    keywords: [
      "vocabulaire coranique",
      "mots fréquents coran",
      "apprendre l'arabe coranique",
      "hifz coran",
    ],
    publishedAt: "2026-04-01",
    readingTime: 10,
    content: MotsFrequentsCoranContent,
  },
  {
    slug: "memoriser-coran",
    title: "Comment mémoriser le Coran : méthode complète",
    description:
      "Guide complet pour mémoriser le Coran (hifz). Techniques de répétition espacée, planning et conseils pratiques pour la mémorisation.",
    keywords: [
      "mémoriser le coran",
      "hifz coran",
      "apprentissage coran en ligne",
      "apprendre le coran",
    ],
    publishedAt: "2026-04-08",
    readingTime: 11,
    content: MemoriserCoranContent,
  },
];

/* ------------------------------------------------------------------ */
/*  Markdown file loader                                               */
/* ------------------------------------------------------------------ */

function loadMarkdownArticles(): BlogArticle[] {
  const contentDir = path.join(process.cwd(), "content", "blog");

  if (!fs.existsSync(contentDir)) return [];

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");

      // Skip markdown files that duplicate a JSX article
      if (BLOG_ARTICLES.some((a) => a.slug === slug)) return null;

      const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
      const { data, content } = matter(raw);

      return {
        slug,
        title: data.title || slug,
        description: data.description || "",
        keywords: data.keywords || [],
        publishedAt: data.publishedAt || new Date().toISOString().slice(0, 10),
        readingTime: data.readingTime || Math.ceil(content.split(/\s+/).length / 200),
        content: renderMarkdown(content),
      } satisfies BlogArticle;
    })
    .filter(Boolean) as BlogArticle[];
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function getAllArticles(): BlogArticle[] {
  const mdArticles = loadMarkdownArticles();
  const all = [...BLOG_ARTICLES, ...mdArticles];
  // Sort by date descending (newest first)
  return all.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getArticleBySlug(slug: string): BlogArticle | null {
  return getAllArticles().find((a) => a.slug === slug) ?? null;
}
