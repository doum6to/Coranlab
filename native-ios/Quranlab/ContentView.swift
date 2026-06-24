import SwiftUI

/// Phase 0 home screen — native SwiftUI, no external SDK yet, so the first
/// cloud build is guaranteed to compile. Brand palette matches the web app
/// (deep violet background, green accent).
struct ContentView: View {
    private let bg = Color(red: 0x2D / 255, green: 0x1F / 255, blue: 0x4F / 255)
    private let green = Color(red: 0x58 / 255, green: 0xCC / 255, blue: 0x02 / 255)

    var body: some View {
        ZStack {
            bg.ignoresSafeArea()

            VStack(spacing: 20) {
                Spacer()

                Image(systemName: "book.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 96, height: 96)
                    .foregroundColor(green)

                Text("Quranlab")
                    .font(.system(size: 40, weight: .heavy, design: .rounded))
                    .foregroundColor(.white)

                Text("Comprendre le Coran, mot à mot")
                    .font(.headline)
                    .foregroundColor(.white.opacity(0.7))
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
