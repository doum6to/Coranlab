import Foundation

/// Rule-based transliteration for FULLY-VOCALIZED Arabic (the lesson words carry
/// harakat), which lets us read the short/long vowels for a much more accurate
/// Latin hint. Approximate but readable (e.g. ٱلَّذِينَ → "alladhīna").
enum Transliteration {
    // consonants
    private static let cons: [Character: String] = [
        "ء": "ʾ", "أ": "ʾ", "إ": "ʾ", "آ": "ʾā", "ؤ": "ʾ", "ئ": "ʾ", "ٱ": "",
        "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "ḥ", "خ": "kh",
        "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh",
        "ص": "ṣ", "ض": "ḍ", "ط": "ṭ", "ظ": "ẓ", "ع": "ʿ", "غ": "gh",
        "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
        "ه": "h", "ة": "h", "و": "w", "ي": "y", "ى": "ā",
    ]
    private static let fatha: Character = "\u{064E}"
    private static let damma: Character = "\u{064F}"
    private static let kasra: Character = "\u{0650}"
    private static let sukun: Character = "\u{0652}"
    private static let shadda: Character = "\u{0651}"
    private static let daggerAlif: Character = "\u{0670}"
    private static let sun: Set<Character> = ["ت","ث","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ل","ن"]

    static func ar(_ text: String) -> String {
        var result: [String] = []
        for word in text.split(separator: " ", omittingEmptySubsequences: true) {
            // decompose into scalars so harakat (combining marks) are read separately
            let scalars = word.unicodeScalars.map { Character($0) }
            result.append(word2(scalars))
        }
        return result.joined(separator: " ")
    }

    private static func word2(_ chars: [Character]) -> String {
        var out = ""
        var i = 0
        // definite article (ال / ٱل)
        if chars.count >= 2, (chars[0] == "ا" || chars[0] == "ٱ" || chars[0] == "أ"), chars[1] == "ل" {
            let after = chars.count > 2 ? chars[2] : nil
            if let s = after, sun.contains(s) {
                out += "a" + (cons[s] ?? "")   // sun letter: assimilate the "l"
                i = 2
            } else {
                out += "al-"
                i = 2
            }
        }
        var lastVowel: Character? = nil
        while i < chars.count {
            let c = chars[i]
            if c == "\u{0640}" { i += 1; continue }              // tatweel
            // long vowels (no own haraka) → elongate previous short vowel
            if c == "ا" {
                if lastVowel == fatha || lastVowel == nil { out += out.hasSuffix("a") ? "" : "ā" }
                else { out += "ā" }
                lastVowel = nil; i += 1; continue
            }
            if (c == "و" || c == "ي"), i + 1 < chars.count, !isHaraka(chars[i+1]) || chars[i+1] == sukun {
                // treat as long vowel only when it follows the matching short vowel
                if c == "و", lastVowel == damma { out += out.hasSuffix("u") ? "" : "ū"; lastVowel = nil; i += 1; continue }
                if c == "ي", lastVowel == kasra { out += out.hasSuffix("i") ? "" : "ī"; lastVowel = nil; i += 1; continue }
            }
            guard let base = cons[c] else {
                // standalone haraka / dagger alif
                if c == daggerAlif { out += "ā" }
                else if let v = shortVowel(c) { out += v; lastVowel = c }
                i += 1; continue
            }
            var emit = base
            var j = i + 1
            if j < chars.count, chars[j] == shadda { emit += base; j += 1 }   // gemination
            out += emit
            // following vowel
            if j < chars.count {
                let n = chars[j]
                if let v = shortVowel(n) { out += v; lastVowel = n; j += 1 }
                else if n == sukun { lastVowel = nil; j += 1 }
                else if n == daggerAlif { out += "ā"; lastVowel = nil; j += 1 }
                else { lastVowel = nil }
            } else { lastVowel = nil }
            i = j
        }
        return out
    }

    private static func shortVowel(_ c: Character) -> String? {
        switch c {
        case "\u{064E}": return "a"
        case "\u{064F}": return "u"
        case "\u{0650}": return "i"
        case "\u{064B}": return "an"
        case "\u{064C}": return "un"
        case "\u{064D}": return "in"
        default: return nil
        }
    }
    private static func isHaraka(_ c: Character) -> Bool {
        return shortVowel(c) != nil || c == sukun || c == shadda || c == daggerAlif
    }
}
