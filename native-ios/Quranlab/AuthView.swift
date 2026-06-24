import SwiftUI

/// Login / sign-up screen — faithful to the web brand (white background, brand
/// indigo primary, rounded inputs), with native iOS conventions.
struct AuthView: View {
    @EnvironmentObject var session: SessionStore

    enum Mode { case signIn, signUp }
    @State private var mode: Mode = .signIn
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var busy = false

    var body: some View {
        ScrollView {
            VStack(spacing: 22) {
                header

                VStack(spacing: 14) {
                    if mode == .signUp {
                        textField("Nom", text: $name, content: .name)
                    }
                    textField(
                        "Email", text: $email,
                        keyboard: .emailAddress, content: .emailAddress, autocap: false
                    )
                    secureField("Mot de passe", text: $password)
                }

                if let err = session.errorMessage {
                    Text(err)
                        .font(.footnote)
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                primaryButton
                toggleButton

                if !SupabaseConfig.isConfigured {
                    Text("⚠️ Configuration Supabase manquante (URL + clé anon). La connexion sera active dès qu'elle est renseignée.")
                        .font(.caption)
                        .foregroundColor(Theme.orange)
                        .multilineTextAlignment(.center)
                }

                Spacer(minLength: 0)
            }
            .padding(24)
        }
        .background(Color.white.ignoresSafeArea())
    }

    // MARK: - Pieces

    private var header: some View {
        VStack(spacing: 8) {
            Image(systemName: "book.fill")
                .font(.system(size: 48))
                .foregroundColor(Theme.primary)
            Text("Quranlab")
                .font(.system(size: 32, weight: .heavy, design: .rounded))
                .foregroundColor(Theme.text)
            Text(mode == .signIn ? "Content de te revoir" : "Crée ton compte")
                .font(.subheadline)
                .foregroundColor(Theme.muted)
        }
        .padding(.top, 48)
    }

    private var primaryButton: some View {
        Button(action: submit) {
            HStack(spacing: 8) {
                if busy { ProgressView().tint(.white) }
                Text(mode == .signIn ? "Se connecter" : "S'inscrire")
                    .fontWeight(.bold)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Theme.primary)
            .foregroundColor(.white)
            .cornerRadius(14)
        }
        .disabled(busy || !canSubmit)
        .opacity(busy || !canSubmit ? 0.6 : 1)
    }

    private var toggleButton: some View {
        Button {
            withAnimation {
                mode = (mode == .signIn) ? .signUp : .signIn
                session.errorMessage = nil
            }
        } label: {
            Text(mode == .signIn ? "Pas de compte ? Inscris-toi" : "Déjà un compte ? Connexion")
                .font(.subheadline)
                .foregroundColor(Theme.primary)
        }
    }

    // MARK: - Logic

    private var canSubmit: Bool {
        !email.isEmpty && password.count >= 6 && (mode == .signIn || !name.isEmpty)
    }

    private func submit() {
        busy = true
        let mail = email.trimmingCharacters(in: .whitespaces)
        let nm = name.trimmingCharacters(in: .whitespaces)
        Task {
            if mode == .signIn {
                _ = await session.signIn(email: mail, password: password)
            } else {
                _ = await session.signUp(name: nm, email: mail, password: password)
            }
            busy = false
        }
    }

    // MARK: - Field helpers

    @ViewBuilder
    private func textField(
        _ placeholder: String,
        text: Binding<String>,
        keyboard: UIKeyboardType = .default,
        content: UITextContentType? = nil,
        autocap: Bool = true
    ) -> some View {
        TextField(placeholder, text: text)
            .keyboardType(keyboard)
            .textContentType(content)
            .autocorrectionDisabled()
            .textInputAutocapitalization(autocap ? .sentences : .never)
            .padding(14)
            .background(Theme.surface)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.border, lineWidth: 1))
            .cornerRadius(12)
    }

    @ViewBuilder
    private func secureField(_ placeholder: String, text: Binding<String>) -> some View {
        SecureField(placeholder, text: text)
            .textContentType(.password)
            .padding(14)
            .background(Theme.surface)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.border, lineWidth: 1))
            .cornerRadius(12)
    }
}
