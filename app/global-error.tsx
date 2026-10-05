"use client";

import { useEffect } from "react";

// Replaces the root layout when it fails, so it cannot rely on globals.css, fonts or providers.
// Inline styles use the token values from the design spec (flat, no shadows).
const colors = {
  background: "#0D0D10",
  foreground: "#F5F4F2",
  muted: "#B4B3BA",
  subtle: "#8F8E98",
  primary: "#FF6B4A",
  primaryForeground: "#160A07",
  card: "#15151A",
  border: "#2C2C35",
};

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 44,
  padding: "0 20px",
  borderRadius: 9999,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  textDecoration: "none",
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong | StreamScapeX</title>
        <meta name="robots" content="noindex" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: colors.background,
          color: colors.foreground,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          lineHeight: 1.6,
        }}
      >
        <main style={{ maxWidth: 720, padding: "64px 16px" }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>
            StreamScape<span style={{ color: colors.primary }}>X</span>
          </p>
          <h1 style={{ margin: "40px 0 0", fontSize: 32, lineHeight: 1.1, fontWeight: 750 }}>
            Something went wrong
          </h1>
          <p style={{ margin: "16px 0 0", color: colors.muted, maxWidth: "60ch" }}>
            The app could not be loaded. Try again, or reload the home page.
          </p>
          {error.digest ? (
            <p style={{ margin: "8px 0 0", color: colors.subtle, fontSize: 13 }}>
              Error reference: {error.digest}
            </p>
          ) : null}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                ...pill,
                border: "none",
                background: colors.primary,
                color: colors.primaryForeground,
              }}
            >
              Retry
            </button>
            {/* A full document load is intended here: the root layout itself failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                ...pill,
                border: `1px solid ${colors.border}`,
                background: colors.card,
                color: colors.foreground,
              }}
            >
              Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
