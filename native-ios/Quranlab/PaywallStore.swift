import Foundation
import RevenueCat

/// Loads RevenueCat offerings and handles purchase / restore.
///
/// Gracefully handles EMPTY offerings (no crash): until the Apple "Paid
/// Applications" agreement is signed, `offerings.current` has no packages — we
/// surface a clear message instead of failing.
@MainActor
final class PaywallStore: ObservableObject {
    struct Plan: Identifiable {
        let id: String          // RevenueCat package identifier ($rc_…)
        let title: String
        let priceString: String // per-month price for subs ("14,99 € / mois"), full price for lifetime
        let billingNote: String // "facturé tous les 3 mois" … ("" for lifetime)
        let trialNote: String   // "7 jours offerts" … ("" if none)
        let popular: Bool
        let package: Package
    }

    @Published var plans: [Plan] = []
    @Published var isLoading = true
    @Published var message: String?
    @Published var purchasing = false
    @Published var purchased = false

    private let entitlement = "premium"

    // Display order + labels, keyed by the standard RevenueCat package ids.
    private let specs: [(id: String, title: String, popular: Bool)] = [
        ("$rc_monthly", "Mensuel", false),
        ("$rc_three_month", "3 mois", false),
        ("$rc_annual", "Annuel", true),
        ("$rc_lifetime", "À vie", false),
    ]

    func load() async {
        isLoading = true
        message = nil
        defer { isLoading = false }

        guard Purchases.isConfigured else {
            message = "Achats indisponibles pour le moment."
            return
        }
        do {
            let offerings = try await Purchases.shared.offerings()
            let packages = offerings.current?.availablePackages ?? []
            guard !packages.isEmpty else {
                plans = []
                message = "Les offres ne sont pas encore disponibles. Reviens très bientôt, in shâ Allah."
                return
            }
            var built: [Plan] = []
            for spec in specs {
                guard let pkg = packages.first(where: { $0.identifier == spec.id }) else { continue }
                let sp = pkg.storeProduct
                var price = sp.localizedPriceString
                var note = ""
                if let period = sp.subscriptionPeriod {
                    if let perMonth = sp.pricePerMonth,
                       let fmt = sp.priceFormatter,
                       let s = fmt.string(from: perMonth) {
                        price = "\(s) / mois"
                    }
                    switch (period.unit, period.value) {
                    case (.month, 1): note = "facturé chaque mois"
                    case (.month, let v): note = "facturé tous les \(v) mois"
                    case (.year, _): note = "facturé chaque année"
                    case (.week, _): note = "facturé chaque semaine"
                    default: note = ""
                    }
                }
                var trial = ""
                if let intro = sp.introductoryDiscount, intro.paymentMode == .freeTrial {
                    let p = intro.subscriptionPeriod
                    switch p.unit {
                    case .day:   trial = "\(p.value) jours offerts"
                    case .week:  trial = "\(p.value * 7) jours offerts"
                    case .month: trial = "\(p.value) mois offert"
                    default: break
                    }
                }
                built.append(Plan(id: spec.id, title: spec.title, priceString: price,
                                   billingNote: note, trialNote: trial,
                                   popular: spec.popular, package: pkg))
            }
            plans = built
            if built.isEmpty {
                message = "Offres bientôt disponibles."
            }
        } catch {
            plans = []
            message = "Impossible de charger les offres. Réessaie plus tard."
        }
    }

    func purchase(_ plan: Plan) async {
        purchasing = true
        defer { purchasing = false }
        do {
            let result = try await Purchases.shared.purchase(package: plan.package)
            if result.userCancelled { return }
            if result.customerInfo.entitlements[entitlement]?.isActive == true {
                purchased = true
            } else {
                message = "Achat non confirmé."
            }
        } catch {
            message = "Achat impossible."
        }
    }

    func restore() async {
        purchasing = true
        defer { purchasing = false }
        do {
            let info = try await Purchases.shared.restorePurchases()
            if info.entitlements[entitlement]?.isActive == true {
                purchased = true
            } else {
                message = "Aucun achat à restaurer."
            }
        } catch {
            message = "Restauration impossible."
        }
    }
}
