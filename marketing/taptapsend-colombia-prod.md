# TapTap Send — Colombia / World Cup — Doc de production

> Campagne diaspora (Espagne → Colombie / Kenya / Pérou). Format social vertical
> **9:16 (1080×1920)**, ~**15 s**, **25 ou 30 fps**, mobile-first.
> Outil principal de montage : **After Effects**. Creatify = fournisseur d'assets
> (footage humain IA) **uniquement là où c'est justifié**.

---

## 0. Stratégie outils & crédits (92 crédits Creatify)

**Règle d'or** : Creatify est un outil **vidéo**. Les *statics* (scoreboard, lineup,
split-screen) sont du **design graphique** → Photoshop / Figma / Canva. **0 crédit.**

**Où dépenser les crédits** : uniquement le **footage humain spécifique** difficile à
trouver en stock crédible et divers :
- un **supporter** qui regarde un match (briefs 03 & 05) ;
- une **famille qui reçoit / célèbre** dans un foyer Colombie / Kenya / Pérou (03 & 05).

Un rendu « qualité » coûte **jusqu'à ~20 crédits**. Avec 92 crédits :
- Générer **2-3 plans héros** humains (~40-60 cr), **réutilisés** sur les briefs 03 et 05.
- Garder ~**30 cr de réserve** pour 1-2 reprises.
- **Prévisualiser systématiquement** avant chaque rendu (pas d'itération à l'aveugle).
- Tout le reste (globe, trajectoire, textes, transitions, statics) = **AE + stock + design = 0 crédit**.

**Assets de marque communs (préparer une seule fois) :**
- Logo TapTap Send officiel (versions blanche + couleur)
- Vert de marque + police de marque + typo sportive secondaire (pour brief 05)
- Mockup interface app : carte de notif « Money received ❤️ » + bouton **Send**
- **Globe vectoriel** + style de **trajectoire lumineuse** (arc glowing)

**Comps AE réutilisables (build once, reuse partout) :**
1. **Globe + trajectoire lumineuse** (Trim Paths sur un masque arc + objet/logo sur trajectoire via `pointOnPath`/null parenté). → end screens, briefs 02 et 03.
2. **Carte de notification** (slide-in + overshoot, pop du cœur ❤️). → briefs 01, 02, 03, 05.
3. **Lower-thirds / typo sportive** animée. → tous.

---

## BRIEF 01 — « Double support »

### 01·A — Static (scoreboard) — *design, 0 crédit*
Visuel type tableau d'affichage de stade (LED vert sur fond sombre), 2 colonnes :

| Colonne gauche | Colonne droite |
|---|---|
| ⚽ FOOTBALL | ❤️ FAMILY |
| 90 MIN | EVERY DAY |
| 1 MATCH | 365 DAYS |
| SUPPORT YOUR TEAM | **SEND MONEY HOME** *(à mettre en valeur)* |

- **Headline** : « Support goes beyond football »
- **Subtitle** : « SEND MONEY HOME IN MINUTES. »
- Bas : logo TapTap Send + bandeau confiance (Fast transfers · Secure payments · Money home made easy)
- Specs : 4:5 ou 1:1 pour le feed, 9:16 pour story.

### 01·B — Vidéo — *AE + stock, 0 crédit (Creatify optionnel)*

| # | Durée | Visuel (recherche stock) | Texte écran | Son |
|---|---|---|---|---|
| 1 | 0-3s | `stadium crowd cheering`, `fans waving flags`, `match tension` | « You support your country for 90 minutes » | Foule + nappe montante |
| 2 | 3-6s | **Coupure son nette** → mockup app TapTap Send | « But your family counts on you every day. » | Silence + léger acouphène, puis « ding » |
| 3 | 6-10s | Carte transfert + map animée **Espagne → Colombie** | [Notification] « Money received ❤️ » | Ding notif |
| 4 | 10-13s | Retour stade (réutiliser clip scène 1, gradé chaud) | « Support goes beyond football. » | Foule revient |
| End | 13-15s | Fond dégradé marque | Logo TapTap Send + « Send money in minutes. » | Signature sonore |

**Recettes AE** : Text Animator (offset par mot) S1 ; keyframe volume 0→-48 dB en 1 frame
S2 + whip-pan/flash 2-3 frames ; comp réutilisable « notification » + map trajectoire S3.

---

## BRIEF 02 — « Support never stops »

### 02·A — Static (lineup) — *design, 0 crédit*
Composition terrain de foot vue du dessus :
- Haut : « THIS YEAR… » / ⚽ « WE'RE WATCHING. » / ❤️ « WE'RE SUPPORTING. »
- « YOUR TEAM » → formation avec pastilles cœur : **Mom / Dad / Brother / Sister** placés comme des joueurs
- Bas : « THE TEAM THAT COUNTS ON YOU **NEVER STOPS.** » + logo + bandeau confiance

### 02·B — Vidéo — *AE 100%, 0 crédit*

