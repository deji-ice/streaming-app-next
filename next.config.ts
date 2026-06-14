import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              // Intentional allowlist of the streaming sources in lib/stream-providers.ts
              // plus YouTube (trailers). Add a provider's domain here when you add it to the registry.
              "frame-src 'self' https://vidsrc.to https://*.vidsrc.to https://multiembed.mov https://*.multiembed.mov https://vidlink.pro https://*.vidlink.pro https://www.youtube.com https://www.youtube-nocookie.com",
              "frame-ancestors 'self'",
              "img-src 'self' https: data: blob:",
              "media-src 'self' https: data: blob:",
              "connect-src 'self' https: data: blob:",
              "worker-src 'self' blob:",
            ].join('; ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;
