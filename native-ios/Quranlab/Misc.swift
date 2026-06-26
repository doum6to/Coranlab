import SwiftUI

// MARK: - Flash-recall memorize phase (flash-recall.tsx)
// Shows the Arabic word for ~2s with a shrinking bar, then reveals the options.
struct FlashRecallMemorize: View {
    let arabic: String
    var onReveal: () -> Void
    @State private var width: CGFloat = 1
    @State private var faded = false

    var body: some View {
        VStack(spacing: 20) {
            Text(arabic)
                .font(.system(size: 48, weight: .bold, design: .serif))
                .environment(\.layoutDirection, .rightToLeft)
                .foregroundColor(Theme.text)
                .opacity(faded ? 0 : 1)
                .scaleEffect(faded ? 0.95 : 1)
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Theme.border)
                    Capsule().fill(Theme.green).frame(width: g.size.width * width)
                }
            }
            .frame(width: 160, height: 6)
            Text("Mémorise…").font(.system(size: 13, weight: .semibold)).foregroundColor(Theme.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .onAppear {
            withAnimation(.linear(duration: 2)) { width = 0 }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
                withAnimation(.easeOut(duration: 0.2)) { faded = true }
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { onReveal() }
        }
    }
}

// MARK: - Mascot
// Static SVG mascot with a gentle breathing float (mimics mascot_breath.riv).
// To upgrade to the real Rive animation: add the `rive-ios` SPM package
// (product "RiveRuntime") and swap the Image for RiveViewModel(...).view().
struct MascotView: View {
    var size: CGFloat = 120
    /// Name of a bundled .riv file (default: idle "breathing" Koji).
    var riv: String = "mascot_breath"
    var body: some View {
        RiveMascot(riv)
            .frame(width: size, height: size)
    }
}

/// Real loading indicator using the bundled loading.riv (Koji loader).
struct LoadingView: View {
    var size: CGFloat = 96
    var body: some View {
        RiveMascot("loading").frame(width: size, height: size)
    }
}
