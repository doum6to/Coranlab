import SwiftUI

/// Native paywall — faithful to the web pricing screen (perks, plan cards,
/// social proof, legal links), with native iOS conventions. Handles empty
/// offerings gracefully (no crash) while real purchases are gated by Apple.
struct PaywallView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var store = PaywallStore()
    @State private var selectedId: String?
    let onPurchased: () -> Void

    private let perks = [
        "Toutes les leçons débloquées",
        "Les 500 mots essentiels du Coran",
        "Apprentissage illimité, sans pub",
        "Tous les cours, à ton rythme",
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 22) {
                header
                perksList

                if store.isLoading {
                    ProgressView().tint(Theme.primary).padding(.vertical, 20)
                } else if store.plans.isEmpty {
                    unavailableCard
                } else {
                    planCards
                    cta
                    Button { Task { await store.restore() } } label: {
                        Text("Restaurer mes achats")
                            .font(.subheadline)
                            .foregroundColor(Theme.muted)
                    }
                }

                if let msg = store.message, !store.plans.isEmpty {
                    Text(msg).font(.footnote).foregroundColor(Theme.orange)
                        .multilineTextAlignment(.center)
                }

                socialProof
                legal
            }
            .padding(20)
        }
        .background(Color.white.ignoresSafeArea())
        .overlay(alignment: .topTrailing) {
            Button { dismiss() } label: {
                Image(systemName: "xmark")
                    .font(.headline).foregroundColor(Theme.muted).padding(16)
            }
        }
        .task {
            await store.load()
            if selectedId == nil {
                selectedId = store.plans.first(where: { $0.popular })?.id ?? store.plans.first?.id
            }
        }
        .onChange(of: store.purchased) { done in
            if done { onPurchased(); dismiss() }
        }
    }

    // MARK: - Pieces

    private var header: some View {
        VStack(spacing: 8) {
            Image(systemName: "crown.fill").font(.system(size: 44)).foregroundColor(Theme.primary)
            Text("Quranlab Premium")
                .font(.system(size: 28, weight: .heavy, design: .rounded))
                .foregroundColor(Theme.text)
            Text("Comprends le Coran sans limite")
                .font(.subheadline).foregroundColor(Theme.muted)
        }
        .padding(.top, 36)
    }

    private var perksList: some View {
        VStack(alignment: .leading, spacing: 10) {
            ForEach(perks, id: \.self) { p in
                HStack(spacing: 10) {
                    Image(systemName: "checkmark.circle.fill").foregroundColor(Theme.primary)
                    Text(p).foregroundColor(Theme.text)
                    Spacer()
                }
            }
        }
    }

    private var planCards: some View {
        VStack(spacing: 12) {
            ForEach(store.plans) { plan in
                Button { selectedId = plan.id } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: 6) {
                                Text(plan.title).font(.headline).foregroundColor(Theme.text)
                                if plan.popular {
                                    Text("POPULAIRE")
                                        .font(.system(size: 9, weight: .bold))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 6).padding(.vertical, 2)
                                        .background(Theme.primary).cornerRadius(6)
                                }
                            }
                            Text(plan.priceString).font(.subheadline).foregroundColor(Theme.muted)
                        }
                        Spacer()
                        Image(systemName: selectedId == plan.id ? "largecircle.fill.circle" : "circle")
                            .foregroundColor(selectedId == plan.id ? Theme.primary : Theme.border)
                    }
                    .padding(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(selectedId == plan.id ? Theme.primary : Theme.border, lineWidth: 2)
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var cta: some View {
        Button {
            guard let plan = store.plans.first(where: { $0.id == selectedId }) else { return }
            Task { await store.purchase(plan) }
        } label: {
            HStack {
                if store.purchasing { ProgressView().tint(.white) }
                Text("Continuer").fontWeight(.bold)
            }
            .frame(maxWidth: .infinity).padding(.vertical, 16)
            .background(Theme.primary).foregroundColor(.white).cornerRadius(14)
        }
        .disabled(store.purchasing || selectedId == nil)
        .opacity(store.purchasing || selectedId == nil ? 0.6 : 1)
    }

    private var unavailableCard: some View {
        VStack(spacing: 10) {
            Image(systemName: "clock.badge.checkmark").font(.system(size: 36)).foregroundColor(Theme.muted)
            Text(store.message ?? "Offres bientôt disponibles.")
                .foregroundColor(Theme.muted).multilineTextAlignment(.center)
        }
        .padding(20)
        .frame(maxWidth: .infinity)
        .background(Theme.surface).cornerRadius(14)
    }

    private var socialProof: some View {
        VStack(spacing: 6) {
            HStack(spacing: 3) {
                ForEach(0..<5) { _ in
                    Image(systemName: "star.fill").font(.caption2).foregroundColor(Theme.yellow)
                }
            }
            Text("« En 3 jours je reconnais plein de mots dans ma prière. Allahumma barik. » — Omar")
                .font(.caption).italic().foregroundColor(Theme.muted)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 4)
    }

    private var legal: some View {
        HStack(spacing: 14) {
            Link("Conditions", destination: URL(string: "https://www.quranlab.app/conditions")!)
            Text("·").foregroundColor(Theme.border)
            Link("Confidentialité", destination: URL(string: "https://www.quranlab.app/confidentialite")!)
        }
        .font(.caption2)
        .tint(Theme.muted)
        .padding(.bottom, 16)
    }
}
