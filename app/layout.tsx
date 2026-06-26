import type { Metadata, Viewport } from "next";
import { Inter, Outfit, IBM_Plex_Mono } from 'next/font/google';
import "./globals.css";
import AppProviders from "@/components/ui/AppProviders";
import ServiceWorkerRegistrar from "@/components/ui/ServiceWorkerRegistrar";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Productivity Master — Build daily habits that actually stick",
  description: "Premium habit tracker for routines, streaks, and self-growth. Track, analyze, and stay consistent — beautifully.",
  manifest: "/manifest.json",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🙂</text></svg>",
    apple: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🙂</text></svg>",
  },
  openGraph: {
    title: "Productivity Master",
    description: "Premium habit tracker for routines, streaks, and self-growth.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Productivity Master",
  },
};

// NOTE: maximumScale/userScalable=false breaks pinch-zoom for low-vision users
// and is a WCAG 1.4.4 violation. Default initialScale=1 is enough — we don't
// need to lock zoom for a habit tracker.
export const viewport: Viewport = {
  themeColor: "#555555",
  width: "device-width",
  initialScale: 1,
};

import { Suspense } from 'react';

function ProvidersFallback() {
  return null; // Minimal fallback for providers
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${plexMono.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon.png" />
        <link rel="shortcut icon" href="/icon.png" />
        <script
          // Prevent flash of wrong theme — runs before paint.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;var la='#0071e3';document.documentElement.style.setProperty('--accent-primary',la);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full">
        <Suspense fallback={<ProvidersFallback />}>
          <AppProviders>{children}</AppProviders>
        </Suspense>
        <ServiceWorkerRegistrar />
        <SpeedInsights />
      </body>
    </html>
  );
}
