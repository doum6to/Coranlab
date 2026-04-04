import { type LeagueTier } from "./league-utils";

export const BOT_NAMES = [
  "Amina", "Yusuf", "Khadija", "Ibrahim", "Fatima",
  "Omar", "Aisha", "Bilal", "Maryam", "Hassan",
  "Zaynab", "Idris", "Safiya", "Moussa", "Nour",
  "Hamza", "Salma", "Ayoub", "Hafsa", "Souleymane",
  "Djamila", "Ismail", "Rania", "Abdallah", "Leila",
  "Youssef", "Asma", "Khalid", "Samira", "Amine",
  "Hana", "Mehdi", "Yasmine", "Rachid", "Inès",
  "Tariq", "Malika", "Bakari", "Amani", "Zakaria",
  "Mariam", "Suleiman", "Halima", "Mustapha", "Sakina",
  "Ilyas", "Karima", "Walid", "Nabila", "Oussama",
  "Dina", "Anwar", "Latifa", "Sami", "Farah",
  "Karim", "Nawal", "Jamal", "Imane", "Faisal",
  "Sana", "Adil", "Houda", "Nabil", "Lamia",
  "Reda", "Souad", "Hicham", "Zainab", "Driss",
  "Meriem", "Anas", "Ghizlane", "Othman", "Rim",
  "Taha", "Hajar", "Yassine", "Asmae", "Noureddin",
  "Rajae", "Saad", "Bouchra", "Abdelkader", "Siham",
  "Ilyass", "Chaimae", "Younes", "Ikram", "Badr",
  "Wafa", "Hamid", "Loubna", "Fouad", "Nisrine",
  "Abdou", "Soukaina", "Mansour", "Jihane", "Tarek",
];

const XP_RANGES: Record<LeagueTier, [number, number]> = {
  NIYYA:   [50, 350],
  IQRA:    [150, 550],
  TALIB:   [300, 800],
  TARTIL:  [500, 1200],
  TAJWID:  [800, 1800],
  QARI:    [1200, 2500],
  TADABBUR:[1800, 3500],
  HAFIZ:   [2500, 4500],
  MUTQIN:  [3500, 6000],
  FIRDAUS: [4000, 8000],
};

export function generateBotId(): string {
  return "bot_" + crypto.randomUUID();
}

export function generateBotXp(tier: LeagueTier): number {
  const [min, max] = XP_RANGES[tier];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickBotName(usedNames: Set<string>): string {
  const available = BOT_NAMES.filter((n) => !usedNames.has(n));
  if (available.length === 0) {
    // Fallback: add a number suffix
    const base = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    return `${base}${Math.floor(Math.random() * 99) + 1}`;
  }
  return available[Math.floor(Math.random() * available.length)];
}
