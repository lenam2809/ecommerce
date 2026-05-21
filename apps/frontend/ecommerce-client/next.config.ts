import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const isDevelopment = process.env.NODE_ENV !== "production";

function remotePatternFromUrl(value: string): RemotePattern | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: url.pathname === "/" ? "/**" : `${url.pathname.replace(/\/$/, "")}/**`,
    };
  } catch {
    return null;
  }
}

function configuredRemotePatterns(): RemotePattern[] {
  return (process.env.NEXT_PUBLIC_IMAGE_REMOTE_URLS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(remotePatternFromUrl)
    .filter((pattern): pattern is RemotePattern => Boolean(pattern));
}

const developmentRemotePatterns: RemotePattern[] = [
  {
    protocol: 'http',
    hostname: 'localhost',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '3000',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '6262',
    pathname: '/uploads/**',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '5000',
    pathname: '/uploads/**',
  },
];

const sharedRemotePatterns: RemotePattern[] = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: '*.supabase.co',
    pathname: '/storage/v1/object/public/**',
  },
  ...configuredRemotePatterns(),
];

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      ...sharedRemotePatterns,
      ...(isDevelopment ? developmentRemotePatterns : []),
    ],
    // Optimize images with responsive sizes and WebP support
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const backendBase = apiUrl.replace(/\/api\/?$/, '') // e.g. https://backend.onrender.com or http://backend:5000
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`,
      },
    ]
  },
};

export default nextConfig;
