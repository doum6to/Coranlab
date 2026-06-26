import SwiftUI

// Reusable white sticky header (header.tsx) used by the secondary tabs.
private struct ScreenHeader: View {
    let title: String
    var body: some View {
        HStack { Spacer()
            Text(title).font(.system(size: 18, weight: .bold)).foregroundColor(Theme.text).headingStyle()
            Spacer()
        }
        .padding(.bottom, 12)
        .background(Color.white)
        .overlay(Rectangle().fill(Theme.border).frame(height: 1), alignment: .bottom)
    }
}

// MARK: - Classement (leaderboard.tsx — league tiers shell)
struct LeaderboardView: View {
    private let tiers = ["NIYYA","IQRA","TALIB","TARTIL","TAJWID","QARI","TADABBUR","HAFIZ","MUTQIN","FIRDAUS"]
    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(title: "Classement")
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    // Join card (league-join-view.tsx)
                    VStack(spacing: 12) {
                        Image("leaderboard").renderingMode(.template).resizable().scaledToFit()
                            .frame(width: 56, height: 56).foregroundColor(Theme.green)
                        Text("Rejoins une ligue").font(.system(size: 18, weight: .bold)).headingStyle()
                        Text("Gagne de l'XP cette semaine pour grimper dans les rangs et débloquer la ligue supérieure.")
                            .font(.system(size: 13)).foregroundColor(Theme.muted)
                            .multilineTextAlignment(.center)
                        ShinyButton(title: "Rejoindre", variant: .green)
                    }
                    .padding(20)
                    .cardSurface()

                    VStack(alignment: .leading, spacing: 10) {
                        Text("Les ligues").font(.system(size: 15, weight: .bold)).headingStyle()
                        ForEach(Array(tiers.enumerated()), id: \.offset) { i, name in
                            HStack(spacing: 12) {
                                ZStack {
                                    Circle().fill(Theme.surface).frame(width: 34, height: 34)
                                    Text("\(i+1)").font(.system(size: 13, weight: .bold)).foregroundColor(Theme.green)
                                }
                                Text(name).font(.system(size: 14, weight: .semibold)).foregroundColor(Theme.text)
                                Spacer()
                                if i == 0 { Text("Actuelle").font(.system(size: 11, weight: .bold))
                                    .foregroundColor(Theme.green) }
                            }
                            if i < tiers.count - 1 { Divider().background(Theme.border) }
                        }
                    }
                    .padding(18)
                    .cardSurface()
                }
                .padding(16)
            }
        }
        .background(Color.white.ignoresSafeArea())
    }
}

// MARK: - Quêtes (quests.tsx — XP milestones shell)
struct QuestsView: View {
    @ObservedObject var store: LearnStore
    private let milestones = [100, 250, 500, 1000]
    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(title: "Quêtes")
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    VStack(spacing: 8) {
                        Image("quests").renderingMode(.template).resizable().scaledToFit()
                            .frame(width: 52, height: 52).foregroundColor(Theme.green)
                        Text("Accomplis des quêtes").font(.system(size: 18, weight: .bold)).headingStyle()
                        Text("Gagne de l'XP en terminant des niveaux pour compléter tes quêtes.")
                            .font(.system(size: 13)).foregroundColor(Theme.muted)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 8)

                    VStack(spacing: 18) {
                        ForEach(milestones, id: \.self) { m in
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Image("points").resizable().scaledToFit().frame(width: 22, height: 22)
                                    Text("Gagne \(m) points").font(.system(size: 15, weight: .bold)).foregroundColor(Theme.text)
                                    Spacer()
                                }
                                GeometryReader { g in
                                    ZStack(alignment: .leading) {
                                        Capsule().fill(Theme.border)
                                        Capsule().fill(Theme.green).frame(width: g.size.width * 0.0)
                                    }
                                }.frame(height: 10)
                            }
                        }
                    }
                    .padding(18)
                    .cardSurface()
                }
                .padding(16)
            }
        }
        .background(Color.white.ignoresSafeArea())
    }
}

// MARK: - Réglages (settings — wired to the real session)
struct SettingsScreen: View {
    @EnvironmentObject var session: SessionStore
    var isPro: Bool = false
    @State private var showPaywall = false

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(title: "Réglages")
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    // Premium status
                    if isPro {
                        HStack(spacing: 12) {
                            Image(systemName: "crown.fill").font(.system(size: 22)).foregroundColor(.white)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Quranlab Premium").font(.system(size: 16, weight: .bold)).foregroundColor(.white)
                                Text("Abonnement actif ✓").font(.system(size: 13)).foregroundColor(.white.opacity(0.85))
                            }
                            Spacer()
                        }
                        .padding(18)
                        .background(PremiumFill().clipShape(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)))
                    } else {
                        VStack(spacing: 12) {
                            HStack(spacing: 10) {
                                Image(systemName: "crown.fill").font(.system(size: 20)).foregroundColor(Theme.green)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Passe à Premium").font(.system(size: 16, weight: .bold)).foregroundColor(Theme.text)
                                    Text("Débloque toutes les leçons").font(.system(size: 13)).foregroundColor(Theme.muted)
                                }
                                Spacer()
                            }
                            ShinyButton(title: "Voir les offres", variant: .green) { showPaywall = true }
                        }
                        .padding(18).cardSurface()
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Compte").font(.system(size: 12, weight: .bold)).foregroundColor(Theme.muted)
                        Text(session.email ?? "—").font(.system(size: 15, weight: .semibold)).foregroundColor(Theme.text)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(18).cardSurface()

                    Button(role: .destructive) {
                        Task { await session.signOut() }
                    } label: {
                        Text("Se déconnecter")
                            .font(.system(size: 15, weight: .bold))
                            .frame(maxWidth: .infinity).padding(.vertical, 12)
                            .foregroundColor(Theme.wrongText)
                            .background(RoundedRectangle(cornerRadius: Theme.radius).fill(Theme.wrongBg))
                    }
                }
                .padding(16)
            }
        }
        .background(Color.white.ignoresSafeArea())
        .sheet(isPresented: $showPaywall) { PaywallView { } }
    }
}

// MARK: - Shared card surface (white + #E0E0E0 border + 4px #D4D4D4 lip)
private extension View {
    func cardSurface() -> some View {
        self
            .background(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).fill(Color.white))
            .overlay(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .stroke(Theme.cardBorder, lineWidth: 2))
            .background(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .fill(Theme.cardShadow).offset(y: 4))
    }
}
