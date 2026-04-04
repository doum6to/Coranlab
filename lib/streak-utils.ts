export const MAX_STREAK_CHARGES = 2;

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().split("T")[0];
}

export function daysBetween(fromDate: string, toDate: string): number {
  const from = new Date(fromDate + "T00:00:00Z").getTime();
  const to = new Date(toDate + "T00:00:00Z").getTime();
  return Math.round((to - from) / 86400000);
}

// Last 5 calendar days including today, in chronological order (oldest first)
export function getLast5Days(): string[] {
  return [4, 3, 2, 1, 0].map((n) => getDateNDaysAgo(n));
}

const DAY_LABELS_FR: Record<number, string> = {
  0: "Di",
  1: "Lu",
  2: "Ma",
  3: "Me",
  4: "Je",
  5: "Ve",
  6: "Sa",
};

export function getDayLabel(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  return DAY_LABELS_FR[d.getUTCDay()];
}
