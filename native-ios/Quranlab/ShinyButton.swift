import SwiftUI

// Faithful port of components/ui/shiny-button.tsx:
// a full-width, bold, rounded-2xl button with a 4px solid "lip" shadow that
// collapses when pressed (translate-y-[4px] + shadow:none), plus an animated
// diagonal shine sweep.

enum ShinyVariant { case green, dark, yellow, outlineGreen, gray }

struct ShinyButton: View {
    let title: String
    var variant: ShinyVariant = .green
    var disabled: Bool = false
    var action: () -> Void = {}

    @State private var pressed = false

    private var bg: Color {
        switch variant {
        case .green:        return Theme.green
        case .dark:         return Theme.dark
        case .yellow:       return Theme.shinyYellow
        case .outlineGreen: return Theme.selectionBg
        case .gray:         return Theme.shinyGray
        }
    }
    private var fg: Color {
        switch variant {
        case .green, .dark, .yellow: return .white
        case .outlineGreen:          return Theme.green
        case .gray:                  return Theme.muted
        }
    }
    private var lip: Color {
        switch variant {
        case .green:        return Theme.shinyGreenShadow
        case .dark:         return Theme.shinyDarkShadow
        case .yellow:       return Theme.shinyYellowShadow
        case .outlineGreen: return Theme.shinyOutlineShadow
        case .gray:         return Theme.shinyGrayShadow
        }
    }
    private var isInert: Bool { disabled || variant == .gray }

    var body: some View {
        let down = pressed && !isInert
        Text(title)
            .font(.system(size: 15, weight: .bold))
            .foregroundColor(fg)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                        .fill(bg)
                    if variant == .outlineGreen {
                        RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                            .stroke(Theme.green, lineWidth: 2)
                    }
                    // shine sweep — a single diagonal pass every few seconds
                    // (mirrors the web's spaced "shinySweep", not a constant loop)
                    if variant != .gray {
                        GeometryReader { geo in
                            TimelineView(.animation) { tl in
                                let period = 4.5
                                let t = tl.date.timeIntervalSinceReferenceDate
                                    .truncatingRemainder(dividingBy: period) / period
                                let sweepStart = 0.72
                                let p = t < sweepStart ? 0 : (t - sweepStart) / (1 - sweepStart)
                                let x = (-1.3 + 2.6 * p) * geo.size.width
                                LinearGradient(
                                    colors: [.white.opacity(0), .white.opacity(0.35), .white.opacity(0)],
                                    startPoint: .top, endPoint: .bottom
                                )
                                .frame(width: geo.size.width * 0.5)
                                .rotationEffect(.degrees(18))
                                .offset(x: x)
                                .opacity(t < sweepStart ? 0 : 1)
                            }
                            .allowsHitTesting(false)
                        }
                        .clipShape(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous))
                    }
                }
            )
            .offset(y: down ? 4 : 0)
            .background( // the 3D lip, hidden while pressed
                RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                    .fill(lip)
                    .offset(y: down ? 0 : 4)
                    .opacity(down ? 0 : 1)
            )
            .opacity(disabled && variant != .gray ? 0.6 : 1)
            .contentShape(Rectangle())
            .onTapGesture { if !isInert { action() } }
            ._onPressGesture { p in if !isInert { withAnimation(.easeOut(duration: 0.1)) { pressed = p } } }
    }
}

// Small helper to capture press-down / press-up like web's :active state.
private extension View {
    func _onPressGesture(_ change: @escaping (Bool) -> Void) -> some View {
        simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in change(true) }
                .onEnded { _ in change(false) }
        )
    }
}
