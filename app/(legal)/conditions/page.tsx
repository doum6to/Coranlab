import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — Quranlab",
  description: "Conditions générales d'utilisation et de vente du service Quranlab.",
};

const CONTACT_EMAIL = "contact@quranlab.app";
const UPDATED = "18 juin 2026";

export default function ConditionsPage() {
  return (
    <>
      <h1>Conditions d&apos;utilisation</h1>
      <p>
        <em>Dernière mise à jour : {UPDATED}</em>
      </p>

      <p>
        Les présentes conditions générales (« Conditions ») régissent
        l&apos;utilisation de l&apos;application et du site Quranlab (« le
        Service »), édités par <strong>[Nom de l&apos;éditeur / société]</strong>,{" "}
        <strong>[adresse]</strong> (« nous »). En créant un compte ou en
        utilisant le Service, tu acceptes ces Conditions.
      </p>

      <h2>1. Le Service</h2>
      <p>
        Quranlab propose un service d&apos;apprentissage (leçons, exercices,
        contenus) accessible gratuitement pour une partie, et via un abonnement
        ou un achat « Premium » pour l&apos;accès complet.
      </p>

      <h2>2. Compte</h2>
      <p>
        Tu es responsable de l&apos;exactitude des informations de ton compte et
        de la confidentialité de tes identifiants. Tu t&apos;engages à un usage
        personnel et licite du Service.
      </p>

      <h2>3. Abonnements et achats</h2>
      <p>
        Le Premium est proposé sous forme d&apos;abonnements (par ex. 3 mois,
        6 mois, annuel) ou d&apos;un achat « à vie ». Les prix applicables sont
        affichés avant l&apos;achat.
      </p>
      <h3>3.1 Achats sur le web</h3>
      <p>
        Les paiements sur le site sont traités par <strong>Stripe</strong>. Les
        abonnements se renouvellent automatiquement à la fin de chaque période ;
        tu peux les résilier à tout moment depuis ton espace de gestion, la
        résiliation prenant effet à la fin de la période en cours.
      </p>
      <h3>3.2 Achats intégrés sur iOS (In-App Purchase)</h3>
      <ul>
        <li>
          Le paiement est débité de ton <strong>compte Apple</strong> à la
          confirmation de l&apos;achat.
        </li>
        <li>
          L&apos;abonnement <strong>se renouvelle automatiquement</strong> sauf
          si le renouvellement automatique est désactivé{" "}
          <strong>au moins 24 heures avant la fin de la période</strong> en
          cours.
        </li>
        <li>
          Ton compte est débité du renouvellement dans les 24 heures précédant
          la fin de la période, au tarif indiqué.
        </li>
        <li>
          Tu peux gérer ou désactiver le renouvellement dans les{" "}
          <strong>réglages de ton compte Apple</strong>, après l&apos;achat.
        </li>
        <li>
          La fonction « Restaurer mes achats » permet de récupérer un achat
          existant sur un nouvel appareil.
        </li>
      </ul>

      <h2>4. Droit de rétractation</h2>
      <p>
        Pour les contenus numériques fournis immédiatement, tu reconnais que
        l&apos;exécution commence dès l&apos;achat et renonces, le cas échéant, à
        ton droit de rétractation conformément à la réglementation applicable.
        Les achats effectués via l&apos;App Store sont par ailleurs soumis aux
        conditions et procédures de remboursement d&apos;Apple.
      </p>

      <h2>5. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus du Service (textes, leçons, visuels,
        marques, logiciels) est protégé. Aucune reproduction ou diffusion
        n&apos;est autorisée sans accord écrit préalable.
      </p>

      <h2>6. Responsabilité</h2>
      <p>
        Le Service est fourni « en l&apos;état ». Nous mettons tout en œuvre pour
        en assurer la disponibilité et la qualité, sans garantir une absence
        totale d&apos;interruption ou d&apos;erreur.
      </p>

      <h2>7. Résiliation</h2>
      <p>
        Tu peux cesser d&apos;utiliser le Service et supprimer ton compte à tout
        moment. Nous pouvons suspendre un compte en cas de manquement aux
        présentes Conditions.
      </p>

      <h2>8. Modifications</h2>
      <p>
        Nous pouvons modifier ces Conditions. La date de dernière mise à jour
        figure en haut de cette page.
      </p>

      <h2>9. Droit applicable</h2>
      <p>
        Les présentes Conditions sont régies par le droit français. En cas de
        litige, une solution amiable sera recherchée avant toute action
        judiciaire.
      </p>

      <h2>10. Contact</h2>
      <p>
        Pour toute question :{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
