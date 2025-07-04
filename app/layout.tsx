import type { Metadata, Viewport } from "next";
import { Montserrat, Roboto } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";
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
  metadataBase: new URL("https://www.streamscapex.live"),
  title: {
    default: "StreamScapeX - Watch Movies & TV Shows Online",
    template: "%s | StreamScapeX",
  },
  description:
    "Stream your favorite movies and TV shows in HD quality. Watch the latest releases and popular classics on StreamScapeX.",
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
  authors: [{ name: "ice", url: "https://www.streamscapex.live" }],
  creator: "ice",
  publisher: "StreamScapeX",
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
    canonical: "https://www.streamscapex.live",
    languages: {
      "en-US": "https://www.streamscapex.live",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.streamscapex.live",
    siteName: "StreamScapeX",
    title: "StreamScapeX - Your Ultimate Streaming Platform",
    description:
      "Stream your favorite movies and TV shows in HD quality. Watch the latest releases and popular classics on StreamScapeX.",
    images: [
      {
        url: "https://www.streamscapex.live/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StreamScapeX - Watch Movies & TV Shows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamScapeX - Watch Movies & TV Shows",
    description:
      "Stream your favorite movies and TV shows in HD quality. Watch the latest releases and popular classics on StreamScapeX.",
    images: ["https://www.streamscapex.live/twitter-image.jpg"],
    creator: "@StreamScapeX",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon-precomposed.svg",
      },
    ],
  },
  verification: {
    google: "googleca5e3c6b4470fb54", // Using the file name from your public directory
    yandex: "yandexverificationcode",
    yahoo: "yahooVerificationCode",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />

        {/* Preload critical assets */}
        <link rel="preload" as="image" href="/logo.svg" />
        <link rel="preload" as="image" href="/og-image.jpg" />

        {/* Remove this line - globals.css is already imported */}
        {/* <link rel="preload" href="/globals.css" as="style" /> */}
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
              name: "StreamScapeX",
              url: "https://www.streamscapex.live",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://www.streamscapex.live/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
              description:
                "Stream your favorite movies and TV shows in HD quality. Watch the latest releases and popular classics on StreamScapeX.",
              publisher: {
                "@type": "Organization",
                name: "StreamScapeX",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.streamscapex.live/logo.png",
                  width: 112,
                  height: 112,
                },
                sameAs: [
                  "https://facebook.com/streamscapex",
                  "https://twitter.com/streamscapex",
                  "https://instagram.com/streamscapex",
                ],
              },
              inLanguage: "en-US",
              copyrightYear: "2025",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
