/**
 * Phonetic reading (Latin letters) of a fully vocalised Arabic word, for
 * learners who cannot read Arabic script yet. Rule-based, tuned for the
 * Qur'anic vocabulary of the app: long vowels are written â î û, the letter
 * ʿayn is written ‘ and the hamza '.
 */
const CONSONANTS: Record<string, string> = {
  "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z",
  "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "z", "ع": "‘", "غ": "gh", "ف": "f", "ق": "q",
  "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w", "ي": "y",
  "ء": "'", "أ": "'", "إ": "'", "ؤ": "'", "ئ": "'",
};
const FATHA = "\u064E", DAMMA = "\u064F", KASRA = "\u0650", SHADDA = "\u0651", SUKUN = "\u0652";
const FATHATAN = "\u064B", DAMMATAN = "\u064C", KASRATAN = "\u064D";
const MARKS = new Set([FATHA, DAMMA, KASRA, SHADDA, SUKUN, FATHATAN, DAMMATAN, KASRATAN]);
const LONG: Record<string, string> = { a: "â", i: "î", u: "û" };

type Letter = { ch: string; shadda: boolean; sukun: boolean; vowel: string };

function prepare(word: string): string {
  return word
    .normalize("NFC")
    .replace(/\u0640/g, "") // tatweel
    .replace(/\u06E1/g, SUKUN) // Uthmani sukun
    .replace(/\u064E\u0622/g, "\u064E\u0627") // "لَآءِ": alef + lengthening sign, no hamza
    .replace(/\u0622|\u0623\u0653/g, "\u0621\u064E\u0627") // آ / أٓ = hamza + long a
    .replace(/\u0648\u0670/g, "\u0627") // "صَلَوٰة": the waw is only a seat for the long a
    .replace(/\u0649\u0670(?=[\u0621-\u064A])/g, "\u0627") // "ٱلتَّوۡرَىٰة"
    .replace(/\u0649\u0670/g, "\u0649") // ىٰ: the alef maqsura already carries the long a
    .replace(/\u0670\u0653?/g, "\u0627") // dagger alef → long a
    .replace(/\u0653/g, "")
    .replace(/\u06E5/g, "\u0648")
    .replace(/\u06E6|\u06E7/g, "\u064A")
    .replace(/[\u06D6-\u06ED]/g, "");
}

function parse(word: string): Letter[] {
  const out: Letter[] = [];
  for (const ch of Array.from(word)) {
    const last = out[out.length - 1];
    if (MARKS.has(ch)) {
      if (!last) continue;
      if (ch === SHADDA) last.shadda = true;
      else if (ch === SUKUN) last.sukun = true;
      else last.vowel = ch === FATHA ? "a" : ch === DAMMA ? "u" : ch === KASRA ? "i" : ch === FATHATAN ? "an" : ch === DAMMATAN ? "un" : "in";
    } else {
      out.push({ ch, shadda: false, sukun: false, vowel: "" });
    }
  }
  return out;
}

function translitWord(raw: string): string {
  const L = parse(raw);
  if (L.length === 0) return "";
  // Bare one-letter prefixes are listed without their vowel ("لـ").
  if (L.length === 1 && !L[0].vowel && L[0].ch === "ل") return "li";
  // The name of Allah keeps its usual spelling.
  if (/^[\u0627\u0671]\u0644\u0644\u064E?\u0651\u064E?\u0627?\u0647/.test(raw)) {
    const end = L[L.length - 1].vowel;
    return `Allâh${end ? end : ""}`;
  }

  let s = "";
  let i = 0;
  const endsWith = (v: string) => s.endsWith(v);
  const lengthen = () => { s = s.slice(0, -1) + LONG[s.slice(-1)]; };

  // Word-initial plain alef / alef wasla: the article "al-" or a linking vowel.
  if (L[0].ch === "ا" || L[0].ch === "ٱ") {
    const lam = L[1];
    const next = L[2];
    if (lam?.ch === "ل" && !lam.vowel && !lam.shadda && next) {
      if (next.shadda && CONSONANTS[next.ch]) {
        s += `a${CONSONANTS[next.ch]}-`; // sun letter: "ar-rahîm"
        next.shadda = false;
      } else {
        s += "al-";
      }
      i = 2;
    } else if (lam?.ch === "ل" && lam.shadda) {
      s += "a"; // "alladhî"
      i = 1;
    } else if (L[0].vowel) {
      s += L[0].vowel;
      i = 1;
    } else {
      s += "i"; // linking alef of verbs: "istatâ‘a"
      i = 1;
    }
  }

  for (; i < L.length; i++) {
    const l = L[i];
    const first = s === "" || s.endsWith("-");
    const last = i === L.length - 1;
    const bare = !l.vowel && !l.shadda;

    if (l.ch === "ا") {
      if (endsWith("a")) lengthen();
      else if (endsWith("an") || endsWith("û") || endsWith("aw")) continue; // tanwin seat / silent alef after waw
      else if (!endsWith("â")) s += "â";
      continue;
    }
    if (l.ch === "ى") {
      if (endsWith("a")) lengthen();
      else if (endsWith("an")) continue;
      else if (!endsWith("â")) s += l.vowel ? `y${l.vowel}` : "â";
      continue;
    }
    if (l.ch === "ة") {
      if (l.vowel && !last) s += `t${l.vowel}`;
      else if (l.vowel.length === 2) s += `t${l.vowel}`; // tanwin is pronounced
      else if (!endsWith("a") && !endsWith("â")) s += "a";
      continue;
    }
    if (l.ch === "و" && bare) {
      if (endsWith("u")) { lengthen(); continue; }
      if (endsWith("a") && (l.sukun || last || !L[i + 1]?.vowel)) { s += "w"; continue; }
    }
    if (l.ch === "ي" && bare) {
      if (endsWith("i")) { lengthen(); continue; }
      if (endsWith("a") && (l.sukun || last || !L[i + 1]?.vowel)) { s += "y"; continue; }
    }
    // Hamza opening a word is not written: "’amr" reads "amr".
    if (first && (l.ch === "أ" || l.ch === "إ" || l.ch === "ء")) {
      s += l.vowel || (l.ch === "إ" ? "i" : "a");
      continue;
    }
    const c = CONSONANTS[l.ch];
    if (c === undefined) { s += l.ch; continue; }
    s += (l.shadda ? c + c : c) + l.vowel;
  }
  // "nabiyy" / "‘aduww" read more naturally as "nabî" / "‘adû".
  return s.replace(/iyy$/, "î").replace(/uww$/, "û");
}

const cache = new Map<string, string>();

/** Pieces of words the rules cannot read on their own: the attached "my" and the article. */
const FIXED: Record<string, string> = {
  ["\u0640\u0650\u064A"]: "\u00EE", // -i (my)
  ["\u0671\u0644\u06E1"]: "al", // al- (the)
};

/** "ٱلرَّحِيم" → "ar-rahîm". Returns "" when there is nothing to read. */
export function transliterate(arabic: string | null | undefined): string {
  if (!arabic) return "";
  const hit = cache.get(arabic);
  if (hit !== undefined) return hit;
  const fixed = FIXED[arabic.normalize("NFC").trim()];
  if (fixed) return fixed;
  const out = prepare(arabic)
    .split(/\s+/)
    .map((w) => (/^[.…،]+$/.test(w) ? "…" : translitWord(w)))
    .filter(Boolean)
    .join(" ");
  cache.set(arabic, out);
  return out;
}
