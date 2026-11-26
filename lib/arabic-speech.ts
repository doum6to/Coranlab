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
    // Words that everyday Arabic writes WITHOUT the alef although it is pronounced long
    // ("hadha", "dhalika", "ha'ula'i", "ula'ika", "lakin", "ilah", "ar-rahman"): speech models
    // know them in that spelling and read an added alef with an odd rhythm.
    .replace(/(^|[ ])\u0647\u064E?\u0670\u0653?(?=\u0630|\u0624)/g, "$1\u0647\u064E") // ha + dagger before dhal / hamza-on-waw
    .replace(/\u0630\u064E\u0670\u0644\u0650\u0643/g, "\u0630\u064E\u0644\u0650\u0643") // dhalika
    .replace(/\u0623\u064F\u0648\u0652?\u0644\u064E?\u0670\u0653?\u0626/g, "\u0623\u064F\u0648\u0644\u064E\u0626") // ula'ika
    .replace(/\u0644\u064E\u0670\u0643\u0650\u0646/g, "\u0644\u064E\u0643\u0650\u0646") // lakin
    .replace(/\u0625\u0650\u0644\u064E\u0670\u0647/g, "\u0625\u0650\u0644\u064E\u0647") // ilah
    .replace(/\u062D\u0652\u0645\u064E\u0670\u0646/g, "\u062D\u0652\u0645\u064E\u0646") // (ar-)rahman
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
