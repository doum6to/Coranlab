# Quranlab iOS — TODO de lancement (à dérouler demain)

> App déjà sur **TestFlight** ✅. Ce doc regroupe tout ce qu'il reste : textes prêts
> à coller, réponses confidentialité, IDs RevenueCat exacts attendus par le code,
> et une checklist finale « où cliquer / quelle valeur mettre ».
> **Aucun secret n'est stocké ici** — les valeurs sensibles vont dans les dashboards.

---

## 1) Textes App Store (prêts à coller — FR)

**Nom** : `Quranlab` (déjà défini)

**Sous-titre** (≤ 30 caractères) :
```
Comprendre le Coran mot à mot
```

**Texte promotionnel** (≤ 170) :
```
Apprends à comprendre le Coran en arabe, 5 minutes par jour : vocabulaire, leçons interactives et révisions intelligentes. Commence gratuitement aujourd'hui.
```

**Mots-clés** (≤ 100, sans espaces) :
```
arabe,islam,apprendre,vocabulaire,musulman,priere,salat,sourate,tajwid,memoriser,deen,langue,hadith
```

**Description** (à coller telle quelle) :
```
Quranlab t'aide à comprendre le Coran en arabe, un mot à la fois.

Conçue aussi bien pour les débutants que pour celles et ceux qui veulent progresser, l'app transforme l'apprentissage du vocabulaire coranique en une habitude simple : quelques minutes par jour, des leçons courtes, et des révisions au bon moment pour ancrer durablement ce que tu apprends.

CE QUE TU PEUX FAIRE
• Apprendre les mots les plus fréquents du Coran, classés par thèmes
• Des leçons interactives variées (QCM, association, anagrammes, vrai/faux…)
• Une progression claire, niveau par niveau
• Des révisions intelligentes pour ne rien oublier
• Suivre ta série de jours pour rester motivé

POURQUOI QURANLAB
• 100 % pensé pour le vocabulaire du Coran
• Une interface simple, sans distraction
• Apprends à ton rythme, où que tu sois

GRATUIT POUR COMMENCER
Commence gratuitement. L'accès Premium débloque l'ensemble des leçons et des cours pour aller plus loin.

Télécharge Quranlab et fais de la compréhension du Coran une habitude quotidienne, in shâ Allah.

—

Quranlab propose des abonnements (3 mois, 6 mois, 12 mois) ainsi qu'un achat unique « à vie ».
• Le paiement est débité de ton compte Apple à la confirmation de l'achat.
• Les abonnements se renouvellent automatiquement, sauf désactivation au moins 24 h avant la fin de la période en cours.
• Le renouvellement est débité dans les 24 h précédant la fin de la période.
• Tu peux gérer ou désactiver le renouvellement dans les réglages de ton compte Apple.

Conditions d'utilisation : https://www.quranlab.app/conditions
Politique de confidentialité : https://www.quranlab.app/confidentialite
```

> ⚠️ Apple (guideline 3.1.2) **exige** le bloc abonnements + les 2 liens ci-dessus.
> Renseigne aussi ces 2 URLs dans les champs dédiés d'App Store Connect :
> **EULA / Conditions** = `https://www.quranlab.app/conditions`
> **Confidentialité** = `https://www.quranlab.app/confidentialite`

---

## 2) Privacy Nutrition Label (App Store Connect → Confidentialité de l'app)

Rappel : **TikTok, Meta et Microsoft Clarity sont désormais WEB-ONLY** (gate
`<WebOnly>`), donc **aucun tracker tiers ne tourne dans l'app native**.
→ À la question « Suivi » (App Tracking Transparency) : **« Données non utilisées
pour vous suivre »** (No tracking). Aucune fenêtre ATT à afficher.

