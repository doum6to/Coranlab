# Publier Quranlab sur l'App Store iOS — sans Mac

Ce guide explique comment mettre l'app sur l'App Store **sans posséder de Mac**,
avec **paiements via In-App Purchase (IAP) d'Apple** (obligatoire pour vendre du
contenu numérique dans l'app).

L'app reste ton site Next.js : Capacitor l'enveloppe dans une coquille iOS
native qui charge ton site déployé. La compilation/signature/soumission se font
dans le cloud (Codemagic), donc **aucun Mac n'est nécessaire**.

---

## Vue d'ensemble

```
Site Next.js (déjà déployé)
        │  chargé dans une WebView
        ▼
Coquille iOS Capacitor  ──►  IAP Apple (via RevenueCat)
        │                          │ webhook serveur-à-serveur
        │  build cloud             ▼
        ▼                    notre backend accorde le premium
Codemagic (Mac dans le cloud)
        │
        ▼
App Store Connect → TestFlight → App Store
```

## Ce qui est déjà en place dans le repo

- `capacitor.config.ts` — config de la coquille (appId `app.quranlab`, charge `CAPACITOR_SERVER_URL`).
- `mobile/www/index.html` — écran de secours si le site est injoignable.
- `codemagic.yaml` — pipeline de build & publication cloud (sans Mac).
- `lib/platform.ts` — détecte si on est dans l'app iOS (sinon : web inchangé).
- `lib/iap/revenuecat.ts` — fonctions IAP (init, achat, restauration), **inertes sur le web**.
- Scripts npm : `cap:add:ios`, `cap:sync`, `cap:open`.

Le dossier natif `ios/` n'est **pas** committé : il est généré automatiquement
dans le cloud par `npx cap add ios` au premier build.

---

## Étape 1 — Comptes à créer (les seules choses payantes/obligatoires)

