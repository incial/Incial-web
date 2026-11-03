import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

// Static, rarely-changing public assets: let browsers and the CDN keep them.
const longCache = [
  { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true, // ImageKit CDN already handles optimization; bypass Next.js image processing
    qualities: [60, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "react-icons", "d3"],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Only the brand logo is long-cached: /images and /clients hold files that
      // can be replaced under the same name, which would show stale pictures.
      { source: "/logo/:path*", headers: longCache },
    ];
  },
};

export default nextConfig;
