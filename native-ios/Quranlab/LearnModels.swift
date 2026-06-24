import Foundation

/// Decodes the /api/native/learn payload (same shape as the web's
/// getListsWithLevels).
struct LearnResponse: Codable {
    let isPro: Bool
    let units: [LearnUnit]
}

struct LearnUnit: Codable, Identifiable {
    let id: Int
    let title: String
    let description: String
    let order: Int
    let lists: [LearnList]
}

struct LearnList: Codable, Identifiable {
    let listId: Int
    let listTitle: String
    let completedLevels: Int
    let totalLevels: Int
    let activeLevelId: Int?
    let isPremiumLocked: Bool
    let levels: [LearnLevel]

    var id: Int { listId }

    var progress: Double {
        totalLevels > 0 ? Double(completedLevels) / Double(totalLevels) : 0
    }
    var isCompleted: Bool { totalLevels > 0 && completedLevels == totalLevels }
}

struct LearnLevel: Codable, Identifiable {
    let id: Int
    let title: String
    let levelOrder: Int
    let completed: Bool
    let challengeCount: Int
    let completedChallengeCount: Int
}
