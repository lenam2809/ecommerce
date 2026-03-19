import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'http://localhost:6262'],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://backend:5000/uploads/:path*',
      },
    ]
  },
};

export default nextConfig;
