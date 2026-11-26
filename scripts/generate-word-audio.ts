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

async function synthesize(text: string): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": API_KEY || "injected-by-proxy", "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: MODEL, language_code: "ar" }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const body = (await res.text()).slice(0, 300);
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
  mkdirSync(OUT_DIR, { recursive: true });

  const manifest: Record<string, string> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
  const words = Array.from(
    new Set(vocabularyData.flatMap((u) => u.lists.flatMap((l) => l.words.map((w) => keyOf(w.arabic))))),
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
