import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org'
      }
    ]
  },
  typescript: {
    // !! WARN !!
    // This will allow production builds to successfully complete even if
    // your project has type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // This will allow production builds to successfully complete even if
    // your project has ESLint errors
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