| # | Durée | Visuel | Texte écran | Son |
|---|---|---|---|---|
| 1 | 0-3s | Globe + **ballon qui tourne** autour, supporters en fond | « This year… » | Ambiance Coupe du monde |
| 2 | 3-6s | **Silence**. Le ballon **ralentit** progressivement | « …we're just watching » | Coupure → silence |
| 3 | 6-9s | Le ballon **disparaît**, le **logo TapTap** apparaît à sa place | « But there's still a team counting on you. » | « Ding » doux |
| 4 | 9-12s | Animation transfert vers la famille | [Notification] « Money received ❤️ » | Ding notif |
| 5 | 12-15s | Logo **tourne autour du globe** | « Support goes beyond football. » + CTA « Send money in minutes. » | Signature |

**Recettes AE** : comp globe réutilisable ; ballon en orbite via expression de rotation +
`linear()` pour le ralenti S2 ; morph ballon→logo (scale/opacity cross-dissolve + petit pop).

---

## BRIEF 03 — « Support travels fast »

### 03·A — Static (split-screen) — *design, 0 crédit*
- **Gauche** : supporter en Espagne regardant un match. Notif « ❤️ Mom — Can you help me? »
- **Centre** : trajectoire/flèche lumineuse reliant les deux côtés (logo qui voyage)
- **Droite** : famille regardant le même match. Notif « ❤️ Money received — From your loved one »
- **Headline** : « Support travels fast. » · **CTA** : « Send money in minutes. » + logo

### 03·B — Vidéo — *★ Creatify (footage humain) + AE*

| # | Durée | Visuel | Texte écran | Son |
|---|---|---|---|---|
| 1 | 0-3s | **[Creatify/stock]** supporter regarde un match, ambiance CdM | — | **Le son du stade remplit l'écran** |
| 2 | 3-5s | Brève silence. Il regarde son téléphone | [Notification] « Mom ❤️ » | Silence court |
| 3 | 5-10s | Il clique **Send** → logo **voyage à travers le globe** : **Espagne → Colombie / Kenya / Pérou** | — | **Le son du stade continue** pendant tout le voyage |
| 4 | 10-13s | **[Creatify/stock]** la famille reçoit l'argent ; le match passe **chez eux aussi** — même ambiance, même émotion | — | Même ambiance stade |
| End | 13-15s | Globe + **trajectoire glowing** | « Support goes beyond borders. » + CTA « Send money in minutes. » | Signature |

**Note clé** : le son du stade est **continu** S1→S4 (lien émotionnel). Le globe/trajectoire
= comp AE réutilisable (mutualisée avec brief 02 et les end screens).

---

## BRIEF 05 — « Le seul transfert réussi »

**Concept** : humoristique, social-native, codes d'analyse post-match. Jeu de mots
**« transfer »** (passe ratée / transfert d'argent réussi) = cœur de l'idée — à préserver.

**Ton & best practices** : montage **ultra-rapide**, cuts nerveux, sound design
commentateurs sportifs, **stats absurdes/drôles**, typo sportive dynamique, **éviter toute
référence agressive à une équipe précise**, très lisible mobile-first.
**Format** : motion/cinematic social ad, **15 s**.

### Vidéo — *AE + stock (montage), Creatify pour le plan famille (réutilisé du 03)*

| # | Durée | Visuel | Texte écran | Son |
|---|---|---|---|---|
| 1 | 0-5s | **Compil ultra-rapide** : tirs ratés, défenses catastrophiques, supporters déçus, réactions dramatiques | (stats absurdes en surimpression, ex. « 0/12 shots on target ») | Commentateurs surexcités, cuts nerveux |
| 2 | 5-7s | **Hard cut + silence** | « Meanwhile… » | Silence total |
| 3 | 7-10s | Interface TapTap Send — **Money sent successfully** | « The only successful transfer tonight. » | Ding propre, satisfaisant |
| 4 | 10-13s | **[Creatify/stock — réutiliser plan famille du brief 03]** la famille reçoit | [Notification] « ❤️ Received. Thank you! » | Ding + petite chaleur |
| 5 | 13-15s | Logo TapTap Send | « At least one transfer went through. » + CTA « Money delivered in minutes. » | Signature |

**Recettes AE** : montage frame-perfect sur les accents des commentateurs ; typo sportive
« stat » qui claque (scale-in + shake léger) ; le **silence** S2 doit être total pour la chute comique.

---

## Récap allocation crédits

| Livrable | Outil | Crédits |
|---|---|---|
| Statics 01·A / 02·A / 03·A | Design (PS/Figma) | 0 |
| Vidéo 01·B | AE + stock | 0 |
| Vidéo 02·B | AE 100% | 0 |
| Vidéo 03·B | **Creatify (plans humains) + AE** | ~40-60 |
| Vidéo 05 | AE + stock + **plan famille réutilisé du 03** | ~0 (réutilisation) |
| **Réserve reprises** | — | ~30 |

**Plans Creatify à générer (2-3 max, réutilisés) :**
1. Supporter regardant un match (ambiance maison/bar).
2. Famille recevant / célébrant dans un foyer (contexte Colombie ; décliner Kenya/Pérou si budget).
3. (Optionnel) Réaction joie à la notification.