Données **collectées** (toutes « liées à l'utilisateur », finalité **Fonctionnement
de l'app**, **PAS** de suivi) :

| Donnée | Catégorie ASC | Finalité | Suivi ? |
|---|---|---|---|
| Adresse e-mail | Coordonnées | Fonctionnement | Non |
| Nom | Coordonnées | Fonctionnement | Non |
| Identifiant utilisateur | Identifiants | Fonctionnement | Non |
| Historique d'achats | Achats | Fonctionnement | Non |
| Progression d'apprentissage | Autres données | Fonctionnement | Non |

Sous-traitants (pour info, à ne pas déclarer comme « partage pour suivi ») :
Supabase (auth + base de données), Stripe (paiement web), **RevenueCat + Apple**
(achats in-app), Vercel (hébergement), Resend (e-mails).

> Réponses types dans l'assistant ASC : « Oui, nous collectons des données » →
> coche les 5 lignes ci-dessus → pour chacune : **Liée à l'identité = Oui**,
> **Utilisée pour le suivi = Non**, **Finalité = Fonctionnement de l'app**.

---

## 3) Compte de démo pour la revue Apple

App Store Connect → fiche de version → **Vérification de l'app** →
**Connexion requise = Oui** :

```
Identifiant : review@quranlab.app
Mot de passe : <choisis-en un simple, ex. Review2026!>

Notes pour la revue :
Compte de démonstration avec accès Premium déjà activé. Connectez-vous avec
l'identifiant ci-dessus pour accéder à toutes les leçons et au contenu Premium.
Les achats intégrés peuvent être testés en environnement Sandbox.
L'app charge un site web (https://www.quranlab.app) dans une WebView ; toutes
les fonctionnalités d'apprentissage sont interactives et natives à l'usage.
```

> Création du compte : voir checklist point (h).

---

## 4) RevenueCat / IAP — IDs EXACTS attendus par le code

Référence : `lib/iap/revenuecat.ts`. **Le code n'impose pas les *product IDs*
App Store** ; il passe par les **packages d'une Offering RevenueCat**. Ce qui doit
matcher EXACTEMENT :

- **Entitlement** (RevenueCat) : **`premium`**
  → l'app vérifie `customerInfo.entitlements.active["premium"]`.
- **Offering** : l'app lit **`offerings.current`** → ton Offering doit être marquée
  **« Current »** dans RevenueCat (le nom importe peu, ex. `default`).
- **Packages** (identifiants EXACTS dans l'Offering) — chacun rattaché à un produit
  App Store :

  | Plan dans l'app | Identifiant de package RevenueCat | Type produit App Store |
  |---|---|---|
  | 3 mois  | `$rc_three_month` | Abonnement auto-renouvelable (3 mois) |
  | 6 mois  | `$rc_six_month`   | Abonnement auto-renouvelable (6 mois) |
  | Annuel  | `$rc_annual`      | Abonnement auto-renouvelable (1 an) |
  | À vie   | `$rc_lifetime`    | Achat non-consommable |

  > `$rc_three_month` / `$rc_six_month` / `$rc_annual` / `$rc_lifetime` sont les
  > identifiants **par défaut** de RevenueCat (durées standard) : crée les packages
  > avec ces durées et ils prendront ces identifiants automatiquement.
  > (Le plan web `monthly_trial` → `$rc_monthly` **n'est pas requis sur iOS** ;
  > l'essai 7 j iOS se fait via une **offre d'introduction** sur chaque abonnement.)

- **Product IDs App Store** : libres, mais garde-les lisibles, ex. :
  `app.quranlab.sub.3m`, `app.quranlab.sub.6m`, `app.quranlab.sub.1y`,
  `app.quranlab.lifetime`. (Ce sont eux que tu attaches aux packages ci-dessus.)
- **Mapping utilisateur** : l'app fixe `appUserID = id Supabase` → le webhook
  (`event.app_user_id`) accorde le premium au bon compte. Rien à configurer.

---

## 5) Checklist finale — reste à faire (où / quelle valeur)

### a) Certificat de signature réutilisable — Codemagic
- **Génère une clé privée** (à faire dans un terminal) :
  ```
  openssl genrsa 2048
  ```
- **Copie TOUT** le bloc affiché (`-----BEGIN…` → `…END-----`).
- **Codemagic → ton app → Settings → Environment variables** : crée une variable
  **`CERTIFICATE_PRIVATE_KEY`**, colle la clé, coche **Secure**, groupe attaché au
  workflow `ios-capacitor`.
- Effet : le **même** certificat est réutilisé à chaque build (limite Apple ~2 certs).
- **Avant ça** : Apple Developer → **Certificates** → révoque le certificat
  « Distribution » **orphelin** créé par un build précédent (s'il y en a un sans clé).

### b) Variables d'environnement — Vercel (Project → Settings → Environment Variables, scope Production)
- **`NEXT_PUBLIC_REVENUECAT_IOS_KEY`** = clé publique iOS RevenueCat (format `appl_…`,
  dans RevenueCat → Project → API keys → App: iOS).
- **`REVENUECAT_WEBHOOK_SECRET`** = chaîne aléatoire ; génère-la avec :
  ```
  openssl rand -hex 32
  ```
- Vérifie aussi que **`NEXT_PUBLIC_APP_URL`** = `https://www.quranlab.app`.
- **Redéploie** après ajout.

### c) Produits IAP — App Store Connect (Monétisation → Abonnements / Achats intégrés)
- Crée un **groupe d'abonnement** (ex. « Quranlab Premium ») avec **3 abonnements
  auto-renouvelables** : 3 mois, 6 mois, 1 an + **1 produit non-consommable** « à vie ».
- **Prix cibles** (aligne sur le web ; choisis le palier Apple le plus proche) :
  | Produit | Prix cible |
  |---|---|
  | 3 mois  | 44,99 € (≈ 14,97 €/mois) |
  | 6 mois  | 71,99 € (≈ 11,99 €/mois) |
  | Annuel  | 119,99 € (≈ 9,99 €/mois) |
  | À vie   | 299,99 € (paiement unique) |
- **Offre d'introduction** : sur **chacun des 3 abonnements**, ajoute **7 jours
  gratuits** (parité avec l'essai web). Le « à vie » n'a pas d'essai.

### d) RevenueCat — relier produits ↔ packages
- Projet → **iOS app** : Bundle `app.quranlab` + colle le **App-Specific Shared
  Secret** (App Store Connect → ton app → **App Information → App-Specific Shared
  Secret**).
- **Entitlement** `premium` → attache-lui les 4 produits.
- **Offering** (marquée **Current**) → crée les 4 **packages** avec les identifiants
  `$rc_three_month`, `$rc_six_month`, `$rc_annual`, `$rc_lifetime`, chacun lié au
  bon produit App Store.

### e) Webhook RevenueCat (déjà codé : `app/api/webhooks/revenuecat/route.ts`)
- RevenueCat → **Integrations → Webhooks** :
  - **URL** = `https://www.quranlab.app/api/webhooks/revenuecat`
  - **Authorization header** = la **même valeur** que `REVENUECAT_WEBHOOK_SECRET` (point b).

### f) Icône de l'app
- **Dépose un PNG 1024×1024** (sans transparence, sans coins arrondis) **dans cette
  session de chat** → je branche la génération d'icônes Capacitor et je commit, pour
  que le prochain build l'embarque automatiquement.

### g) Export Compliance (à la 1ʳᵉ soumission TestFlight/App Store)
- App Store Connect te demandera si l'app utilise du chiffrement →
  réponds **« Non »/exempt** (l'app n'utilise que HTTPS standard).

### h) Compte démo + premium
1. Crée le compte **`review@quranlab.app`** depuis l'app (inscription normale).
2. Va sur **`/admin/premium`** → recherche `review@quranlab.app` → **« Donner premium »**.
3. Reporte identifiant + mot de passe dans la note de revue (section 3).

### i) Soumettre
- Remplis captures d'écran (6,5") + champs ci-dessus → **Ajouter pour vérification**.
- (Optionnel) passe `submit_to_app_store: true` dans `codemagic.yaml` quand la fiche
  est prête, ou soumets depuis l'UI App Store Connect.

---

### Ordre conseillé pour demain
**c → d → e** (produits + RevenueCat + webhook) → **b** (Vercel + redeploy) →
**a** (cert réutilisable) → **f** (icône, via le chat) → **h** (compte démo) →
remplir la fiche (textes §1, confidentialité §2, note démo §3) → **g** → **i**.
