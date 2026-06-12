import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['better-sqlite3'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
