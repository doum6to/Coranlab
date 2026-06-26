import SwiftUI

// Faithful port of app/(main)/learn/list-card.tsx.
// A 220–240pt card: white bg, 2px #E0E0E0 border, rounded-2xl, a solid 4px
// drop "lip" (#D4D4D4), centered title, level + progress bar, square
// illustration (multiply blend ≈ mix-blend-darken), and a ShinyButton CTA.

struct ListCard: View {
    let list: LearnList
    let isCurrent: Bool
    var lecons: Bool = false
    var onTap: () -> Void = {}

    private var percentage: Double {
        list.totalLevels > 0 ? Double(list.completedLevels) / Double(list.totalLevels) : 0
    }
    private var locked: Bool { false } // lists aren't sequentially locked in web
    private var premium: Bool { list.isPremiumLocked }

    private var buttonTitle: String {
        if premium { return "Premium" }
        if lecons { return "Réviser" }
        if locked { return "Verrouillé" }
        if list.isCompleted { return "Réviser" }
        return list.completedLevels > 0 ? "Continuer" : "Commencer"
    }
    private var buttonVariant: ShinyVariant {
        if premium { return .dark }
        if locked { return .gray }
        if lecons { return .green }
        return list.isCompleted ? .outlineGreen : .green
    }

    var body: some View {
        VStack(spacing: 0) {
            if premium {
                HStack(spacing: 6) {
                    Image(systemName: "lock.fill").font(.system(size: 11, weight: .bold))
                    Text("Premium").font(.system(size: 11, weight: .bold))
                }
                .foregroundColor(Theme.text)
                .padding(.bottom, 8)
            }

            // Title
            Text(list.listTitle)
                .font(.system(size: 14, weight: .bold))
                .multilineTextAlignment(.center)
                .lineSpacing(1)
                .foregroundColor(premium ? Theme.muted : Theme.text)
                .padding(.bottom, 8)
                .headingStyle()

            // Level status + progress bar (hidden in Leçons/review mode)
            if !premium && !lecons {
                VStack(spacing: 8) {
                    Text(list.isCompleted ? "TERMINÉ" : "NIVEAU \(list.completedLevels + 1)")
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(0.5)
                        .foregroundColor(Theme.green)
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Theme.border)
                            Capsule().fill(Theme.green)
                                .frame(width: max(0, geo.size.width * percentage))
                        }
                    }
                    .frame(height: 5)
                }
                .padding(.bottom, 12)
            }

            // Illustration (square)
            ZStack {
                Image(ListImages.asset(for: list.listTitle))
                    .resizable()
                    .scaledToFill()
                    .blendMode(.multiply)
                    .saturation(premium ? 0 : 1)
                    .opacity(premium ? 0.5 : 1)
            }
            .frame(maxWidth: .infinity)
            .aspectRatio(1, contentMode: .fit)
            .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm, style: .continuous))
            .overlay {
                if premium {
                    ZStack {
                        Color.black.opacity(0.10)
                        Image(systemName: "lock.fill")
                            .font(.system(size: 32))
                            .foregroundColor(.gray)
                    }
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusSm, style: .continuous))
                }
            }
            .padding(.bottom, 16)

            ShinyButton(title: buttonTitle, variant: buttonVariant, action: onTap)
        }
        .padding(premium ? 16 : 18)
        .frame(width: 230)
        .background(
            RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .fill(Color.white)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .stroke(Theme.cardBorder, lineWidth: 2)
        )
        .background( // solid 4px lip (0 4px 0 0 #D4D4D4)
            RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .fill(Theme.cardShadow)
                .offset(y: 4)
        )
        .opacity(premium ? 0.85 : 1)
        .contentShape(Rectangle())
        .onTapGesture(perform: onTap)
    }
}
