import Foundation

struct LessonResponse: Codable {
    let lessonId: Int
    let challenges: [NativeChallenge]
}

struct NativeChallenge: Codable, Identifiable {
    let id: Int
    let type: String
    let question: String
    let order: Int
    let arabicWord: String?
    let frenchTranslation: String?
    let options: [NativeOption]

    /// Types we render as a tap-to-pick multiple-choice question. Other types
    /// (flashcard, matching, anagram, drag-drop) get a simplified card for now
    /// and dedicated UIs in a later pass.
    private static let mcTypes: Set<String> = [
        "QCM", "QCM_INVERSE", "VRAI_FAUX", "OPPOSITE", "CONFIDENCE_BET", "SPOT_THE_ERROR",
    ]

    var isMultipleChoice: Bool {
        Self.mcTypes.contains(type) && options.count >= 2 && options.contains { $0.correct }
    }
}

struct NativeOption: Codable, Identifiable {
    let id: Int
    let text: String
    let correct: Bool
    let imageSrc: String?
    let audioSrc: String?
    let arabicText: String?
    let frenchText: String?
    let pairIndex: Int?

    var label: String {
        if let t = text as String?, !t.isEmpty { return t }
        if let a = arabicText, !a.isEmpty { return a }
        if let f = frenchText, !f.isEmpty { return f }
        return ""
    }
}
