import Foundation
import UserNotifications

/// Local notifications to bring users back into the app (daily streak reminder).
/// No server / push infra required — everything is scheduled on-device.
@MainActor
final class NotificationManager: ObservableObject {
    static let shared = NotificationManager()

    private let enabledKey = "dailyRemindersEnabled"
    private let dailyId = "quranlab.daily.reminder"

    /// User-facing toggle (Réglages). Defaults to ON.
    @Published var enabled: Bool {
        didSet { UserDefaults.standard.set(enabled, forKey: enabledKey) }
    }
    /// System authorization status (so the UI can prompt correctly).
    @Published var authorized = false

    private init() {
        if UserDefaults.standard.object(forKey: enabledKey) == nil {
            enabled = true                       // opt-in by default
        } else {
            enabled = UserDefaults.standard.bool(forKey: enabledKey)
        }
    }

    /// Rotating, motivating copy (FR). One is picked at random each fire via
    /// several scheduled requests is overkill, so we vary the body per launch.
    private var reminderBodies: [String] {
        [
            "Ta série t'attend 🔥 Fais ta leçon du jour pour la garder.",
            "5 minutes aujourd'hui, et tu apprends de nouveaux mots du Coran 📖",
            "N'oublie pas ta révision du jour sur Quranlab ✨",
            "Garde ta série en vie 🔥 Une petite leçon suffit !",
            "Reviens entretenir ta mémoire — barakAllahu fik 🌙",
        ]
    }

    /// Call on app launch: sync authorization and (re)schedule if enabled.
    func refreshOnLaunch() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        authorized = settings.authorizationStatus == .authorized
            || settings.authorizationStatus == .provisional
        if enabled && authorized {
            scheduleDaily()
        }
    }

    /// Toggle handler from Réglages. Requests permission the first time.
    func setEnabled(_ on: Bool) async {
        enabled = on
        if on {
            let granted = await requestAuthorizationIfNeeded()
            authorized = granted
            if granted {
                scheduleDaily()
            } else {
                // Permission denied — reflect reality so the toggle doesn't lie.
                enabled = false
            }
        } else {
            cancelDaily()
        }
    }

    private func requestAuthorizationIfNeeded() async -> Bool {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        switch settings.authorizationStatus {
        case .authorized, .provisional:
            return true
        case .notDetermined:
            return (try? await center.requestAuthorization(options: [.alert, .sound, .badge])) ?? false
        default:
            return false   // denied — user must enable in iOS Settings
        }
    }

    /// One repeating daily reminder at 19:00 local time.
    private func scheduleDaily() {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [dailyId])

        let content = UNMutableNotificationContent()
        content.title = "Quranlab"
        content.body = reminderBodies.randomElement() ?? "Reviens faire ta leçon du jour !"
        content.sound = .default

        var date = DateComponents()
        date.hour = 19
        date.minute = 0
        let trigger = UNCalendarNotificationTrigger(dateMatching: date, repeats: true)
        let req = UNNotificationRequest(identifier: dailyId, content: content, trigger: trigger)
        center.add(req)
    }

    private func cancelDaily() {
        UNUserNotificationCenter.current()
            .removePendingNotificationRequests(withIdentifiers: [dailyId])
    }
}
