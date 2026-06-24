import SwiftUI

/// Placeholder home shown once authenticated. Phase 2 replaces this with the
/// real "Apprendre" screen (units / lists / levels from Supabase).
struct HomeView: View {
    @EnvironmentObject var session: SessionStore

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 56))
                .foregroundColor(Theme.primary)
            Text("Connecté ✅")
                .font(.title2.bold())
                .foregroundColor(Theme.text)
            if let email = session.email {
                Text(email).foregroundColor(Theme.muted)
            }
            Text("L'écran « Apprendre » arrive en Phase 2.")
                .font(.footnote)
                .foregroundColor(Theme.muted)
                .multilineTextAlignment(.center)
            Spacer()
            Button {
                Task { await session.signOut() }
            } label: {
                Text("Se déconnecter")
                    .fontWeight(.semibold)
                    .foregroundColor(Theme.primary)
            }
            .padding(.bottom, 24)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.white.ignoresSafeArea())
    }
}
