import type { Metadata } from "next";
import { Inter, Manrope, IBM_Plex_Sans_Arabic, Fraunces, Fredoka } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { ModalsProvider } from "@/components/modals/modals-provider";
import { ClientLocaleBoundary } from "@/components/i18n/client-locale-boundary";

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
// Serif display font for premium marketing surfaces (landing, pricing).
// Kept out of font-heading so the app UI stays on Manrope.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});
// Rounded, playful display font for the conversion landing pages.
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
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
        className={`${inter.className} ${inter.variable} ${manrope.variable} ${ibmPlexArabic.variable} ${fraunces.variable} ${fredoka.variable}`}
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
  ttq.load('D8I0EF3C77UA4F3IM190');
  ttq.page();
}(window, document, 'ttq');
          `}
        </Script>

        {/* Meta (Facebook) Pixel — fires PageView on load. Loaded after the
            page is interactive so it never blocks paint. */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '258350615443561');
fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=258350615443561&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* Microsoft Clarity — heatmaps, scroll maps and session recordings.
            Defaults to the project id; override with NEXT_PUBLIC_CLARITY_ID.
            Loaded with `lazyOnload` so it waits for the browser idle period and
            never competes with first paint / interactivity. */}
        <Script id="ms-clarity" strategy="lazyOnload">
          {`
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID || "x4b5xmffyi"}");
          `}
        </Script>

        <Toaster />
        <ClientLocaleBoundary>
          <ModalsProvider />
        </ClientLocaleBoundary>

        {children}
      </body>
    </html>
  );
}