1. **Apple Developer Program — 99 $/an**
   https://developer.apple.com/programs/ — inscription possible sur PC/web.
   (Validation possible sous 24–48 h ; parfois un appel/vérification d'identité.)
2. **App Store Connect** (inclus) → crée une nouvelle app :
   - Bundle ID : `app.quranlab` (doit correspondre à `capacitor.config.ts`).
   - Note le **Apple ID numérique** de l'app (ex. `1234567890`).
3. **Codemagic** (build cloud) — https://codemagic.io — connexion via GitHub. Offre gratuite ~500 min/mois.
4. **RevenueCat** (gère l'IAP) — https://www.revenuecat.com — offre gratuite jusqu'à un gros volume.

---

## Étape 2 — Clé API App Store Connect (pour signer/publier sans Mac)

1. App Store Connect → **Users and Access → Integrations → App Store Connect API**.
2. Génère une clé avec le rôle **App Manager**. Télécharge le fichier `.p8`
   (téléchargeable **une seule fois**) et note **Key ID** + **Issuer ID**.
3. Dans **Codemagic → Teams/User settings → Integrations → App Store Connect** :
   ajoute la clé. Donne-lui le nom **`codemagic_asc_api_key`** (référencé dans `codemagic.yaml`).
4. Dans Codemagic, active **Automatic code signing** pour le bundle `app.quranlab`.
   Codemagic crée/gère les certificats et profils tout seul (plus besoin de Mac/Keychain).

---

## Étape 3 — Configurer l'In-App Purchase (RevenueCat)

> Apple **interdit Stripe** pour vendre du contenu numérique *dans* l'app : il
> faut l'IAP (commission 15–30 %). RevenueCat simplifie StoreKit et nous permet
> d'accorder le premium côté serveur via un webhook.

1. **App Store Connect → ton app → In-App Purchases / Subscriptions** : crée tes
   produits (ex. abonnement `premium_monthly`, `premium_annual`, ou non-renouvelable).
   Renseigne prix, descriptions, et la **Subscription Group** si abonnement.
2. **RevenueCat** : crée un projet → ajoute l'app iOS (bundle `app.quranlab`) →
   colle le **App-Specific Shared Secret** (depuis App Store Connect).
3. RevenueCat : crée une **Entitlement** nommée **`premium`**, attache-lui tes
   produits, puis crée une **Offering** (« default ») avec les packages.
4. Récupère la **clé publique iOS** RevenueCat (`appl_…`) →
   mets-la dans la variable `NEXT_PUBLIC_REVENUECAT_IOS_KEY` (voir `.env.local.example`).
5. **Webhook RevenueCat → notre backend** : crée une route API (ex.
   `app/api/webhooks/revenuecat/route.ts`) qui, à la réception d'un achat/renouvellement,
   accorde le premium à l'utilisateur connecté — **réutilise la même logique
   d'octroi que le webhook Stripe** (table `user_subscription`). C'est la source de vérité.

### Côté interface (à faire dans l'app)

Dans les écrans qui vendent le premium (`app/(main)/premium/…`), branche :

```ts
import { isNativeIOS } from "@/lib/platform";
import { purchasePremium, restorePurchases } from "@/lib/iap/revenuecat";

// if (isNativeIOS()) -> bouton "S'abonner" qui appelle purchasePremium()
//                       + un bouton "Restaurer mes achats" (exigé par Apple)
// else               -> le checkout Stripe actuel (inchangé)
```

⚠️ **Anti-steering Apple** : dans l'app iOS, **n'affiche aucun lien/bouton**
renvoyant vers un achat Stripe sur le web (sinon rejet). Le web (Safari) garde
Stripe normalement.

---

## Étape 4 — Premier build cloud (sans Mac)

1. Pousse le repo sur GitHub (déjà fait).
2. Connecte le repo dans Codemagic → il détecte `codemagic.yaml`.
3. Renseigne les variables d'environnement dans Codemagic :
   - `CAPACITOR_SERVER_URL` = ton URL de prod (ex. `https://quranlab.app`).
   - `APP_STORE_APPLE_ID` = l'Apple ID numérique de l'app.
4. Lance le workflow **`ios-capacitor`**. Codemagic va :
   `npm ci` → `cap add ios` → `cap sync` → `pod install` → build signé →
   upload vers **TestFlight**.
5. Installe **TestFlight** sur ton iPhone et teste l'app + un achat IAP (sandbox).

---

## Étape 5 — Soumission App Store

1. Dans App Store Connect : ajoute **captures d'écran**, description, mots-clés,
   politique de confidentialité (URL), catégorie, et **les infos de test pour
   l'IAP** (compte de démo si nécessaire).
2. Passe `submit_to_app_store: true` dans `codemagic.yaml` (ou soumets depuis l'UI).
3. Relance le build → la version part en revue Apple (≈ 24–48 h en général).

---

## Pièges Apple à connaître

- **Guideline 4.2 (minimum functionality)** : une app « simple site web emballé »
  peut être refusée. Atouts pour passer : les leçons interactives, et idéalement
  des notifications push + un minimum de comportement natif.
- **IAP obligatoire** pour tout déblocage de contenu numérique dans l'app.
- **Restaurer les achats** : bouton obligatoire (déjà prévu : `restorePurchases`).
- **Compte de test** : fournis à Apple un accès de démonstration au contenu premium.
- **Confidentialité** : remplis la *Privacy Nutrition Label* (données collectées).

## Ce qu'il te reste à fournir / décider

- [ ] Compte Apple Developer (99 $/an) + bundle ID confirmé (`app.quranlab` ?).
- [ ] Clé API App Store Connect dans Codemagic.
- [ ] Produits IAP créés + projet RevenueCat + clé `NEXT_PUBLIC_REVENUECAT_IOS_KEY`.
- [ ] URL de prod exacte pour `CAPACITOR_SERVER_URL`.
- [ ] Icône app + écran de lancement + captures d'écran App Store.

Quand tu as ces éléments, je peux : écrire le webhook RevenueCat, brancher le
paywall IAP dans les écrans premium, et ajuster `codemagic.yaml`.
