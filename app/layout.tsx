import type { Metadata } from "next";
import { Inter, Manrope, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quranlab - Apprends 85% des mots du Coran",
  description: "Application d'apprentissage du vocabulaire coranique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.className} ${inter.variable} ${manrope.variable} ${ibmPlexArabic.variable}`}
      >
        {/* Enables :active pseudo-class on iOS Safari so that
            active:scale / active:translate-y animations fire on tap */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener('touchstart',function(){},{passive:true});`,
          }}
        />
        <Toaster />
        <ExitModal />
        <HeartsModal />

        {children}
      </body>
    </html>
  );
}
