import Foundation

/// Lightweight Arabic → Latin transliteration for a small readable hint under
/// Arabic words. Approximate (letter + harakat mapping), not scholarly.
enum Transliteration {
    private static let map: [Character: String] = [
        // letters
        "ا": "a", "أ": "a", "إ": "i", "آ": "aa", "ٱ": "a",
        "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h", "خ": "kh",
        "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh",
        "ص": "s", "ض": "d", "ط": "t", "ظ": "z", "ع": "ʿ", "غ": "gh",
        "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
        "ه": "h", "و": "w", "ي": "y", "ة": "a", "ى": "a",
        "ء": "ʾ", "ئ": "ʾ", "ؤ": "ʾ",
        // harakat / tanwin / marks
        "\u{064E}": "a", "\u{064F}": "u", "\u{0650}": "i",
        "\u{064B}": "an", "\u{064C}": "un", "\u{064D}": "in",
        "\u{0652}": "", "\u{0651}": "", "\u{0670}": "a", "\u{0640}": "",
    ]

    static func ar(_ text: String) -> String {
        var out = ""
        for ch in text {
            if ch == " " { out += " " }
            else if let r = map[ch] { out += r }
            // unknown marks are skipped
        }
        // tidy: collapse stray spaces
        return out.trimmingCharacters(in: .whitespaces)
    }
}
