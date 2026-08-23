import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts", "swiper"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl}/api/auth/:path*`,
      },
      {
        source: "/api/users/:path*",
        destination: `${backendUrl}/api/users/:path*`,
      },
      {
        source: "/api/customer/:path*",
        destination: `${backendUrl}/api/customer/:path*`,
      },
      {
        source: "/api/branch-dashboard/:path*",
        destination: `${backendUrl}/api/branch-dashboard/:path*`,
      },
      {
        source: "/api/delivery-agent/:path*",
        destination: `${backendUrl}/api/delivery-agent/:path*`,
      },
      {
        source: "/api/payments/:path*",
        destination: `${backendUrl}/api/payments/:path*`,
      },
      {
        source: "/api/services/:path*",
        destination: `${backendUrl}/api/services/:path*`,
      },
      {
        source: "/api/branches/:path*",
        destination: `${backendUrl}/api/branches/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${backendUrl}/api/admin/:path*`,
      },
      {
        source: "/api/super-admin/:path*",
        destination: `${backendUrl}/api/super-admin/:path*`,
      },
      {
        source: "/api/public/:path*",
        destination: `${backendUrl}/api/public/:path*`,
      },
      {
        source: "/api/settings/:path*",
        destination: `${backendUrl}/api/settings/:path*`,
      },
      {
        source: "/api/chat/:path*",
        destination: `${backendUrl}/api/chat/:path*`,
      },
      {
        source: "/api/tickets/:path*",
        destination: `${backendUrl}/api/tickets/:path*`,
      },
      {
        source: "/api/roles/:path*",
        destination: `${backendUrl}/api/roles/:path*`,
      },
      {
        source: "/api/feature-flags/:path*",
        destination: `${backendUrl}/api/feature-flags/:path*`,
      },
      {
        source: "/api/upload/:path*",
        destination: `${backendUrl}/api/upload/:path*`,
      },
      {
        source: "/api/vendors/:path*",
        destination: `${backendUrl}/api/vendors/:path*`,
      },
      {
        source: "/api/logistics/:path*",
        destination: `${backendUrl}/api/logistics/:path*`,
      },
      {
        source: "/api/support/:path*",
        destination: `${backendUrl}/api/support/:path*`,
      },
      {
        source: "/api/finance/:path*",
        destination: `${backendUrl}/api/finance/:path*`,
      },
      {
        source: "/api/cms/:path*",
        destination: `${backendUrl}/api/cms/:path*`,
      },
      {
        source: "/api/analytics/:path*",
        destination: `${backendUrl}/api/analytics/:path*`,
      },
      {
        source: "/api/employee-dashboard/:path*",
        destination: `${backendUrl}/api/employee-dashboard/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
