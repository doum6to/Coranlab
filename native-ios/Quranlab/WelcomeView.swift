import SwiftUI

/// Shown right after onboarding (for signed-out users): the choice between
/// creating an account or signing in, before the auth form.
struct WelcomeView: View {
    var onSignUp: () -> Void
    var onSignIn: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 40)
            MascotView(size: 200, riv: "eyes_down")
            Spacer().frame(height: 26)
            Text("Bienvenue sur Quranlab")
                .font(.system(size: 26, weight: .bold)).foregroundColor(Theme.text).headingStyle()
                .multilineTextAlignment(.center)
            Text("Comprends le Coran, mot après mot.")
                .font(.system(size: 15)).foregroundColor(Theme.muted)
                .multilineTextAlignment(.center).padding(.top, 6)
            Spacer()
            VStack(spacing: 14) {
                ShinyButton(title: "Créer un compte", variant: .green) { onSignUp() }
                Button { onSignIn() } label: {
                    (Text("J'ai déjà un compte ? ").foregroundColor(Theme.muted)
                     + Text("Se connecter").foregroundColor(Theme.green).bold())
                        .font(.system(size: 15))
                }
            }
            .padding(.horizontal, 28)
            Spacer().frame(height: 44)
        }
        .frame(maxWidth: 460).frame(maxWidth: .infinity)
        .background(Color.white.ignoresSafeArea())
    }
}
