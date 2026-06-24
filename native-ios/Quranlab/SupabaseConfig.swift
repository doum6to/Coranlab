import Foundation

/// Supabase + backend configuration.
///
/// The URL and anon key are PUBLIC values (the anon key is designed to be shipped
/// in client apps; access is protected by Row Level Security). They are the same
/// as the web app's NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
///
/// TODO(setup): replace the two REPLACE_ME placeholders with the real values
/// from Supabase Dashboard → Project Settings → API. The app compiles and the
/// build stays green with the placeholders; login simply stays inactive until
/// they're filled (the auth screen shows a notice via `isConfigured`).
enum SupabaseConfig {
    static let url = URL(string: "https://REPLACE_ME.supabase.co")!
    static let anonKey = "REPLACE_ME"

    /// Web backend — reused for sign-up so we get the SAME behaviour as the web
    /// (auto-confirmed account, signup country, purchase linking).
    static let apiBaseURL = URL(string: "https://www.quranlab.app")!

    static var isConfigured: Bool {
        !url.absoluteString.contains("REPLACE_ME") && anonKey != "REPLACE_ME"
    }
}
