import { Button, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout, emailStyles } from "./_layout";

export function PaymentSucceededEmail({
  appUrl,
  amount,
  nextBillingAt,
}: {
  appUrl: string;
  amount: string; // "14,97€"
  nextBillingAt: string; // formatted date
}) {
  return (
    <EmailLayout
      preview="Paiement confirmé. Ton abonnement Quranlab continue."
      heading="Paiement reçu, merci 🎉"
    >
      <Text style={emailStyles.text}>
        Ton paiement de <strong>{amount}</strong> a bien été reçu. Ton
        abonnement Quranlab continue pour un mois de plus.
      </Text>
      <Text style={emailStyles.smallText}>
        Prochaine facturation le <strong>{nextBillingAt}</strong>.
      </Text>
      <div style={emailStyles.buttonContainer}>
        <Button href={appUrl} style={emailStyles.primaryButton}>
          Retour à l&apos;application
        </Button>
      </div>
      <Text style={emailStyles.smallText}>
        Tu peux modifier ton moyen de paiement ou résilier à tout moment
        depuis tes paramètres.
      </Text>
    </EmailLayout>
  );
}
