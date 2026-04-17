import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type Props = {
  driveUrl: string;
  hasApp: boolean;
  activationUrl: string | null;
};

export function CoursePurchaseEmail({ driveUrl, hasApp, activationUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        Ton cours 85% des mots du Coran est prêt. Clique pour accéder aux
        documents.
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>Bienvenue dans Quranlab 🌙</Heading>

          <Text style={styles.text}>
            Assalamu alaikum, et merci pour ta confiance !
          </Text>
          <Text style={styles.text}>
            Ton pack <strong>85% des mots du Coran</strong> est prêt. Clique
            sur le bouton ci-dessous pour accéder à tes documents.
          </Text>

          <Section style={styles.buttonContainer}>
            <Button href={driveUrl} style={styles.primaryButton}>
              Accéder à mes documents
            </Button>
          </Section>

          <Text style={styles.smallText}>
            Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :
            <br />
            <Link href={driveUrl} style={styles.link}>
              {driveUrl}
            </Link>
          </Text>

          {hasApp && activationUrl && (
            <>
              <Hr style={styles.hr} />
              <Heading as="h2" style={styles.h2}>
                Active ton accès à l&apos;application
              </Heading>
              <Text style={styles.text}>
                Tu as également choisi l&apos;abonnement à l&apos;application
                Quranlab. Crée ton compte dès maintenant pour débloquer toutes
                les fonctionnalités premium.
              </Text>
              <Section style={styles.buttonContainer}>
                <Button href={activationUrl} style={styles.secondaryButton}>
                  Créer mon compte premium
                </Button>
              </Section>
              <Text style={styles.smallText}>
                Utilise la même adresse email que celle-ci pour que ton
                abonnement soit automatiquement lié à ton compte.
              </Text>
            </>
          )}

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            Une question ? Réponds simplement à cet email, on est là pour
            t&apos;aider.
          </Text>
          <Text style={styles.footer}>
            — L&apos;équipe Quranlab
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f5f5f5",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: "#ffffff",
    maxWidth: "560px",
    margin: "40px auto",
    padding: "40px 32px",
    borderRadius: "16px",
    border: "2px solid #e8e8e8",
  },
  h1: {
    color: "#1a1a1a",
    fontSize: "28px",
    fontWeight: 700,
    lineHeight: "1.3",
    margin: "0 0 24px",
  },
  h2: {
    color: "#1a1a1a",
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 16px",
  },
  text: {
    color: "#333333",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 16px",
  },
  smallText: {
    color: "#666666",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 16px",
  },
  buttonContainer: {
    textAlign: "center" as const,
    margin: "28px 0",
  },
  primaryButton: {
    backgroundColor: "#6967fb",
    color: "#ffffff",
    padding: "14px 32px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "16px",
    display: "inline-block",
  },
  secondaryButton: {
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    padding: "14px 32px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "16px",
    display: "inline-block",
  },
  link: {
    color: "#6967fb",
    wordBreak: "break-all" as const,
  },
  hr: {
    borderColor: "#e8e8e8",
    margin: "32px 0",
  },
  footer: {
    color: "#999999",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 8px",
  },
};
