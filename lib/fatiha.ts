/**
 * Al-Fatiha, used to show a learner where a word they just understood sits
 * in what they already recite in every prayer.
 */
export type FatihaVerse = { n: number; ar: string; fr: string; en: string; es: string };

export const FATIHA: FatihaVerse[] = [
  { n: 1, ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", fr: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.", en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", es: "En el nombre de Allah, el Compasivo, el Misericordioso." },
  { n: 2, ar: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", fr: "Louange à Allah, Seigneur des mondes.", en: "All praise is due to Allah, Lord of the worlds.", es: "La alabanza es para Allah, Señor de los mundos." },
  { n: 3, ar: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", fr: "Le Tout Miséricordieux, le Très Miséricordieux.", en: "The Entirely Merciful, the Especially Merciful.", es: "El Compasivo, el Misericordioso." },
  { n: 4, ar: "مَٰلِكِ يَوْمِ ٱلدِّينِ", fr: "Maître du Jour de la rétribution.", en: "Sovereign of the Day of Recompense.", es: "Soberano del Día de la Retribución." },
  { n: 5, ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", fr: "C'est Toi que nous adorons, et c'est Toi dont nous implorons le secours.", en: "It is You we worship and You we ask for help.", es: "Solo a Ti adoramos y solo a Ti pedimos ayuda." },
  { n: 6, ar: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", fr: "Guide-nous dans le droit chemin.", en: "Guide us to the straight path.", es: "Guíanos por el camino recto." },
  { n: 7, ar: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّالِّينَ", fr: "Le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés.", en: "The path of those upon whom You have bestowed favor, not of those who have earned Your anger or of those who are astray.", es: "El camino de los que has agraciado, no el de los que han incurrido en Tu ira, ni el de los extraviados." },
];

/** Letters only: no vowel marks, one form of alef. Lets "rabbi" match "rabb". */
const skeleton = (s: string) =>
  s
    .normalize("NFC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[\u0671\u0623\u0625\u0622]/g, "\u0627")
    .trim();

// Verse 1 last: the basmala repeats words that read better in their own verse.
const ORDER = [2, 3, 4, 5, 6, 7, 1];

/** The verse of Al-Fatiha containing this word, split so the word can be highlighted. */
export function findInFatiha(word: string): { verse: FatihaVerse; words: string[]; index: number } | null {
  const target = skeleton(word);
  if (!target) return null;
  for (const n of ORDER) {
    const verse = FATIHA[n - 1];
    const words = verse.ar.split(" ");
    const index = words.findIndex((w) => skeleton(w) === target);
    if (index >= 0) return { verse, words, index };
  }
  return null;
}
