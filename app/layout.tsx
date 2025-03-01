import type { Metadata, Viewport } from "next";
import { Montserrat, Roboto } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import AdBlockBanner from "@/components/layout/AdBlockBanner";

// Optimize fonts
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-montserrat",
  display: "swap", // Add font-display swap
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto",
  display: "swap", // Add font-display swap
});

// Enhanced metadata
export const metadata: Metadata = {
  title: {
    default: "StreamScape",
    template: "%s | StreamScape",
  },
  description: "Your premier streaming platform for movies and TV shows",
  keywords: [
    "streaming",
    "movies",
    "TV shows",
    "entertainment",
    "watch online",
  ],
  authors: [{ name: "ice" }],
  creator: "ice",
  publisher: "StreamScape",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://streamscape.vercel.app",
    siteName: "StreamScape",
    title: "StreamScape - Your Streaming Platform",
    description: "Your premier streaming platform for movies and TV shows",
    images: [
      {
        url: "/og-image.jpg", // Add your OG image
        width: 1200,
        height: 630,
        alt: "StreamScape",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamScape",
    description: "Your premier streaming platform for movies and TV shows",
    images: ["/twitter-image.jpg"], // Add your Twitter card image
  },
};

// Add viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${montserrat.variable} ${roboto.variable} antialiased`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AdBlockBanner />
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </ThemeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
