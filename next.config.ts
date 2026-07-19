import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose env vars to the browser (NEXT_PUBLIC_* are auto-exposed,
  // but listing them here ensures they are inlined at build time too)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
