import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

/**
 * Shared email layout for Quranlab transactional emails. Keeps branding
 * consistent across trial-welcome, trial-ending-soon, payment-succeeded,
 * payment-failed.
 */
export function EmailLayout({
  preview,
  heading,
  children,
  footer = "— L'équipe Quranlab",
}: {
  preview: string;
  heading: string;
  children: React.ReactNode;
  footer?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>{heading}</Heading>
          {children}
          <Hr style={styles.hr} />
          <Text style={styles.footer}>{footer}</Text>
          <Text style={styles.footerSmall}>
            Quranlab · contact@quranlab.app
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailSection({ children }: { children: React.ReactNode }) {
  return <Section style={{ margin: "20px 0" }}>{children}</Section>;
}

export const emailStyles = {
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
};

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
  hr: {
    borderColor: "#e8e8e8",
    margin: "32px 0",
  },
  footer: {
    color: "#666666",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 8px",
  },
  footerSmall: {
    color: "#999999",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "0",
  },
};
