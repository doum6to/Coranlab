import type { Metadata } from "next";
import { Inter, Manrope, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ModalsProvider } from "@/components/modals/modals-provider";

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
      <head>
        {/* Preload the onboarding intro mascot animation so it's already
            in the browser cache by the time the user lands on /onboarding.
            Without this, the .riv file starts downloading only when the
            Rive runtime mounts, which delays the first frame and breaks
            the sync with timed UI (e.g. the title beat at 1.36s). */}
        <link
          rel="preload"
          href="/animations/hi_ok.riv"
          as="fetch"
          crossOrigin="anonymous"
          type="application/octet-stream"
        />
        <link
          rel="preload"
          href="/animations/okok.riv"
          as="fetch"
          crossOrigin="anonymous"
          type="application/octet-stream"
        />
        <link
          rel="preload"
          href="/animations/eyes_down.riv"
          as="fetch"
          crossOrigin="anonymous"
          type="application/octet-stream"
        />
        <link
          rel="preload"
          href="/animations/mascot_breath.riv"
          as="fetch"
          crossOrigin="anonymous"
          type="application/octet-stream"
        />
        <link
          rel="preload"
          href="/animations/completed_lvl.riv"
          as="fetch"
          crossOrigin="anonymous"
          type="application/octet-stream"
        />
        <link
          rel="preload"
          href="/animations/loading.riv"
          as="fetch"
          crossOrigin="anonymous"
          type="application/octet-stream"
        />
      </head>
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
        <ModalsProvider />

        {children}
      </body>
    </html>
  );
}
