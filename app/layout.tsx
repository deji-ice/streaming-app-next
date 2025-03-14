import type { Metadata, Viewport } from "next";
import { Montserrat, Roboto } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsent   from "@/components/layout/CookieConsent";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { GoogleTagManager } from "@next/third-parties/google";

import AdBlockBanner from "@/components/layout/AdBlockBanner";
import Script from "next/script";



const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true, // Ensure font preloading
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto",
  display: "swap",
  preload: true, // Ensure font preloading
});

export const metadata: Metadata = {
  metadataBase: new URL("https://streamscape.vercel.app"),
  title: {
    default: "StreamScape - Watch Movies & TV Shows Online",
    template: "%s | StreamScape",
  },
  description:
    "Stream your favorite movies and TV shows in HD quality. Watch the latest releases and popular classics on StreamScape.",
  keywords: [
    "streaming platform",
    "movies online",
    "TV shows",
    "watch films",
    "HD streaming",
    "entertainment",
    "free movies",
    "popular series",
    "binge watch",
  ],
  authors: [{ name: "ice", url: "https://streamscape.vercel.app" }],
  creator: "ice",
  publisher: "StreamScape",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://streamscape.vercel.app",
    languages: {
      "en-US": "https://streamscape.vercel.app",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://streamscape.vercel.app",
    siteName: "StreamScape",
    title: "StreamScape - Your Ultimate Streaming Platform",
    description:
      "Stream your favorite movies and TV shows in HD quality. Watch the latest releases and popular classics on StreamScape.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StreamScape - Watch Movies & TV Shows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamScape - Watch Movies & TV Shows",
    description: "Stream your favorite movies and TV shows in HD quality",
    images: ["/twitter-image.jpg"],
    creator: "@streamscape",
  },
  category: "entertainment",
};


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zooming for accessibility
  userScalable: true, // Allow users to zoom
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />

        {/* Preload critical assets */}
        <link rel="preload" as="image" href="/logo.png" />
        <link rel="preload" as="image" href="/og-image.jpg" />

        {/* Preload critical CSS */}
        <link rel="preload" href="/globals.css" as="style" />
      </head>
      <body
        className={`${montserrat.variable} ${roboto.variable} antialiased bg-[#f8f9fa] dark:bg-gray-950 transition-colors duration-300`}
      >
        {/* skip to content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-primary focus:text-white focus:z-50"
        >
          Skip to content
        </a>

        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AdBlockBanner />
            <Navbar />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <Footer />
            <CookieConsent />
          </ThemeProvider>
        </Providers>

        <Analytics />
        <GoogleTagManager gtmId="GTM-PSDLSB6V" />
        {/* Google Analytics 4 */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-BLDSSJGKXF`} // Replace with your GA4 ID
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-BLDSSJGKXF');
    `}
        </Script>
        {/* data for SEO */}
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "StreamScape",
              url: "https://streamscape.vercel.app",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://streamscape.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
              description:
                "Stream your favorite movies and TV shows in HD quality",
              publisher: {
                "@type": "Organization",
                name: "StreamScape",
                logo: {
                  "@type": "ImageObject",
                  url: "https://streamscape.vercel.app/logo.png",
                },
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
