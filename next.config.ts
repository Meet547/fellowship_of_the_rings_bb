import type { NextConfig } from "next";

const DEFAULT_API_BASE_URL =
  "https://9zyg11hh53.execute-api.ap-southeast-2.amazonaws.com/dev";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // Proxy /api/proxy/* → API Gateway so the browser never makes a cross-origin
  // request. This eliminates CORS failures in local dev and keeps the frontend
  // independent of the browser origin.
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${API_BASE}/:path*`,
      },
    ];
  },
};

export default nextConfig;
