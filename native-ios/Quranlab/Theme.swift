import SwiftUI

// Design tokens mirrored 1:1 from the web app (tailwind.config.ts + globals.css)
// so the native UI is faithful to the existing brand, rendered with native
// SwiftUI. Hex values are copied verbatim from the source of truth.

extension Color {
    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }
}

enum Theme {
    // MARK: - "brilliant" palette (tailwind.config.ts)
    static let green   = Color(hex: 0x6967FB) // brand / primary action (indigo-violet)
    static let primary = Color(hex: 0x6967FB)
    static let dark    = Color(hex: 0x1E1E1E)
    static let surface = Color(hex: 0xF5F5F5)
    static let border  = Color(hex: 0xE8E8E8)
    static let text    = Color(hex: 0x1A1A1A)
    static let muted   = Color(hex: 0x999999)
    static let success = Color(hex: 0xE8F8E8)
    static let blue    = Color(hex: 0x5B8DEE)
    static let yellow  = Color(hex: 0xF5C842)
    static let orange  = Color(hex: 0xF5923A)

    // MARK: - Card / control tokens (list-card.tsx, shiny-button.tsx)
    static let cardBorder     = Color(hex: 0xE0E0E0) // border-[#E0E0E0]
    static let cardShadow     = Color(hex: 0xD4D4D4) // box-shadow 0 4px 0 0 #D4D4D4
    static let selectionBg    = Color(hex: 0xF0F0FF) // selected option bg
    static let iconBackground = Color(hex: 0x2D1F4F)

    // Exercise option states
    static let optionBorder  = Color(hex: 0xE0E0E0)
    static let optionShadow  = Color(hex: 0xD4D4D4)
    static let correctBorder = Color(hex: 0x6967FB)
    static let correctBg     = Color(hex: 0xE8F8E8)
    static let wrongBorder   = Color(hex: 0xF87171) // red-400
    static let wrongBg       = Color(hex: 0xFEE2E2) // red-50
    static let wrongText     = Color(hex: 0xDC2626) // red-600

    // ShinyButton shadow colors (the 3D "lip")
    static let shinyGreenShadow   = Color(hex: 0x4A48D4)
    static let shinyDarkShadow    = Color(hex: 0x0A0A0A)
    static let shinyYellow        = Color(hex: 0xEAB308)
    static let shinyYellowShadow  = Color(hex: 0xCA8A04)
    static let shinyOutlineShadow = Color(hex: 0xC8C7F0)
    static let shinyGray          = Color(hex: 0xD4D4D4)
    static let shinyGrayShadow    = Color(hex: 0xABABAB)

    // MARK: - Radii (--radius: 1rem)
    static let radius: CGFloat   = 16
    static let radiusMd: CGFloat = 14
    static let radiusSm: CGFloat = 12

    // MARK: - Premium gradient (sidebar.tsx)
    static let premiumGradient = LinearGradient(
        colors: [
            Color(hex: 0x050C38), Color(hex: 0x6700A3),
            Color(hex: 0xE02F75), Color(hex: 0xFF5A57), Color(hex: 0x050C38),
        ],
        startPoint: .leading, endPoint: .trailing
    )
}

extension View {
    /// Mimics the web heading style: tight letter-spacing.
    func headingStyle() -> some View { self.kerning(-0.5) }
}
