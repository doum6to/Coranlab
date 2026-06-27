import Foundation
import Supabase
import RevenueCat
import AuthenticationServices
import UIKit

/// Holds the Supabase session and exposes auth actions to the UI.
///
/// - Sign in: native Supabase (email/password) → real session, persisted by the
///   SDK across launches.
/// - Sign up: goes through the web backend `/api/auth/signup` (auto-confirms the
///   account, records signup country, links pending purchases — identical to the
///   web), then signs in to obtain a session.
@MainActor
final class SessionStore: ObservableObject {
    @Published var isLoading = true
    @Published var isAuthenticated = false
    @Published var email: String?
    @Published var userId: String?
    @Published var errorMessage: String?

    let client = SupabaseClient(
        supabaseURL: SupabaseConfig.url,
        supabaseKey: SupabaseConfig.anonKey
    )

    /// Restore any existing session on launch.
    func bootstrap() async {
        await refresh()
        isLoading = false
    }

    func refresh() async {
        if let session = try? await client.auth.session {
            email = session.user.email
            // Lowercased to match the Supabase user id stored server-side, so
            // RevenueCat's appUserID lines up with our DB / webhook.
            let uid = session.user.id.uuidString.lowercased()
            userId = uid
            isAuthenticated = true
            if Purchases.isConfigured {
                _ = try? await Purchases.shared.logIn(uid)
            }
        } else {
            email = nil
            userId = nil
            isAuthenticated = false
            if Purchases.isConfigured {
                _ = try? await Purchases.shared.logOut()
            }
        }
    }

    func signIn(email: String, password: String) async -> Bool {
        errorMessage = nil
        do {
            try await client.auth.signIn(email: email, password: password)
            await refresh()
            return isAuthenticated
        } catch {
            errorMessage = friendly(error)
            return false
        }
    }

    func signUp(name: String, email: String, password: String) async -> Bool {
        errorMessage = nil
        do {
            var req = URLRequest(
                url: SupabaseConfig.apiBaseURL.appendingPathComponent("api/auth/signup")
            )
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try JSONSerialization.data(
                withJSONObject: ["email": email, "password": password, "name": name]
            )

            let (data, resp) = try await URLSession.shared.data(for: req)
            if let http = resp as? HTTPURLResponse, !(200...299).contains(http.statusCode) {
                var msg = "Inscription impossible."
                if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let e = obj["error"] as? String {
                    msg = e
                }
                errorMessage = msg
                return false
            }
            // Account created → sign in to get a session.
            return await signIn(email: email, password: password)
        } catch {
            errorMessage = friendly(error)
            return false
        }
    }

    func signOut() async {
        try? await client.auth.signOut()
        await refresh()
    }

    /// Social sign-in entry points. Wiring requires the Apple/Google providers
    /// to be enabled in Supabase Auth (OAuth) — until then we surface a clear
    /// message instead of failing silently.
    func signInWithApple() async { await oauth(.apple) }
    func signInWithGoogle() async { await oauth(.google) }

    /// Browser-based OAuth via Supabase (no native entitlement required).
    /// Requires the matching provider to be enabled in Supabase Auth, with
    /// `app.quranlab.native://login-callback` added to the allowed redirect URLs.
    private func oauth(_ provider: Provider) async {
        errorMessage = nil
        do {
            try await client.auth.signInWithOAuth(
                provider: provider,
                redirectTo: URL(string: "app.quranlab.native://login-callback")
            ) { url in
                try await withCheckedThrowingContinuation { (cont: CheckedContinuation<URL, Error>) in
                    let webSession = ASWebAuthenticationSession(
                        url: url, callbackURLScheme: "app.quranlab.native"
                    ) { callbackURL, error in
                        if let callbackURL {
                            cont.resume(returning: callbackURL)
                        } else {
                            cont.resume(throwing: error ?? URLError(.userCancelledAuthentication))
                        }
                    }
                    webSession.presentationContextProvider = AuthPresentationAnchor.shared
                    webSession.prefersEphemeralWebBrowserSession = false
                    webSession.start()
                }
            }
            await refresh()
        } catch {
            // User cancelling the sheet should not show a scary error.
            let raw = error.localizedDescription.lowercased()
            if !raw.contains("cancel") { errorMessage = friendly(error) }
        }
    }

    /// Sends a password-reset email via Supabase.
    @discardableResult
    func resetPassword(email: String) async -> Bool {
        do {
            try await client.auth.resetPasswordForEmail(email)
            errorMessage = nil
            return true
        } catch {
            errorMessage = friendly(error)
            return false
        }
    }

    /// Current access token (JWT) for authenticating native API calls.
    func accessToken() async -> String? {
        try? await client.auth.session.accessToken
    }

    private func friendly(_ error: Error) -> String {
        let raw = error.localizedDescription.lowercased()
        if raw.contains("invalid") && raw.contains("credential") {
            return "Email ou mot de passe incorrect."
        }
        return error.localizedDescription
    }
}


/// Provides the key window as the presentation anchor for the OAuth web sheet.
final class AuthPresentationAnchor: NSObject, ASWebAuthenticationPresentationContextProviding {
    static let shared = AuthPresentationAnchor()
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()
    }
}
