/**
 * Turns a word written in Qur'anic (Uthmani) script into plain vocalised
 * Arabic that a text-to-speech voice reads correctly. Uthmani uses special
 * signs (alef wasla, dagger alef, its own sukun...) that speech models skip
 * or mispronounce. Code points are written as escapes on purpose: combining
 * marks are unreadable (and easy to break) inside a regex.
 */
export function toSpeechArabic(word: string): string {
  return word
    .normalize("NFC")
    .replace(/[.]{2,}|\u2026/g, "\u060C") // "in ... illa": short pause (Arabic comma)
    .replace(/\u0640/g, "") // tatweel (prefix forms such as "bi-", "li-")
    .replace(/\u0671/g, "\u0627") // alef wasla: alef
    .replace(/\u064E\u0622/g, "\u064E\u0627") // fatha + alef-madda: a lengthening sign, not a hamza
    .replace(/\u06E1/g, "\u0652") // Uthmani sukun: sukun
    .replace(/\u0648\u0670/g, "\u0627") // "salat": the waw is only a seat for the long a
    .replace(/\u0649\u0670/g, "\u0649") // alef maqsura + dagger alef: the maqsura already carries the long a,
    .replace(/\u0649(?=[\u0621-\u064A])/g, "\u0627") // and inside a word ("at-tawrat") it is a plain alef
    .replace(/\u0670\u0653?/g, "\u0627") // dagger alef (+ madda): long alef
    .replace(/\u0623\u0653/g, "\u0622") // hamza + madda: alef-madda
    .replace(/\u0653/g, "") // remaining madda signs
    .replace(/\u0623\u064F\u0648\u0652\u0644/g, "\u0623\u064F\u0648\u0644") // "ula'ika": the waw is silent
    .replace(/\u06E5/g, "\u0648") // small waw: waw
    .replace(/\u06E6|\u06E7/g, "\u064A") // small yeh: yeh
    .replace(/[\u06D6-\u06ED]/g, "") // other Qur'anic annotation marks
    .replace(/[ ]+/g, " ")
    .trim();
}
