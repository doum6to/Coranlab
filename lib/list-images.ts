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

  // Lists added on 27 November 2026: one illustration each, drawn for them in the same palette
  "Pronoms Personnels": "/lists/n-pronoms-personnels.webp",
  "Pronoms Attachés": "/lists/n-pronoms-attaches.webp",
  "Particules en Mā": "/lists/n-particules-ma.webp",
  "Particules du Verbe": "/lists/n-particules-verbe.webp",
  "Liaisons": "/lists/n-liaisons.webp",
  "Divers II": "/lists/n-divers-2.webp",
  "Comparatifs & Attributs": "/lists/n-comparatifs.webp",
  "Peuples & Personnages": "/lists/n-peuples.webp",
  "Le Dernier Jour II": "/lists/n-dernier-jour-2.webp",
  "Bienfaits & Actes": "/lists/n-bienfaits.webp",
  "Famille & Corps": "/lists/n-famille-corps.webp",
  "Divers (Noms) II": "/lists/n-divers-noms-2.webp",
  "Divers (Noms) III": "/lists/n-divers-noms-3.webp",
  "Forme I - Partie 3": "/lists/n-forme1-3.webp",
  "Forme I - Partie 4": "/lists/n-forme1-4.webp",
  "Forme I - Partie 5": "/lists/n-forme1-5.webp",
  "Verbes Redoublés": "/lists/n-redoubles.webp",
  "Verbes Assimilés": "/lists/n-assimiles.webp",
  "Verbes Creux & Défectueux": "/lists/n-creux.webp",
  "Verbes Hamzés": "/lists/n-hamzes.webp",
  "Forme II - Partie 2": "/lists/n-forme2-2.webp",
  "Forme III - Partie 2": "/lists/n-forme3-2.webp",
  "Forme IV - Partie 2": "/lists/n-forme4-2.webp",
  "Forme IV - Partie 3": "/lists/n-forme4-3.webp",
  "Forme IV - Partie 4": "/lists/n-forme4-4.webp",
  "Forme IV - Partie 5": "/lists/n-forme4-5.webp",
  "Formes V & VI - Partie 2": "/lists/n-formes5-6.webp",
  "Formes VII, VIII & X - Partie 2": "/lists/n-formes7-8-10.webp",
};

const DEFAULT_IMAGE = "/lists/puzzle.png";

export function getListImage(title: string): string {
  return LIST_IMAGE_MAP[title] || DEFAULT_IMAGE;
}
