import type { UnitWithLists } from "@/db/queries";

/** The course's promise: the share of the Qur'an's words it covers once finished. */
export const COVERAGE_GOAL = 85;

/**
 * The figure is only shown once the course in the database is the complete one: its parts
 * then carry the corrected ranges (0-41, 41-60, 60-85 %). With the earlier, shorter course
 * the ranges read 0-50, 50-65, 65-85 % and the figure overstated, so it stays hidden.
 */
export function coverageIsReliable(units: UnitWithLists[]): boolean {
  return units.length > 0 && /(\d+)\s*%\D+41\s*%/.test(units[0].description || "");
}

/**
 * Roughly how much of the Qur'an's words a learner understands so far, in percent.
 *
 * Each part of the course states the range it covers ("0% à 50% du Coran", then 50 to 65,
 * then 65 to 85). A part counts in proportion to its finished levels. It is an estimate: the
 * words of a part are not all equally frequent, so the figure is always shown as "about".
 */
export function quranCoverage(units: UnitWithLists[]): number {
  let covered = 0;
  for (const unit of units) {
    const range = /(\d+)\s*%\D+(\d+)\s*%/.exec(unit.description || "");
    if (!range) continue;
    const span = Number(range[2]) - Number(range[1]);
    let total = 0;
    let done = 0;
    for (const list of unit.lists) {
      total += list.totalLevels;
      done += list.completedLevels;
    }
    if (total > 0 && span > 0) covered += (span * done) / total;
  }
  return Math.min(COVERAGE_GOAL, Math.round(covered * 10) / 10);
}

/** "12,4" in French, "12.4" in English: one decimal, none when it is a round number. */
export function formatCoverage(value: number, locale: string): string {
  return value.toLocaleString(locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "fr-FR", { maximumFractionDigits: 1 });
}
