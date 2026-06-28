import SwiftUI
import UIKit

/// Login / sign-up — faithful to the web auth screen (Koji mascot, labelled
/// white inputs, brand button, forgot-password, social options).
struct AuthView: View {
    @EnvironmentObject var session: SessionStore

    enum Mode { case signIn, signUp }
    @State private var mode: Mode = .signIn
    var onBack: (() -> Void)? = nil

    init(mode: Mode = .signIn, onBack: (() -> Void)? = nil) {
        _mode = State(initialValue: mode)
        self.onBack = onBack
    }
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var busy = false
    @State private var info: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                Spacer(minLength: 60)
                MascotView(size: 200, riv: "eyes_down")
                Spacer(minLength: 28)

                Text(mode == .signIn ? "Bon retour !" : "Crée ton compte")
                    .font(.system(size: 26, weight: .bold)).foregroundColor(Theme.text).headingStyle()
                Text(mode == .signIn ? "Connecte-toi pour continuer à apprendre" : "Commence ton apprentissage du Coran")
                    .font(.system(size: 15)).foregroundColor(Theme.muted)
                    .multilineTextAlignment(.center)
                    .padding(.top, 6)

                VStack(alignment: .leading, spacing: 16) {
                    if mode == .signUp {
                        labelledField("Nom", text: $name, content: .name)
                    }
                    labelledField("E-mail", text: $email, keyboard: .emailAddress,
                                  content: .emailAddress, autocap: false)
                    labelledSecure("Mot de passe", text: $password)
                }
                .padding(.top, 28)

                if let err = session.errorMessage {
                    Text(err).font(.footnote).foregroundColor(Theme.wrongText)
                        .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 8)
                }
                if let info = info {
                    Text(info).font(.footnote).foregroundColor(Theme.green)
                        .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 8)
                }

                primaryButton.padding(.top, 18)

                if mode == .signIn {
                    Button { forgotPassword() } label: {
                        Text("Mot de passe oublié ?").font(.system(size: 14)).foregroundColor(Theme.muted)
                    }
                    .padding(.top, 14)
                }

                socialSection.padding(.top, 22)

                Button {
                    withAnimation { mode = (mode == .signIn ? .signUp : .signIn); session.errorMessage = nil; info = nil }
                } label: {
                    (Text(mode == .signIn ? "Pas encore de compte ? " : "Déjà un compte ? ")
                        .foregroundColor(Theme.muted)
                     + Text(mode == .signIn ? "S'inscrire" : "Se connecter")
                        .foregroundColor(Theme.green).bold())
                        .font(.system(size: 14))
                }
                .padding(.top, 18)

                Spacer(minLength: 24)
            }
            .padding(.horizontal, 28)
            .frame(maxWidth: 460)
            .frame(maxWidth: .infinity)
        }
        .background(Color.white.ignoresSafeArea())
        .overlay(alignment: .topLeading) {
            if let onBack = onBack {
                Button { onBack() } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(Theme.text).padding(16)
                }
            }
        }
    }

    // MARK: pieces
    private var primaryButton: some View {
        ShinyButton(title: mode == .signIn ? "Se connecter" : "S'inscrire",
                    variant: canSubmit && !busy ? .green : .gray,
                    disabled: !canSubmit || busy) { submit() }
    }

    private var socialSection: some View {
        VStack(spacing: 12) {
            HStack {
                Rectangle().fill(Theme.border).frame(height: 1)
                Text("ou").font(.system(size: 13)).foregroundColor(Theme.muted).padding(.horizontal, 10)
                Rectangle().fill(Theme.border).frame(height: 1)
            }
            socialButton("Continuer avec Apple", system: "apple.logo", dark: true) {
                Task { await session.signInWithApple() }
            }
            socialButton("Continuer avec Google", asset: "google_g", dark: false) {
                Task { await session.signInWithGoogle() }
            }
        }
    }

    private func socialButton(_ title: String, system: String? = nil, asset: String? = nil,
                              dark: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if let system = system { Image(systemName: system).font(.system(size: 17)) }
                if let asset = asset { Image(asset).resizable().scaledToFit().frame(width: 18, height: 18) }
                Text(title).font(.system(size: 15, weight: .semibold))
            }
            .foregroundColor(dark ? .white : Theme.text)
            .frame(maxWidth: .infinity).padding(.vertical, 13)
            .background(RoundedRectangle(cornerRadius: Theme.radius).fill(dark ? Theme.dark : Color.white))
            .overlay(RoundedRectangle(cornerRadius: Theme.radius).stroke(dark ? Color.clear : Theme.cardBorder, lineWidth: 2))
        }
    }

    // MARK: logic
    private var canSubmit: Bool {
        !email.isEmpty && password.count >= 6 && (mode == .signIn || !name.isEmpty)
    }
    private func submit() {
        busy = true; info = nil
        let mail = email.trimmingCharacters(in: .whitespaces)
        let nm = name.trimmingCharacters(in: .whitespaces)
        Task {
            if mode == .signIn { _ = await session.signIn(email: mail, password: password) }
            else { _ = await session.signUp(name: nm, email: mail, password: password) }
            busy = false
        }
    }
    private func forgotPassword() {
        let mail = email.trimmingCharacters(in: .whitespaces)
        guard !mail.isEmpty else { session.errorMessage = "Entre ton e-mail d'abord."; return }
        Task {
            if await session.resetPassword(email: mail) {
                info = "E-mail de réinitialisation envoyé à \(mail)."
            }
        }
    }

    // MARK: fields
    @ViewBuilder
    private func labelledField(_ label: String, text: Binding<String>,
                               keyboard: UIKeyboardType = .default,
                               content: UITextContentType? = nil, autocap: Bool = true) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.system(size: 14, weight: .semibold)).foregroundColor(Theme.text)
            TextField("", text: text)
                .foregroundColor(Theme.text)
                .keyboardType(keyboard).textContentType(content).autocorrectionDisabled()
                .textInputAutocapitalization(autocap ? .sentences : .never)
                .padding(14)
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.white))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.cardBorder, lineWidth: 1.5))
        }
    }
    @ViewBuilder
    private func labelledSecure(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.system(size: 14, weight: .semibold)).foregroundColor(Theme.text)
            SecureField("", text: text).textContentType(.password)
                .foregroundColor(Theme.text)
                .padding(14)
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.white))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.cardBorder, lineWidth: 1.5))
        }
    }
}
