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
              "frame-src * 'self' https://*.vidsrc.xyz https://*.vidsrc.me https://*.vidsrc.to",
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
