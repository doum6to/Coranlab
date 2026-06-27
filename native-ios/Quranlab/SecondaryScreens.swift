import SwiftUI

// Reusable white sticky header (header.tsx) used by the secondary tabs.
struct ScreenHeader: View {
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
    @StateObject private var store: LeaderboardStore
    init(session: SessionStore) { _store = StateObject(wrappedValue: LeaderboardStore(session: session)) }

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(title: "Classement")
            ScrollView(showsIndicators: false) {
                Group {
                    if store.isLoading {
                        LoadingView().padding(.top, 60)
                    } else if let r = store.resp, r.joined {
                        joined(r)
                    } else if let r = store.resp {
                        notJoined(r)
                    } else if let e = store.errorMessage {
                        Text(e).foregroundColor(Theme.muted).padding(.top, 60)
                    }
                }
                .padding(16)
            }
        }
        .background(Color.white.ignoresSafeArea())
        .task { await store.load() }
        .refreshable { await store.load() }
    }

    // MARK: joined — tier banner + ranked members
    @ViewBuilder
    private func joined(_ r: LeaderboardResponse) -> some View {
        VStack(spacing: 16) {
            HStack(spacing: 12) {
                Image(systemName: "trophy.fill").font(.system(size: 24)).foregroundColor(Theme.yellow)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Ligue \(r.tierLabel ?? "")").font(.system(size: 18, weight: .bold)).headingStyle()
                    Text("Classement de la semaine").font(.system(size: 13)).foregroundColor(Theme.muted)
                }
                Spacer()
            }
            .padding(18).cardSurface()

            VStack(spacing: 0) {
                let members = r.members ?? []
                ForEach(Array(members.enumerated()), id: \.element.id) { idx, m in
                    HStack(spacing: 12) {
                        ZStack {
                            Circle().fill(rankColor(m.rank)).frame(width: 32, height: 32)
                            Text("\(m.rank)").font(.system(size: 13, weight: .bold))
                                .foregroundColor(m.rank <= 3 ? .white : Theme.muted)
                        }
                        Text(m.isCurrentUser ? "\(m.name) (toi)" : m.name)
                            .font(.system(size: 15, weight: m.isCurrentUser ? .bold : .semibold))
                            .foregroundColor(Theme.text).lineLimit(1)
                        Spacer()
                        Text("\(m.weeklyXp) XP").font(.system(size: 14, weight: .bold)).foregroundColor(Theme.green)
                    }
                    .padding(.vertical, 11).padding(.horizontal, 12)
                    .background(m.isCurrentUser ? Theme.selectionBg : Color.clear)
                    .cornerRadius(10)
                    if idx < members.count - 1 { Divider().background(Theme.border) }
                }
            }
            .padding(8).cardSurface()
        }
    }

    private func rankColor(_ rank: Int) -> Color {
        switch rank {
        case 1: return Theme.yellow
        case 2: return Color(hex: 0xC0C0C0)
        case 3: return Color(hex: 0xCD7F32)
        default: return Theme.surface
        }
    }

    // MARK: not joined — invitation + tier ladder
    @ViewBuilder
    private func notJoined(_ r: LeaderboardResponse) -> some View {
        VStack(spacing: 16) {
            VStack(spacing: 12) {
                Image("leaderboard").renderingMode(.template).resizable().scaledToFit()
                    .frame(width: 56, height: 56).foregroundColor(Theme.green)
                Text("Rejoins une ligue").font(.system(size: 18, weight: .bold)).headingStyle()
                Text("Gagne de l'XP cette semaine en terminant des niveaux : tu seras automatiquement placé dans une ligue et tu pourras grimper dans les rangs.")
                    .font(.system(size: 13)).foregroundColor(Theme.muted).multilineTextAlignment(.center)
            }
            .padding(20).cardSurface()

            VStack(alignment: .leading, spacing: 10) {
                Text("Les ligues").font(.system(size: 15, weight: .bold)).headingStyle()
                let tiers = r.tiers ?? []
                ForEach(Array(tiers.enumerated()), id: \.element.id) { i, t in
                    HStack(spacing: 12) {
                        ZStack {
                            Circle().fill(Theme.surface).frame(width: 34, height: 34)
                            Text("\(i+1)").font(.system(size: 13, weight: .bold)).foregroundColor(Theme.green)
                        }
                        Text(t.label).font(.system(size: 14, weight: .semibold)).foregroundColor(Theme.text)
                        Spacer()
                    }
                    if i < tiers.count - 1 { Divider().background(Theme.border) }
                }
            }
            .padding(18).cardSurface()
        }
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
    var streak: Int = 0
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

                    StreakPanel(streak: streak)

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

/// Weekly streak panel (shown in Réglages). Number + 7-day strip with today highlighted.
struct StreakPanel: View {
    var streak: Int
    private let labels = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"]
    private var todayIdx: Int {
        let wd = Calendar.current.component(.weekday, from: Date()) // 1=Sun ... 7=Sat
        return (wd + 5) % 7                                         // 0=Mon ... 6=Sun
    }
    var body: some View {
        VStack(spacing: 16) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(streak)").font(.system(size: 30, weight: .heavy)).foregroundColor(Theme.text)
                    Text(streak <= 1 ? "jour de série" : "jours de série")
                        .font(.system(size: 12, weight: .semibold)).foregroundColor(Theme.muted)
                }
                Spacer()
                Image(systemName: "flame.fill").font(.system(size: 30)).foregroundColor(Theme.orange)
            }
            HStack(spacing: 0) {
                ForEach(0..<7, id: \.self) { i in
                    VStack(spacing: 6) {
                        ZStack {
                            Circle()
                                .fill(i == todayIdx ? Theme.green : (i < todayIdx ? Theme.green.opacity(0.15) : Theme.surface))
                                .frame(width: 34, height: 34)
                            Image(systemName: "bolt.fill").font(.system(size: 14))
                                .foregroundColor(i == todayIdx ? .white : (i < todayIdx ? Theme.green : Theme.muted.opacity(0.5)))
                        }
                        Text(labels[i])
                            .font(.system(size: 11, weight: i == todayIdx ? .bold : .regular))
                            .foregroundColor(i == todayIdx ? Theme.text : Theme.muted)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(18).cardSurface()
    }
}
