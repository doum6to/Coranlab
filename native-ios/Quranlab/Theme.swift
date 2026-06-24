import SwiftUI

/// Design tokens mirrored from the web app (tailwind.config.ts) so the native
/// UI stays faithful to the existing brand, while we render it with native
/// SwiftUI components and Apple conventions.
extension Color {
    init(hex: UInt) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: 1
        )
    }
}

enum Theme {
    // Brand — "brilliant" palette from the web app.
    static let primary = Color(hex: 0x6967FB)        // main brand (indigo/violet)
    static let iconBackground = Color(hex: 0x2D1F4F) // app icon bg / splash
    static let text = Color(hex: 0x1A1A1A)
    static let muted = Color(hex: 0x999999)
    static let surface = Color(hex: 0xF5F5F5)
    static let border = Color(hex: 0xE8E8E8)
    static let successBg = Color(hex: 0xE8F8E8)
    static let blue = Color(hex: 0x5B8DEE)
    static let yellow = Color(hex: 0xF5C842)
    static let orange = Color(hex: 0xF5923A)
    static let dark = Color(hex: 0x1E1E1E)

    /// Premium gradient used on the web paywall / nudges.
    static let brandGradient = LinearGradient(
        colors: [
            Color(hex: 0xF7C325),
            Color(hex: 0xE350E3),
            Color(hex: 0x874DE5),
            Color(hex: 0x456DFF),
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
