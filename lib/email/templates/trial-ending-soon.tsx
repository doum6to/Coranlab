import { Button, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout, emailStyles } from "./_layout";

export function TrialEndingSoonEmail({
  billingPortalUrl,
  trialEndsAt,
}: {
  billingPortalUrl: string;
  trialEndsAt: string;
}) {
  return (
    <EmailLayout
      preview="Ton trial Quranlab se termine dans 3 jours."
      heading="Plus que 3 jours d'essai ⏳"
    >
      <Text style={emailStyles.text}>
        Ton essai gratuit se termine le <strong>{trialEndsAt}</strong>. Si tu
        continues, ton abonnement passera à <strong>14,97€/mois</strong>{" "}
        automatiquement.
      </Text>
      <Text style={emailStyles.text}>
        <strong>Tu veux continuer ?</strong> Tu n&apos;as rien à faire. Tu
        restes dans l&apos;app, la facturation se fait toute seule.
      </Text>
      <Text style={emailStyles.text}>
        <strong>Tu préfères arrêter ?</strong> Aucun souci : clique ci-dessous
        pour résilier, tu ne seras pas facturé.
      </Text>
      <div style={emailStyles.buttonContainer}>
        <Button href={billingPortalUrl} style={emailStyles.secondaryButton}>
          Gérer mon abonnement
        </Button>
      </div>
      <Text style={emailStyles.smallText}>
        Résiliation en 1 clic, aucun frais. Tu gardes l&apos;accès jusqu&apos;à
        la fin de ton trial.
      </Text>
    </EmailLayout>
  );
}
