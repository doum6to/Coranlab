import SwiftUI

// MARK: - UnitBanner (app/(main)/learn/unit-banner.tsx)
struct UnitBanner: View {
    let title: String
    let description: String
    var showReviser: Bool = false
    var purple: Bool = false
    var onReviser: () -> Void = {}

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(purple ? .white : Theme.text)
                    .lineLimit(1)
                    .headingStyle()
                Text(description)
                    .font(.system(size: 13))
                    .foregroundColor(purple ? .white.opacity(0.75) : Theme.muted)
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
            if showReviser {
                Button(action: onReviser) {
                    Text("Réviser")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 16).padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.radiusSm, style: .continuous)
                                .fill(Theme.green)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.radiusSm, style: .continuous)
                                .stroke(Color(hex: 0x5755E0), lineWidth: 2)
                        )
                        .background(
                            RoundedRectangle(cornerRadius: Theme.radiusSm, style: .continuous)
                                .fill(Color(hex: 0x5250D4)).offset(y: 2)
                        )
                }
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .fill(purple ? Theme.green : Color.white)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .stroke(purple ? Color(hex: 0x5755E0) : Theme.cardBorder, lineWidth: 2)
        )
        .background(
            RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .fill(purple ? Color(hex: 0x5250D4) : Theme.cardShadow).offset(y: 4)
        )
    }
}

// MARK: - Active-card tracking
private struct CardMidXKey: PreferenceKey {
    static var defaultValue: [Int: CGFloat] = [:]
    static func reduce(value: inout [Int: CGFloat], nextValue: () -> [Int: CGFloat]) {
        value.merge(nextValue()) { _, new in new }
    }
}

// MARK: - Unit carousel of list cards (unit-with-lists.tsx)
struct UnitCarousel: View {
    let unit: LearnUnit
    var showReviser: Bool = true
    var lecons: Bool = false
    var onReviser: () -> Void = {}
    var onTap: (LearnList) -> Void = { _ in }

    @State private var activeIdx = 0
    private var activeListId: Int? {
        unit.lists.first { $0.completedLevels < $0.totalLevels }?.listId
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            UnitBanner(title: unit.title, description: unit.description,
                       showReviser: showReviser, purple: lecons, onReviser: onReviser)
                .padding(.horizontal, 16)

            GeometryReader { container in
                let center = container.frame(in: .global).midX
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(Array(unit.lists.enumerated()), id: \.element.listId) { idx, list in
                            ListCard(list: list,
                                     isCurrent: list.listId == activeListId,
                                     lecons: lecons,
                                     onTap: { onTap(list) })
                                .background(
                                    GeometryReader { g in
                                        Color.clear.preference(
                                            key: CardMidXKey.self,
                                            value: [idx: g.frame(in: .global).midX])
                                    }
                                )
                        }
                    }
                    .padding(.horizontal, max(16, (container.size.width - 230) / 2))
                    .padding(.vertical, 6)
                }
                .onPreferenceChange(CardMidXKey.self) { mids in
                    let nearest = mids.min { abs($0.value - center) < abs($1.value - center) }
                    if let n = nearest?.key, n != activeIdx { activeIdx = n }
                }
            }
            .frame(height: 360)

            if unit.lists.count > 1 {
                HStack(spacing: 6) {
                    ForEach(0..<unit.lists.count, id: \.self) { i in
                        Circle()
                            .fill(i == activeIdx ? Theme.green : Theme.border)
                            .frame(width: 8, height: 8)
                            .scaleEffect(i == activeIdx ? 1.25 : 1)
                            .animation(.easeOut(duration: 0.2), value: activeIdx)
                    }
                }
                .frame(maxWidth: .infinity)
            }
        }
    }
}

// MARK: - Shared feed (used by Apprendre + Leçons)
struct LearnFeed: View {
    @ObservedObject var store: LearnStore
    var title: String
    var showReviser: Bool
    var lecons: Bool = false
    var onReviser: () -> Void = {}
    var onPlay: (LearnList) -> Void
    var onPremium: () -> Void

    private var overallPercent: Int {
        var total = 0, done = 0
        for u in store.units { for l in u.lists { total += l.totalLevels; done += l.completedLevels } }
        return total > 0 ? Int(Double(done) / Double(total) * 100) : 0
    }

    private var premiumNudge: some View {
        Button { onPremium() } label: {
            HStack(spacing: 12) {
                ZStack {
                    PremiumFill().frame(width: 44, height: 44).clipShape(RoundedRectangle(cornerRadius: 12))
                    Image(systemName: "sparkles").foregroundColor(.white).font(.system(size: 18, weight: .bold))
                }
                VStack(alignment: .leading, spacing: 3) {
                    Text("Continue ta progression").font(.system(size: 15, weight: .bold)).foregroundColor(Theme.text)
                    Text("Tu comprends déjà \(overallPercent)% — débloque tout")
                        .font(.system(size: 12)).foregroundColor(Theme.muted).lineLimit(1)
                    GeometryReader { g in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Theme.border)
                            PremiumFill().frame(width: max(6, g.size.width * CGFloat(overallPercent) / 100)).clipShape(Capsule())
                        }
                    }.frame(height: 5)
                }
                Text("Premium").font(.system(size: 13, weight: .bold)).foregroundColor(.white)
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .background(Capsule().fill(Theme.dark))
            }
            .padding(12)
            .background(RoundedRectangle(cornerRadius: Theme.radius).fill(Color.white))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.radius)
                    .stroke(LinearGradient(colors: [Color(hex: 0xF7C325), Color(hex: 0xE350E3), Color(hex: 0x456DFF)], startPoint: .leading, endPoint: .trailing), lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }

    var body: some View {
        VStack(spacing: 0) {
            // White sticky header: logo + "Devenir Premium" (non-pro)
            HStack(spacing: 10) {
                Image("quranlab_logo").resizable().scaledToFit().frame(height: 24)
                Spacer()
                if !store.isPro {
                    Button { onPremium() } label: {
                        Text("Devenir Premium")
                            .font(.system(size: 13, weight: .bold)).foregroundColor(.white)
                            .padding(.horizontal, 14).padding(.vertical, 8)
                            .background(PremiumFill().clipShape(Capsule()))
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 12)
            .background(Color.white)
            .overlay(Rectangle().fill(Theme.border).frame(height: 1), alignment: .bottom)

            if !store.isPro && !lecons && !store.units.isEmpty {
                premiumNudge.padding(.horizontal, 16).padding(.top, 12)
            }

            if store.units.isEmpty {
                Spacer()
                if store.isLoading {
                    LoadingView()
                } else {
                    VStack(spacing: 8) {
                        Image(systemName: "wifi.exclamationmark")
                            .font(.system(size: 36)).foregroundColor(Theme.muted)
                        Text(store.errorMessage ?? "Aucun contenu.")
                            .foregroundColor(Theme.muted)
                    }
                }
                Spacer()
            } else {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 40) {
                        ForEach(store.units) { unit in
                            UnitCarousel(unit: unit,
                                         showReviser: showReviser,
                                         lecons: lecons,
                                         onReviser: onReviser,
                                         onTap: { list in
                                            if list.isPremiumLocked { onPremium() }
                                            else { onPlay(list) }
                                         })
                        }
                    }
                    .padding(.top, 16)
                    .padding(.bottom, 24)
                }
            }
        }
        .background(Color.white.ignoresSafeArea())
        .task { await store.loadCacheThenRefresh() }
        .refreshable { await store.refresh() }
    }
}
