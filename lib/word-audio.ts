import manifest from "./word-audio-manifest.json";

/**
 * Pronunciation clips for the vocabulary (one mp3 per Arabic word, generated
 * once by scripts/generate-word-audio.ts and served from /audio/words/).
 * The manifest maps the exact Arabic string to its file name. Everything in
 * the UI is conditional on a clip existing, so words without audio simply
 * show no speaker button and never become listening exercises.
 */
const FILES = manifest as Record<string, string>;

/** Same normalisation as the generator: NFC, trim, collapse inner whitespace. */
export const wordAudioKey = (arabic: string) => arabic.normalize("NFC").trim().replace(/\s+/g, " ");

export function wordAudioSrc(arabic: string | null | undefined): string | null {
  if (!arabic) return null;
  const file = FILES[wordAudioKey(arabic)];
  return file ? `/audio/words/${file}` : null;
}

/** False until clips are generated: hides the sound switch meanwhile. */
export const hasAnyWordAudio = Object.keys(FILES).length > 0;

export const hasWordAudio = (arabic: string | null | undefined) => wordAudioSrc(arabic) !== null;

/**
 * Listening exercises are "virtual": no new challenge type in the database.
 * A stable half of the multiple-choice challenges is presented by ear instead
 * of in writing, and only when the clip exists:
 *  - "meaning": hear the word, pick its meaning (from a QCM)
 *  - "written": hear the word, pick how it is written (from a QCM_INVERSE)
 */
export type ListenMode = "meaning" | "written" | null;

type ListenChallenge = {
  id: number;
  type: string;
  arabicWord?: string | null;
  challengeOptions?: { correct: boolean; arabicText?: string | null; text: string }[];
};

/** Deterministic per challenge, so a lesson looks the same on every visit. */
const pickedForListening = (id: number) => (Math.imul(id, 2654435761) >>> 0) % 100 < 50;

/** The word a listening exercise plays (null when the challenge has none). */
export function listenWord(challenge: ListenChallenge): string | null {
  if (challenge.type === "QCM") return challenge.arabicWord ?? null;
  if (challenge.type === "QCM_INVERSE") {
    const correct = challenge.challengeOptions?.find((o) => o.correct);
    return correct?.arabicText || challenge.arabicWord || null;
  }
  return null;
}

export function listenMode(challenge: ListenChallenge): ListenMode {
  if (challenge.type !== "QCM" && challenge.type !== "QCM_INVERSE") return null;
  if (!pickedForListening(challenge.id)) return null;
  if (!hasWordAudio(listenWord(challenge))) return null;
  return challenge.type === "QCM" ? "meaning" : "written";
}
