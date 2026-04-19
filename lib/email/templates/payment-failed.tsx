import { Button, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout, emailStyles } from "./_layout";

export function PaymentFailedEmail({
  billingPortalUrl,
}: {
  billingPortalUrl: string;
}) {
  return (
    <EmailLayout
      preview="Ton paiement Quranlab n'est pas passé."
      heading="Ton paiement n'a pas pu aboutir"
    >
      <Text style={emailStyles.text}>
        On a tenté de renouveler ton abonnement Quranlab, mais le paiement
        n&apos;est pas passé (carte expirée, fonds insuffisants, ou refus
        bancaire).
      </Text>
      <Text style={emailStyles.text}>
        <strong>Pour conserver ton accès</strong>, mets à jour ton moyen de
        paiement dans les prochains jours. Stripe retentera automatiquement.
      </Text>
      <div style={emailStyles.buttonContainer}>
        <Button href={billingPortalUrl} style={emailStyles.primaryButton}>
          Mettre à jour ma carte
        </Button>
      </div>
      <Text style={emailStyles.smallText}>
        Si tu préfères arrêter, tu n&apos;as rien à faire : ton abonnement
        sera annulé automatiquement après plusieurs échecs de paiement.
      </Text>
    </EmailLayout>
  );
}
