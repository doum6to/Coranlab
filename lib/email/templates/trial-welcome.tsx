import { Button, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout, emailStyles } from "./_layout";

export function TrialWelcomeEmail({
  appUrl,
  trialEndsAt,
}: {
  appUrl: string;
  trialEndsAt: string; // formatted date, e.g. "26 avril 2026"
}) {
  return (
    <EmailLayout
      preview="Ton essai Quranlab est actif. Commence dès maintenant."
      heading="Bienvenue dans Quranlab 🌙"
    >
      <Text style={emailStyles.text}>Assalamu alaikum !</Text>
      <Text style={emailStyles.text}>
        Ton essai <strong>7 jours gratuits</strong> est actif. Tu as accès
        dès maintenant à toutes les leçons, exercices et documents PDF de
        Quranlab.
      </Text>
      <div style={emailStyles.buttonContainer}>
        <Button href={appUrl} style={emailStyles.primaryButton}>
          Accéder à l&apos;application
        </Button>
      </div>
      <Text style={emailStyles.smallText}>
        Ton trial se termine le <strong>{trialEndsAt}</strong>. Après cette
        date, ton abonnement passera automatiquement à 14,97€/mois si tu ne
        résilies pas. Tu peux résilier à tout moment en 1 clic depuis tes
        paramètres.
      </Text>
      <Text style={emailStyles.text}>
        <strong>Petit conseil</strong> : même 5 minutes par jour suffisent.
        La répétition espacée fait le reste.
      </Text>
    </EmailLayout>
  );
}
