export const LEAGUE_TIERS = [
  "NIYYA", "IQRA", "TALIB", "TARTIL", "TAJWID",
  "QARI", "TADABBUR", "HAFIZ", "MUTQIN", "FIRDAUS",
] as const;

export type LeagueTier = typeof LEAGUE_TIERS[number];

export const TIER_LABELS: Record<LeagueTier, string> = {
  NIYYA: "Niyya",
  IQRA: "Iqra",
  TALIB: "Talib",
  TARTIL: "Tartil",
  TAJWID: "Tajwid",
  QARI: "Qari",
  TADABBUR: "Tadabbur",
  HAFIZ: "Hafiz",
  MUTQIN: "Mutqin",
  FIRDAUS: "Firdaus",
};

export const TIER_COLORS: Record<LeagueTier, string> = {
  NIYYA: "#9CA3AF",
  IQRA: "#22C55E",
  TALIB: "#3B82F6",
  TARTIL: "#8B5CF6",
  TAJWID: "#F59E0B",
  QARI: "#F97316",
  TADABBUR: "#F43F5E",
  HAFIZ: "#10B981",
  MUTQIN: "#6366F1",
  FIRDAUS: "#FFD700",
};

export const TIER_DESCRIPTIONS: Record<LeagueTier, string> = {
  NIYYA: "L'intention",
  IQRA: "La lecture",
  TALIB: "L'étudiant",
  TARTIL: "La récitation",
  TAJWID: "La maîtrise",
  QARI: "Le récitateur",
  TADABBUR: "La méditation",
  HAFIZ: "Le gardien",
  MUTQIN: "La perfection",
  FIRDAUS: "Le paradis",
};

export const GROUP_SIZE = 30;
export const PROMOTE_COUNT = 3;
export const DEMOTE_COUNT = 3;
export const MIN_XP_TO_JOIN = 100;

// Week boundary: Sunday 20:00 PT = Monday 03:00 UTC
const WEEK_BOUNDARY_UTC_HOUR = 3;

export function getCurrentWeekStart(): string {
  const now = new Date();
  const utcDay = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const utcHour = now.getUTCHours();

  // Calculate days since Monday 03:00 UTC
  // If it's Monday before 03:00 UTC, we're still in the previous week
  let daysSinceMonday = (utcDay + 6) % 7; // Convert: Mon=0, Tue=1, ... Sun=6
  if (daysSinceMonday === 0 && utcHour < WEEK_BOUNDARY_UTC_HOUR) {
    daysSinceMonday = 7; // Still previous week
  }

  const monday = new Date(now);
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);
  monday.setUTCHours(0, 0, 0, 0);

  return monday.toISOString().split("T")[0];
}

export function getPreviousWeekStart(weekStart: string): string {
  const date = new Date(weekStart + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() - 7);
  return date.toISOString().split("T")[0];
}

export function getNextResetTime(): Date {
  const now = new Date();
  const utcDay = now.getUTCDay();
  const utcHour = now.getUTCHours();

  // Next Monday 03:00 UTC
  let daysUntilMonday = (1 - utcDay + 7) % 7;
  if (daysUntilMonday === 0 && utcHour >= WEEK_BOUNDARY_UTC_HOUR) {
    daysUntilMonday = 7;
  }

  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + daysUntilMonday);
  next.setUTCHours(WEEK_BOUNDARY_UTC_HOUR, 0, 0, 0);
  return next;
}

export function getTierIndex(tier: LeagueTier): number {
  return LEAGUE_TIERS.indexOf(tier);
}

export function getPromotedTier(tier: LeagueTier): LeagueTier {
  const idx = getTierIndex(tier);
  return idx < LEAGUE_TIERS.length - 1 ? LEAGUE_TIERS[idx + 1] : tier;
}

export function getDemotedTier(tier: LeagueTier): LeagueTier {
  const idx = getTierIndex(tier);
  return idx > 0 ? LEAGUE_TIERS[idx - 1] : tier;
}
