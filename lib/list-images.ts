/**
 * Maps list titles to their illustration images.
 * Images are stored in /public/lists/
 */

const LIST_IMAGE_MAP: Record<string, string> = {
  // Partie I : Les Fondements
  "Pronoms Démonstratifs": "/lists/puzzle.png",
  "Négations & Exceptions": "/lists/negations.png",
  "Mots Interrogatifs": "/lists/interrogation.png",
  "Prépositions": "/lists/lanterne.png",
  "Particules": "/lists/tiktak.png",
  "Connecteurs": "/lists/carres.png",
  "Divers": "/lists/fleche.png",

  // Partie II : Noms et Adjectifs
  "Noms & Attributs d'Allah": "/lists/lanterne.png",
  "Attributs / Adjectifs": "/lists/papier.png",
  "Prophètes & Messagers": "/lists/coupe.png",
  "Signes & Bénédictions": "/lists/vraifaux.png",
  "Deen": "/lists/lanterne.png",
  "Foi": "/lists/idee.png",
  "Actes": "/lists/chess.png",
  "Le Dernier Jour": "/lists/thinking.png",
  "La Vie Présente": "/lists/cahier.png",
  "Proches": "/lists/rubiks.png",
  "Divers (Noms)": "/lists/fleche.png",
  "Pluriels Irréguliers": "/lists/find.png",

  // Partie III : Les Formes Verbales
  "Forme II": "/lists/carres.png",
  "Forme III": "/lists/tiktak.png",
  "Forme IV": "/lists/puzzle.png",
  "Forme V": "/lists/negations.png",
  "Formes VI & VII": "/lists/interrogation.png",
  "Forme VIII": "/lists/papier.png",
  "Formes IX & X": "/lists/coupe.png",
  "Forme I - Partie 1": "/lists/chess.png",
  "Forme I - Partie 2": "/lists/cahier.png",
  "Verbes Irréguliers - Partie 1": "/lists/rubiks.png",
  "Verbes Irréguliers - Partie 2": "/lists/find.png",
};

const DEFAULT_IMAGE = "/lists/puzzle.png";

export function getListImage(title: string): string {
  return LIST_IMAGE_MAP[title] || DEFAULT_IMAGE;
}
