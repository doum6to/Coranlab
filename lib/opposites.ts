/**
 * Real opposite pairs within the vocabulary (keyed by the stored French
 * meaning, symmetric). Used by the seed to build OPPOSITE exercises and by
 * the lesson readers to repair legacy OPPOSITE challenges that were generated
 * with a random "opposite" (which made no sense to learners).
 */
const PAIRS: [string, string][] = [
  // Demonstratives / relatives
  ["Ceci (Masculin)", "Cela / Celui-là (Masculin)"],
  ["Celle-ci (Féminin)", "Celle-là (Féminin)"],
  ["Ceux-ci / Celles-ci (Pluriel)", "Ceux-là / Celles-là (Pluriel)"],
  ["Celui qui (Masculin)", "Celle qui (Féminin)"],
  // Negations
  ["Oui", "Absolument pas"],
  ["Bien sûr / Si", "Absolument pas"],
  // Prepositions / adverbs
  ["Au-dessus / Sur", "Sous / En dessous"],
  ["Sur / Au-dessus", "Sous / En dessous"],
  ["Droite", "Gauche"],
  ["Devant", "Derrière / Successeur"],
  ["Devant", "Derrière / Au-delà"],
  ["Avant", "Après"],
  ["De / Depuis", "Vers"],
  ["De / Depuis", "Jusqu'à"],
  ["Proche", "Loin"],
  // Attributes
  ["Premier", "Dernier"],
  ["Grand / Plus grand", "Peu / Petit"],
  ["Beaucoup / La plupart", "Peu / Petit"],
  ["Meilleur", "Plus injuste"],
  // Nouns
  ["Soleil", "Lune"],
  ["Nuit", "Jour"],
  ["Terre", "Cieux / Ciel"],
  ["Vérité", "Faux"],
  ["L'Invisible", "L'Apparent / Témoignage"],
  ["Bonne action / Bien", "Mauvaise action / Péché"],
  ["Bien / Meilleur", "Mal / Pire"],
  ["Illicite", "Licite"],
  ["Paradis / Jardins", "Feu de l'Enfer"],
  ["Paradis / Jardins", "Géhenne"],
  ["Récompense", "Châtiment / Punition"],
  ["L'Au-delà", "Ce monde / La vie d'ici-bas"],
  ["Mère", "Père"],
  ["Homme", "Femme / Épouse"],
  ["Mâle", "Femelle"],
  ["Femmes", "Hommes"],
  ["Ennemi", "Tuteur / Allié"],
  // Verbs
  ["Faire sortir", "Faire entrer"],
  ["Sortir", "Entrer"],
  ["Réparer", "Semer la corruption"],
  ["Noircir", "Blanchir"],
  ["Mécroire", "Adorer"],
  ["Se souvenir", "Oublier"],
  ["Se rappeler", "Oublier"],
  ["Donner la vie", "Tuer"],
  ["Être guidé", "S'égarer"],
  ["Guider", "S'égarer"],
  ["Pardonner", "Châtier"],
  ["Savoir", "Oublier"],
  ["Patienter", "Se hâter"],
  ["Suivre", "Se détourner"],
  ["Élever", "Faire descendre"],
  ["Mourir", "Donner la vie"],
];

export const OPPOSITES: Record<string, string[]> = {};
for (const [a, b] of PAIRS) {
  (OPPOSITES[a] ??= []).push(b);
  (OPPOSITES[b] ??= []).push(a);
}

/** True when `candidate` is a genuine opposite of `word` (French meanings). */
export function isOpposite(word: string | null | undefined, candidate: string | null | undefined): boolean {
  if (!word || !candidate) return false;
  return (OPPOSITES[word.trim()] ?? []).includes(candidate.trim());
}

type Opt = { text: string; correct: boolean; frenchText: string | null };

/**
 * Repairs an OPPOSITE challenge whose "correct" option is not a real
 * opposite of the word (legacy seeds picked a random word). Such a challenge
 * becomes a plain QCM asking for the word's own translation: the option that
 * was marked correct is relabelled with the real meaning; the distractors are
 * kept (any distractor equal to the meaning is swapped with the old label).
 * Returns the input untouched when the opposite is genuine.
 */
export function repairOppositeChallenge<T extends { type: string; question: string; frenchTranslation: string | null }, O extends Opt>(
  challenge: T,
  options: O[],
): { challenge: T; options: O[] } {
  if (challenge.type !== "OPPOSITE") return { challenge, options };
  const correct = options.find((o) => o.correct);
  const meaning = challenge.frenchTranslation?.trim();
  if (!correct || !meaning) return { challenge, options };
  if (isOpposite(meaning, correct.frenchText ?? correct.text)) return { challenge, options };

  const oldLabel = correct.frenchText ?? correct.text;
  const fixed = options.map((o) => {
    if (o.correct) return { ...o, text: meaning, frenchText: meaning };
    const label = (o.frenchText ?? o.text).trim();
    if (label === meaning) return { ...o, text: oldLabel, frenchText: oldLabel };
    return o;
  });
  return {
    challenge: { ...challenge, type: "QCM", question: "Quelle est la traduction de ce mot ?" },
    options: fixed,
  };
}
