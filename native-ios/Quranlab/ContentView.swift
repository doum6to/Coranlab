import SwiftUI

/// Phase 0 home screen — native SwiftUI, no external SDK yet, so the first
/// cloud build is guaranteed to compile. Uses the real brand palette (Theme)
/// so the very first TestFlight build is already on-brand.
struct ContentView: View {
    var body: some View {
        ZStack {
            Theme.iconBackground.ignoresSafeArea()

            VStack(spacing: 20) {
                Spacer()

                Image(systemName: "book.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 96, height: 96)
                    .foregroundColor(.white)

                Text("Quranlab")
                    .font(.system(size: 40, weight: .heavy, design: .rounded))
                    .foregroundColor(.white)

                Text("Comprendre le Coran, mot à mot")
                    .font(.headline)
                    .foregroundColor(.white.opacity(0.75))
                    .multilineTextAlignment(.center)

                Spacer()

                Text("Version native — aperçu (Phase 0)")
                    .font(.footnote)
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.bottom, 24)
            }
            .padding()
        }
    }
}

#Preview {
    ContentView()
}
