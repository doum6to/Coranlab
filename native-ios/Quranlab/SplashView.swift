import SwiftUI

/// Branded loading screen shown while the session is being restored.
struct SplashView: View {
    var body: some View {
        ZStack {
            Theme.iconBackground.ignoresSafeArea()
            VStack(spacing: 16) {
                Image(systemName: "book.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .foregroundColor(.white)
                Text("Quranlab")
                    .font(.system(size: 34, weight: .heavy, design: .rounded))
                    .foregroundColor(.white)
                ProgressView()
                    .tint(.white)
                    .padding(.top, 4)
            }
        }
    }
}
