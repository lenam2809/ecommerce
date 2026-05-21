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
];

const sharedRemotePatterns: RemotePattern[] = [
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
