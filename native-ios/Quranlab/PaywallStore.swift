import Foundation
import RevenueCat

/// Loads RevenueCat offerings and handles purchase / restore.
///
/// Robustness: if the configured "default" offering can't be loaded (network,
/// propagation lag, or the offering not yet returning packages for this app),
/// we fall back to fetching the products DIRECTLY from StoreKit by id, so the
/// prices still show and the user can still buy. Purchases go through the
/// RevenueCat entitlement either way.
@MainActor
final class PaywallStore: ObservableObject {
    struct Plan: Identifiable {
        let id: String          // spec id ($rc_…)
        let title: String
        let priceString: String
        let billingNote: String
        let trialNote: String
        let popular: Bool
        let package: Package?       // present when loaded via an offering
        let product: StoreProduct?  // present when loaded directly from StoreKit
    }

    @Published var plans: [Plan] = []
    @Published var isLoading = true
    @Published var message: String?
    @Published var purchasing = false
    @Published var purchased = false

    private let entitlement = "premium"

    // Display order + labels + the App Store product id for the direct fallback.
    private let specs: [(id: String, title: String, productId: String, popular: Bool)] = [
        ("$rc_monthly",     "Mensuel", "app.quranlab.premium.monthly",   false),
        ("$rc_three_month", "3 mois",  "app.quranlab.premium.quarterly", false),
        ("$rc_annual",      "Annuel",  "app.quranlab.premium.yearly",    true),
        ("$rc_lifetime",    "À vie",   "app.quranlab.premium.lifetime",  false),
    ]

    func load() async {
        isLoading = true
        message = nil
        defer { isLoading = false }

        guard Purchases.isConfigured else {
            message = "Achats indisponibles pour le moment."
            return
        }

        // 1. Preferred path: the RevenueCat "default" offering.
        if let offering = try? await Purchases.shared.offerings().current {
            let built = offering.availablePackages.compactMap { pkg -> Plan? in
                guard let spec = specs.first(where: { $0.id == pkg.identifier }) else { return nil }
                return makePlan(spec: spec, product: pkg.storeProduct, package: pkg)
            }
            .sorted { orderIndex($0.id) < orderIndex($1.id) }
            if !built.isEmpty {
                plans = built
                return
            }
        }

        // 2. Fallback: fetch the products straight from StoreKit by id.
        let ids = specs.map { $0.productId }
        let products = await Purchases.shared.products(ids)
        if !products.isEmpty {
            let byId = Dictionary(uniqueKeysWithValues: products.map { ($0.productIdentifier, $0) })
            let built = specs.compactMap { spec -> Plan? in
                guard let sp = byId[spec.productId] else { return nil }
                return makePlan(spec: spec, product: sp, package: nil)
            }
            if !built.isEmpty {
                plans = built
                return
            }
        }

        // 3. Nothing available yet.
        plans = []
        message = "Les offres ne sont pas encore disponibles. Réessaie dans un instant."
    }

    private func orderIndex(_ id: String) -> Int {
        specs.firstIndex(where: { $0.id == id }) ?? 99
    }

    /// Builds the display fields (per-month price, billing note, trial note).
    private func makePlan(spec: (id: String, title: String, productId: String, popular: Bool),
                          product sp: StoreProduct, package: Package?) -> Plan {
        var price = sp.localizedPriceString
        var note = ""
        if let period = sp.subscriptionPeriod {
            if let perMonth = sp.pricePerMonth,
               let fmt = sp.priceFormatter,
               let s = fmt.string(from: perMonth) {
                price = "\(s) / mois"
            }
            switch (period.unit, period.value) {
            case (.month, 1):        note = "facturé chaque mois"
            case (.month, let v):    note = "facturé tous les \(v) mois"
            case (.year, _):         note = "facturé chaque année"
            case (.week, _):         note = "facturé chaque semaine"
            default:                 note = ""
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
        return Plan(id: spec.id, title: spec.title, priceString: price,
                    billingNote: note, trialNote: trial,
                    popular: spec.popular, package: package, product: sp)
    }

    func purchase(_ plan: Plan) async {
        purchasing = true
        defer { purchasing = false }
        do {
            let info: CustomerInfo
            if let pkg = plan.package {
                let result = try await Purchases.shared.purchase(package: pkg)
                if result.userCancelled { return }
                info = result.customerInfo
            } else if let product = plan.product {
                let result = try await Purchases.shared.purchase(product: product)
                if result.userCancelled { return }
                info = result.customerInfo
            } else {
                message = "Achat indisponible."
                return
            }
            if info.entitlements[entitlement]?.isActive == true {
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
