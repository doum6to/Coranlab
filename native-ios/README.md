# Quranlab — iOS natif (SwiftUI)

Réécriture **native SwiftUI** de l'app web Quranlab, fidèle au design web
(mêmes couleurs, mêmes illustrations, même UI), branchée sur le **backend
existant** (Supabase + endpoints `/api/native/*` + RevenueCat).

## Ouvrir / builder le projet

Le projet utilise **XcodeGen** (le `.xcodeproj` n'est pas committé).

```bash
brew install xcodegen        # si besoin
cd Quranlab-iOS
xcodegen generate            # crée Quranlab.xcodeproj
open Quranlab.xcodeproj
```

Cible iOS 16+. Les dépendances (Supabase, RevenueCat) sont résolues via SPM au
premier build. Le build CI peut aussi passer par ton `codemagic.yaml`.

## Ce qui est fidèle au web (fait)

**Design system exact** (`Theme.swift`) — palette « brilliant » (#6967fb…),
rayons 16px, ombre carte `0 4px 0 0 #D4D4D4`, bordure #E0E0E0, dégradé premium,
le tout repris verbatim de `tailwind.config.ts` / `globals.css`.

**Composants** — `ShinyButton` (bouton 3D qui s'enfonce de 4px au tap, 5
variantes + balayage), `ListCard` (carte 230pt, bordure + lip, barre de
progression, illustration en blend « darken », CTA), `UnitBanner`, carousel
horizontal avec pastilles, `MascotView` (mascotte SVG avec float « respiration »).

**Écrans**
- **Apprendre / Leçons** — feed blanc, bannière d'unité, carousel de ListCards
  avec **tes vraies illustrations** (`/public/lists/*.png` embarquées).
- **Navigation par onglets** façon web : Apprendre · Leçons · Classement ·
  Quêtes · Réglages (icônes SVG d'origine).
- **Classement / Quêtes** — coquilles visuelles fidèles (ligues, jalons XP).
- **Réglages** — câblés à la vraie session (email, déconnexion).

**Flux de leçon complet** (`LessonView` + `Exercises.swift`) avec routage par
type d'exercice, header (X + barre de progression) et sons réels
(`correct.wav` / `incorrect.wav` / `finish.mp3`) :
- **QCM, QCM_INVERSE, VRAI_FAUX, OPPOSITE, CONFIDENCE_BET, SPOT_THE_ERROR** —
  prompt arabe + grille d'options 2×2, états sélection/correct/faux aux **hex
  exacts du web**, footer Vérifier → panneau résultat → Suivant.
- **MATCHING** — deux colonnes (arabe / français mélangé), appariement au tap,
  flash rouge si erreur, auto-complétion.
- **FLASHCARD** — phase découverte (cartes qui se retournent en 3D) puis phase
  association, par paquets de 2/4.
- **ANAGRAM** — assemblage de lettres (tap pour placer/retirer), Vérifier /
  Réinitialiser, affichage de la réponse si erreur.
- **FLASH_RECALL** — mémorisation du mot arabe ~2s (barre décroissante) puis
  révélation des options.

## Couche données réutilisée (inchangée)

`SessionStore` (auth Supabase), `LearnStore`, `LessonStore`, `PaywallStore`
(RevenueCat), `SupabaseConfig`, modèles — déjà fonctionnels sur ton backend.

## Notes & prochaines étapes

- **Compilation non testée ici** : le projet a été écrit dans un environnement
  Linux (pas de SDK Apple), avec vérifications statiques (équilibrage,
  références, types). Prévoir une passe d'ajustements visuels au 1er build Xcode.
- **Animations Rive** : les `.riv` (mascotte) sont embarqués dans
  `Resources/animations/`. Pour les activer : ajouter le package SPM
  `rive-app/rive-ios` (produit `RiveRuntime`) et remplacer l'`Image` de
  `MascotView` par `RiveViewModel(fileName:).view()`. Pour l'instant la mascotte
  statique anime un léger float (fidèle à `mascot_breath`).
- **Polices** : le web utilise Manrope / IBM Plex Arabic / Amiri. Ici on
  approxime avec les polices système (serif pour l'arabe). Pour une fidélité
  typographique parfaite : ajouter les `.ttf` + clé `UIAppFonts` dans Info.plist.
- **Classement / Quêtes** : il manque les endpoints natifs (ligues, points XP)
  pour brancher les données réelles ; le visuel est en place.
