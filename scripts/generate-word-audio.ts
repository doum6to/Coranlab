/**
 * Generates one pronunciation clip per vocabulary word with ElevenLabs and
 * writes them to public/audio/words/ + lib/word-audio-manifest.json.
 *
 *   ELEVENLABS_API_KEY=… npx tsx scripts/generate-word-audio.ts
 *
 * Options (env):
 *   ELEVENLABS_VOICE_ID another voice than the default one
 *   ELEVENLABS_MODEL   model id (default "eleven_v4")
 *   LIMIT=20           only the first N missing words (to try a voice cheaply)
 *   FORCE=1            regenerate clips that already exist
 *   DRY_RUN=1          print what would be sent, call nothing
 *
 * Safe to re-run: existing clips are skipped, so a failed run resumes where
 * it stopped. Needs ffmpeg on the PATH to trim silences and even out volume
 * (without it the raw clip is kept).
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

import { vocabularyData } from "./vocabulary-data";
import { toSpeechArabic } from "../lib/arabic-speech";
import { COMMENCER_DEFAULTS } from "../lib/commencer-shared";

const OUT_DIR = path.join(process.cwd(), "public", "audio", "words");
const MANIFEST = path.join(process.cwd(), "lib", "word-audio-manifest.json");

const API_KEY = process.env.ELEVENLABS_API_KEY || "";
// Default voice: "Mousa - Deep and calm" (chosen by the owner).
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "UFdQlwhVL1IF48QYW8qF";
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_v4";
const LIMIT = Number(process.env.LIMIT || 0);
const FORCE = process.env.FORCE === "1";
const DRY_RUN = process.env.DRY_RUN === "1";

// Must match wordAudioKey() in lib/word-audio.ts.
const keyOf = (arabic: string) => arabic.normalize("NFC").trim().replace(/\s+/g, " ");
const fileOf = (key: string) => `${createHash("sha1").update(key).digest("hex").slice(0, 12)}.mp3`;

const hasFfmpeg = (() => {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

/** Trim leading/trailing silence, even out loudness, mono 64 kb/s (≈ 8 KB a word). */
function polish(file: string) {
  if (!hasFfmpeg) return;
  const tmp = `${file}.tmp.mp3`;
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03";
  execFileSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-i", file, "-af", `${trim},areverse,${trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.08`, "-ac", "1", "-ar", "44100", "-b:a", "64k", tmp],
    { stdio: "inherit" },
  );
  renameSync(tmp, file);
}

const HEADERS = { "xi-api-key": API_KEY || "injected-by-proxy", "content-type": "application/json" };
// Some models refuse an explicit language: dropped on the first refusal.
let sendLanguage = true;

/** Stops early, with the list of valid ids, when the model name is not one the account can use. */
async function checkModel() {
  const res = await fetch("https://api.elevenlabs.io/v1/models", { headers: HEADERS });
  if (res.status === 401) throw new Error("ElevenLabs refuse la clé (401). Vérifie ELEVENLABS_API_KEY.");
  if (!res.ok) return; // the list is a convenience: let the first synthesis report any real problem
  const models = (await res.json()) as { model_id: string; can_do_text_to_speech?: boolean }[];
  const ids = models.filter((m) => m.can_do_text_to_speech !== false).map((m) => m.model_id);
  if (ids.length && !ids.includes(MODEL)) {
    throw new Error(`Le modèle "${MODEL}" n'existe pas sur ce compte. Modèles disponibles : ${ids.join(", ")}. Relance avec ELEVENLABS_MODEL=<id>.`);
  }
}

async function synthesize(text: string): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...HEADERS, accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: MODEL, ...(sendLanguage ? { language_code: "ar" } : {}) }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const body = (await res.text()).slice(0, 300);
    if (sendLanguage && (res.status === 400 || res.status === 422) && /language/i.test(body)) {
      sendLanguage = false;
      continue;
    }
    // Rate limit or a busy server: wait and retry. Anything else is a real error.
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      continue;
    }
    throw new Error(`ElevenLabs ${res.status}: ${body}`);
  }
}

async function main() {
  if (!DRY_RUN && !VOICE_ID) throw new Error("ELEVENLABS_VOICE_ID is required.");
  if (!DRY_RUN) await checkModel();
  mkdirSync(OUT_DIR, { recursive: true });

  const manifest: Record<string, string> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
  // The words of the onboarding mini-lesson (written with their case endings) get a clip too.
  const funnel = COMMENCER_DEFAULTS.steps.flatMap((s) => (s.type === "lesson" ? s.cards.map((c) => keyOf(c.arabic)) : []));
  const words = Array.from(
    new Set([...vocabularyData.flatMap((u) => u.lists.flatMap((l) => l.words.map((w) => keyOf(w.arabic)))), ...funnel]),
  );

  let done = 0;
  let skipped = 0;
  const failed: string[] = [];
  for (const key of words) {
    const file = fileOf(key);
    const target = path.join(OUT_DIR, file);
    if (!FORCE && existsSync(target)) {
      manifest[key] = file;
      skipped++;
      continue;
    }
    if (LIMIT && done >= LIMIT) break;
    const text = toSpeechArabic(key);
    if (DRY_RUN) {
      console.log(`${key}  →  "${text}"  →  ${file}`);
      done++;
      continue;
    }
    try {
      writeFileSync(target, await synthesize(text));
      polish(target);
      manifest[key] = file;
      done++;
      // Saved as we go so an interrupted run loses nothing.
      writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
      console.log(`✓ ${done}  ${key}`);
    } catch (e) {
      if (existsSync(target)) unlinkSync(target);
      failed.push(key);
      console.error(`✗ ${key}: ${(e as Error).message}`);
      if (failed.length >= 5) break; // wrong key, voice or model: stop early
    }
  }

  if (!DRY_RUN) writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n${done} generated, ${skipped} already there, ${failed.length} failed, ${words.length} words in total.`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
