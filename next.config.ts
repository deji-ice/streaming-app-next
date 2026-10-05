import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TMDB already serves resized renditions, so the custom loader maps each
  // requested width to a valid TMDB size bucket instead of running the
  // Next optimizer (see lib/tmdb-image-loader.ts and design spec section 4).
  images: {
    loader: 'custom',
    // Root-level shim (see image-loader.ts): a subfolder path breaks Turbopack on Windows.
    loaderFile: './image-loader.ts',
    imageSizes: [92, 154, 185, 300, 342],
    deviceSizes: [500, 780, 1280, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**'
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
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
              "frame-src 'self' https://vidsrc.to https://*.vidsrc.to https://vidlink.pro https://*.vidlink.pro https://player.videasy.ws https://*.videasy.ws https://www.youtube.com https://www.youtube-nocookie.com",
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
