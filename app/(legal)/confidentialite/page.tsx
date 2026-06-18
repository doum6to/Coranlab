import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Quranlab",
  description: "Comment Quranlab collecte et traite tes données personnelles.",
};

const CONTACT_EMAIL = "contact@quranlab.app";
const UPDATED = "18 juin 2026";

export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p>
        <em>Dernière mise à jour : {UPDATED}</em>
      </p>

      <p>
        La présente politique explique quelles données personnelles sont
        collectées lorsque tu utilises l&apos;application et le site Quranlab
        (ci-après « le Service »), pourquoi elles le sont, et quels sont tes
        droits. Le responsable du traitement est{" "}
        <strong>[Nom de l&apos;éditeur / société]</strong>,{" "}
        <strong>[adresse]</strong>. Pour toute question :{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>1. Données que nous collectons</h2>
      <ul>
        <li>
          <strong>Compte</strong> : adresse email et identifiant de compte
          (création et connexion).
        </li>
        <li>
          <strong>Progression d&apos;apprentissage</strong> : leçons suivies,
          scores, préférences (langue, etc.).
        </li>
        <li>
          <strong>Paiement</strong> : lors d&apos;un achat, les données de
          paiement sont traitées <em>directement</em> par nos prestataires
          (Stripe sur le web, Apple / RevenueCat dans l&apos;application iOS).
          Nous ne stockons jamais ton numéro de carte ; nous conservons
          uniquement le statut de ton abonnement.
        </li>
        <li>
          <strong>Données techniques et d&apos;usage</strong> : pages vues,
          interactions, type d&apos;appareil, à des fins de fonctionnement et de
          mesure d&apos;audience.
        </li>
      </ul>

      <h2>2. Finalités</h2>
      <ul>
        <li>fournir et faire fonctionner le Service (compte, progression) ;</li>
        <li>gérer les abonnements et les paiements ;</li>
        <li>t&apos;envoyer des emails liés au service (accès, reçus, support) ;</li>
        <li>améliorer le Service et mesurer son audience ;</li>
        <li>respecter nos obligations légales.</li>
      </ul>

      <h2>3. Prestataires (sous-traitants)</h2>
      <p>
        Nous partageons certaines données, strictement nécessaires, avec des
        prestataires qui agissent pour notre compte :
      </p>
      <ul>
        <li><strong>Supabase</strong> — authentification et base de données.</li>
        <li><strong>Vercel</strong> — hébergement du Service.</li>
        <li><strong>Stripe</strong> — paiements sur le web.</li>
        <li><strong>Apple &amp; RevenueCat</strong> — paiements intégrés (In-App Purchase) sur iOS.</li>
        <li><strong>Resend</strong> — envoi des emails transactionnels.</li>
        <li><strong>TikTok</strong> — mesure d&apos;audience et de conversion publicitaire.</li>
      </ul>
      <p>
        Certains de ces prestataires peuvent traiter des données hors de
        l&apos;Union européenne, avec les garanties appropriées prévues par le
        RGPD.
      </p>

      <h2>4. Durée de conservation</h2>
      <p>
        Tes données sont conservées tant que ton compte est actif, puis pendant
        la durée nécessaire au respect de nos obligations légales (notamment
        comptables pour les achats). Tu peux demander la suppression de ton
        compte à tout moment.
      </p>

      <h2>5. Tes droits</h2>
      <p>
        Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de
        rectification, d&apos;effacement, de limitation, d&apos;opposition et de
        portabilité de tes données. Pour les exercer, écris-nous à{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Tu peux aussi
        introduire une réclamation auprès de la CNIL (www.cnil.fr).
      </p>

      <h2>6. Cookies et traceurs</h2>
      <p>
        Le Service utilise des cookies et identifiants nécessaires à son
        fonctionnement ainsi que des traceurs de mesure d&apos;audience. Tu peux
        configurer ton navigateur ou ton appareil pour les limiter.
      </p>

      <h2>7. Enfants</h2>
      <p>
        Le Service n&apos;est pas destiné aux enfants de moins de 13 ans sans le
        consentement d&apos;un parent ou tuteur.
      </p>

      <h2>8. Modifications</h2>
      <p>
        Cette politique peut être mise à jour. La date de dernière mise à jour
        figure en haut de cette page.
      </p>

      <h2>9. Contact</h2>
      <p>
        Pour toute question relative à tes données :{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
