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
- `lib/iap/revenuecat.ts` — fonctions IAP (init, prix, achat, restauration), **inertes sur le web**.
- `app/api/webhooks/revenuecat/route.ts` — octroi/retrait du premium (IAP) dans `user_subscription`.
- `app/(main)/premium/pricing/pricing-view.tsx` — paywall IAP sur iOS / Stripe sur le web.
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
4. La signature est **entièrement gérée par `codemagic.yaml`** (étape
   `fetch-signing-files --create`) : pas de toggle UI à activer. Au 1er run,
   Codemagic crée le certificat de distribution + le profil App Store.

> **Réutiliser le même certificat (recommandé)** — `fetch-signing-files` a
> besoin d'une **clé privée** pour enregistrer un certificat nouvellement créé.
> Sans elle, on génère une clé éphémère à chaque build → un **nouveau certificat
> à chaque fois** (Apple en limite ~2). Pour réutiliser le **même** certificat :
> 1. génère une clé une fois : `openssl genrsa 2048` ;
> 2. colle son contenu dans une **variable Codemagic secrète** nommée
>    `CERTIFICATE_PRIVATE_KEY` (groupe attaché au workflow) ;
> 3. le yaml la réutilise → le certificat existant est repris à chaque build.

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
   produits, puis crée une **Offering** (« default »). Les **packages** doivent
   utiliser ces identifiants (mappés dans `lib/iap/revenuecat.ts`) :

   | Plan (app) | Identifiant de package RevenueCat |
   |---|---|
   | 3 mois | `$rc_three_month` |
   | 6 mois | `$rc_six_month` |
   | Annuel | `$rc_annual` |
   | À vie | `$rc_lifetime` |
   | Essai mensuel | `$rc_monthly` |

4. Récupère la **clé publique iOS** RevenueCat (`appl_…`) →
   `NEXT_PUBLIC_REVENUECAT_IOS_KEY` (voir `.env.local.example`).
5. **Webhook RevenueCat** (déjà codé : `app/api/webhooks/revenuecat/route.ts`) :
   - Dans RevenueCat → **Integrations → Webhooks**, URL =
     `https://TON-SITE/api/webhooks/revenuecat`.
   - Mets un header **Authorization** = la valeur de `REVENUECAT_WEBHOOK_SECRET`.
   - Il accorde/retire le premium dans la **même table `user_subscription`** que
     Stripe → `getUserSubscription().isActive` fonctionne sans changement.

### Côté interface — ✅ déjà fait

`app/(main)/premium/pricing/pricing-view.tsx` :
- sur **iOS** → achat via Apple IAP (`purchasePlan`), prix réels App Store
  affichés, bouton **« Restaurer mes achats »** + liens légaux (exigés Apple) ;
- sur le **web** → checkout Stripe inchangé.

⚠️ **Anti-steering Apple** : dans l'app iOS on **n'affiche aucun lien d'achat
Stripe** (respecté). Le web garde Stripe normalement.

✅ **Pages légales** : Apple exige des liens **Conditions d'utilisation** et
**Confidentialité** fonctionnels sur le paywall. Les routes `/conditions` et
`/confidentialite` **existent** et contiennent les mentions de l'éditeur
(Mamadou Traoré, EI, SIREN 884 851 320). Renseigne aussi l'URL de
confidentialité (`https://www.quranlab.app/confidentialite`) dans App Store Connect.

### Variables d'environnement à définir (Vercel)
- `NEXT_PUBLIC_REVENUECAT_IOS_KEY` = clé publique iOS RevenueCat.
- `REVENUECAT_WEBHOOK_SECRET` = chaîne aléatoire (même valeur côté webhook RevenueCat).

---

## Étape 4 — Premier build cloud (sans Mac)

1. Pousse le repo sur GitHub (déjà fait).
2. Connecte le repo dans Codemagic → il détecte `codemagic.yaml`.
3. Renseigne les variables d'environnement dans Codemagic :
   - `CAPACITOR_SERVER_URL` = ton URL de prod (canonique : `https://www.quranlab.app`).
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
- [x] Pages légales `/conditions` et `/confidentialite` (créées, mentions éditeur OK).
- [ ] Offres d'introduction (essai 7 j) sur les produits abonnement App Store,
      pour la parité avec l'essai 7 j du web (voir note ci-dessous).

Le webhook RevenueCat et le paywall IAP sont **déjà codés** : une fois tes
produits créés et les variables d'env renseignées, ça marche. Préviens-moi quand
ton compte Apple est actif et on enchaîne (Bundle ID → fiche App Store → build).
