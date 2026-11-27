import { challengeOptions, challenges } from "@/db/schema";
import { repairChallenge } from "@/lib/challenge-repair";
import { translateContent } from "@/lib/i18n/content-i18n";
import type { Locale } from "@/lib/i18n/locales";

type RawChallenge = typeof challenges.$inferSelect & {
  challengeOptions: (typeof challengeOptions.$inferSelect)[];
  challengeProgress?: { completed: boolean }[];
};

/**
 * An exercise as the lesson screen expects it: repaired when the generated data is unfair
 * (ambiguous distractors, random "opposites", wrong truth values: see lib/challenge-repair.ts),
 * put in the learner's language, and marked done or not.
 */
export function normalizeChallenge(raw: RawChallenge, locale: Locale) {
  const completed = !!raw.challengeProgress && raw.challengeProgress.length > 0 && raw.challengeProgress.every((progress) => progress.completed);
  const repaired = repairChallenge(raw, raw.challengeOptions ?? []);
  const challenge = { ...repaired.challenge, challengeOptions: repaired.options };
  return {
    ...challenge,
    question: translateContent(challenge.question, locale),
    frenchTranslation: challenge.frenchTranslation ? translateContent(challenge.frenchTranslation, locale) : challenge.frenchTranslation,
    challengeOptions: challenge.challengeOptions?.map((opt) => ({
      ...opt,
      text: translateContent(opt.text, locale),
      frenchText: opt.frenchText ? translateContent(opt.frenchText, locale) : opt.frenchText,
    })),
    completed,
  };
}
