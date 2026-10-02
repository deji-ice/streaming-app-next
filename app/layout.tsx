import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TabBar from "@/components/layout/TabBar";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { Providers } from "./providers";
import { UserInitializer } from "./user-initializer";
import "./globals.css";

const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-display",
  display: "swap",
});

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const FALLBACK_SITE_URL = "https://www.streamscapex.live";

function resolveSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    try {
      return new URL(configured);
    } catch {
      // Malformed value: fall through to the known production URL.
    }
  }
  return new URL(FALLBACK_SITE_URL);
}

const siteUrl = resolveSiteUrl();
const siteOrigin = siteUrl.origin;

const SITE_DESCRIPTION =
  "Stream your favorite movies and TV shows in HD quality. Watch the latest releases and popular classics on StreamScapeX.";

/**
 * Runs before first paint. Flags returning viewers who have local watch
 * history so CSS can reserve the Continue watching rail (.history-slot)
 * and the home page never shifts when the client store hydrates.
 */
const HISTORY_FLAG_SCRIPT = `try{var h=localStorage.getItem('ssx-history-v1');if(h&&h.indexOf('"tmdbId"')>-1)document.documentElement.setAttribute('data-history','1')}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "StreamScapeX - Watch Movies & TV Shows Online",
    template: "%s | StreamScapeX",
  },
  description: SITE_DESCRIPTION,
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
  authors: [{ name: "ice", url: siteOrigin }],
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "StreamScapeX",
    title: "StreamScapeX - Your Ultimate Streaming Platform",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StreamScapeX - Watch Movies & TV Shows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamScapeX - Watch Movies & TV Shows",
    description: SITE_DESCRIPTION,
    images: ["/twitter-image.jpg"],
    creator: "@StreamScapeX",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "StreamScapeX",
    statusBarStyle: "black-translucent",
  },
  verification: {
    google: "googleca5e3c6b4470fb54",
  },
  category: "entertainment",
};

export const viewport: Viewport = {
  themeColor: "#0D0D10",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "StreamScapeX",
  url: siteOrigin,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteOrigin}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
  description: SITE_DESCRIPTION,
  publisher: {
    "@type": "Organization",
    name: "StreamScapeX",
    logo: {
      "@type": "ImageObject",
      url: `${siteOrigin}/icons/icon-512.png`,
      width: 512,
      height: 512,
    },
  },
  inLanguage: "en-US",
  copyrightYear: "2025",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${fontDisplay.variable} ${fontSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: HISTORY_FLAG_SCRIPT }} />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      {/* Mobile bottom padding clears the fixed TabBar (64px + safe area). It sits on
          body, after the Footer, so neither page content nor the footer is hidden. */}
      <body className="bg-background pb-[calc(64px+env(safe-area-inset-bottom))] font-sans text-foreground antialiased md:pb-0">
        <div
          data-scroll-sentinel
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-px w-px"
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:inline-flex focus:h-11 focus:items-center focus:rounded-full focus:bg-primary focus:px-5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Skip to content
        </a>

        <Providers>
          <UserInitializer>
            <ThemeProvider
              attribute="class"
              forcedTheme="dark"
              disableTransitionOnChange
            >
              <InstallPrompt />
              <Navbar />
              <main
                id="main-content"
                tabIndex={-1}
                className="min-h-[100dvh] focus:outline-none"
              >
                {children}
              </main>
              <Footer />
              <TabBar />
            </ThemeProvider>
          </UserInitializer>
        </Providers>

        <GoogleTagManager gtmId="GTM-PSDLSB6V" />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
