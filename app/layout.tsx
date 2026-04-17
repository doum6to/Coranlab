import type { Metadata } from "next";
import { Inter, Manrope, IBM_Plex_Sans_Arabic } from "next/font/google";
import Script from "next/script";
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
        <link
          rel="preload"
          href="/animations/bad.riv"
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

        {/* TikTok Pixel — fires ttq.page() on every page load for ad
            attribution and retargeting. Loaded after the page is
            interactive so it never blocks paint. */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('D2EE5VRC77U9TM002EK0');
  ttq.page();
}(window, document, 'ttq');
          `}
        </Script>

        <Toaster />
        <ModalsProvider />

        {children}
      </body>
    </html>
  );
}
