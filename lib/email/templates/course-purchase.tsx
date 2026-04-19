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

/**
 * Premium course-purchase welcome email. Matches the /85motscoran
 * landing page design language: cream background, serif italic
 * headline, warm coral accent, black pill CTA. Falls back cleanly to
 * Georgia in clients that can't load Fraunces.
 */
export function CoursePurchaseEmail({
  driveUrl,
  hasApp,
  activationUrl,
}: Props) {
  return (
    <Html lang="fr">
      <Head />
      {/*
        Note: we intentionally do NOT use @react-email/components <Font/>
        here. Email clients almost never load webfonts anyway, and a
        recent Font component version has been observed to throw "t is
        not a function" at render time under some Next/Resend combos.
        The styles below fall back to Georgia, which is universally
        available and visually matches the Fraunces direction on web.
      */}
      <Preview>
        Ton pack 85% des mots du Coran est prêt. Un clic pour y accéder.
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Logo monogram */}
          <Section style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={monogramStyle}>Q</div>
            <Text style={brandKickerStyle}>QURANLAB</Text>
          </Section>

          {/* Serif italic headline */}
          <Heading style={headlineStyle}>Ton pack est prêt.</Heading>

          <Text style={introStyle}>Assalamu alaikum,</Text>
          <Text style={bodyTextStyle}>
            Merci pour ta confiance. Ton pack{" "}
            <strong>85% des mots du Coran</strong> est disponible en un clic
            ci-dessous.
          </Text>

          {/* Primary CTA */}
          <Section style={ctaContainerStyle}>
            <Button href={driveUrl} style={primaryButtonStyle}>
              Accéder à mes documents →
            </Button>
          </Section>

          <Text style={fineprintStyle}>
            Si le bouton ne fonctionne pas, copie ce lien&nbsp;:
            <br />
            <Link href={driveUrl} style={linkStyle}>
              {driveUrl}
            </Link>
          </Text>

          {/* Optional trial activation block */}
          {hasApp && activationUrl && (
            <>
              <Hr style={dividerStyle} />
              <Heading as="h2" style={subHeadlineStyle}>
                Et l&apos;application&nbsp;?
              </Heading>
              <Text style={bodyTextStyle}>
                Tu as aussi choisi l&apos;accès à l&apos;application Quranlab.
                Crée ton compte en un clic, ton abonnement sera activé
                automatiquement.
              </Text>
              <Section style={ctaContainerStyle}>
                <Button href={activationUrl} style={secondaryButtonStyle}>
                  Créer mon compte premium
                </Button>
              </Section>
              <Text style={fineprintStyle}>
                Utilise la même adresse que celle-ci pour que l&apos;abonnement
                soit lié automatiquement.
              </Text>
            </>
          )}

          <Hr style={dividerStyle} />

          {/* Signature */}
          <Text style={signatureItalicStyle}>
            Qu&apos;Allah te facilite l&apos;apprentissage.
          </Text>
          <Text style={signatureStyle}>— L&apos;équipe Quranlab</Text>

          <Text style={supportStyle}>
            Une question&nbsp;? Réponds directement à cet email, on lit tout.
          </Text>
        </Container>

        {/* Outer bottom line */}
        <Text style={outerBrandLineStyle}>
          quranlab.app · comprends le Coran
        </Text>
      </Body>
    </Html>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  Styles — inline because email clients strip classes.
 * ───────────────────────────────────────────────────────────────────── */

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#F5F1E8",
  fontFamily: "Georgia, 'Times New Roman', Times, serif",
  margin: 0,
  padding: "48px 20px 32px",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  maxWidth: 560,
  margin: "0 auto",
  padding: "48px 44px",
  borderRadius: 20,
  border: "1px solid #E8E4D8",
  boxShadow: "0 20px 40px -30px rgba(26,26,26,0.12)",
};

const monogramStyle: React.CSSProperties = {
  display: "inline-block",
  width: 60,
  height: 60,
  lineHeight: "60px",
  backgroundColor: "#6967fb",
  color: "#F5F1E8",
  borderRadius: 14,
  fontSize: 30,
  fontWeight: 700,
  fontFamily: "Georgia, serif",
  textAlign: "center",
  verticalAlign: "middle",
};

const brandKickerStyle: React.CSSProperties = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontSize: 12,
  letterSpacing: "0.28em",
  color: "#1A1A1A",
  fontWeight: 600,
  marginTop: 14,
  marginBottom: 0,
  textAlign: "center",
};

const headlineStyle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontStyle: "italic",
  fontSize: 44,
  lineHeight: 1.05,
  color: "#1A1A1A",
  margin: "0 0 28px",
  textAlign: "center",
  fontWeight: 400,
};

const introStyle: React.CSSProperties = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontSize: 16,
  color: "#1A1A1A",
  fontWeight: 500,
  lineHeight: 1.6,
  margin: "0 0 12px",
};

const bodyTextStyle: React.CSSProperties = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontSize: 16,
  color: "#333333",
  lineHeight: 1.65,
  margin: "0 0 20px",
};

const ctaContainerStyle: React.CSSProperties = {
  textAlign: "center",
  margin: "32px 0 12px",
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#1A1A1A",
  color: "#F5F1E8",
  padding: "16px 36px",
  borderRadius: 999,
  textDecoration: "none",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontWeight: 600,
  fontSize: 15,
  letterSpacing: "0.02em",
  display: "inline-block",
};

const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#E85D3C",
  color: "#FFFFFF",
  padding: "16px 36px",
  borderRadius: 999,
  textDecoration: "none",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontWeight: 600,
  fontSize: 15,
  letterSpacing: "0.02em",
  display: "inline-block",
};

const fineprintStyle: React.CSSProperties = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontSize: 12,
  color: "#999999",
  lineHeight: 1.5,
  margin: "16px 0 0",
  textAlign: "center",
};

const linkStyle: React.CSSProperties = {
  color: "#6967fb",
  wordBreak: "break-all",
};

const dividerStyle: React.CSSProperties = {
  borderColor: "#E8E4D8",
  margin: "40px 0",
};

const subHeadlineStyle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontStyle: "italic",
  fontSize: 28,
  color: "#1A1A1A",
  margin: "0 0 16px",
  fontWeight: 400,
};

const signatureItalicStyle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontStyle: "italic",
  fontSize: 18,
  color: "#1A1A1A",
  textAlign: "center",
  margin: "0 0 8px",
  fontWeight: 400,
};

const signatureStyle: React.CSSProperties = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontSize: 14,
  color: "#666666",
  textAlign: "center",
  margin: 0,
};

const supportStyle: React.CSSProperties = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontSize: 12,
  color: "#999999",
  textAlign: "center",
  margin: "28px 0 0",
  lineHeight: 1.5,
};

const outerBrandLineStyle: React.CSSProperties = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  fontSize: 11,
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  color: "#999999",
  textAlign: "center",
  margin: "24px 0 0",
};
