import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['better-sqlite3', 'mysql2', 'pg'],
  turbopack: {
    root: process.cwd(),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
