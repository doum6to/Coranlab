import Foundation

// Mirror of lib/list-images.ts — maps a list title to its illustration asset
// (the same PNGs bundled from /public/lists). Asset names are "list_<file>".
enum ListImages {
    private static let map: [String: String] = [
        // Partie I — Les Fondements
        "Pronoms Démonstratifs": "puzzle",
        "Négations & Exceptions": "negations",
        "Mots Interrogatifs": "interrogation",
        "Prépositions": "lanterne",
        "Particules": "tiktak",
        "Connecteurs": "carres",
        "Divers": "fleche",
        // Partie II — Noms et Adjectifs
        "Noms & Attributs d'Allah": "lanterne",
        "Attributs / Adjectifs": "papier",
        "Prophètes & Messagers": "coupe",
        "Signes & Bénédictions": "vraifaux",
        "Deen": "lanterne",
        "Foi": "idee",
        "Actes": "chess",
        "Le Dernier Jour": "thinking",
        "La Vie Présente": "cahier",
        "Proches": "rubiks",
        "Divers (Noms)": "fleche",
        "Pluriels Irréguliers": "find",
        // Partie III — Les Formes Verbales
        "Forme II": "carres",
        "Forme III": "tiktak",
        "Forme IV": "puzzle",
        "Forme V": "negations",
        "Formes VI & VII": "interrogation",
        "Forme VIII": "papier",
        "Formes IX & X": "coupe",
        "Forme I - Partie 1": "chess",
        "Forme I - Partie 2": "cahier",
        "Verbes Irréguliers - Partie 1": "rubiks",
        "Verbes Irréguliers - Partie 2": "find",
    ]

    /// Returns the asset-catalog image name for a list title.
    static func asset(for title: String) -> String {
        "list_" + (map[title] ?? "puzzle")
    }
}
