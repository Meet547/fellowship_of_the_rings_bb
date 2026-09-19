import type { NextConfig } from "next";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // Proxy /api/proxy/* → API Gateway so the browser never makes a cross-origin
  // request. This eliminates CORS failures in local dev and any environment
  // where the API Gateway Allow-Origin header does not match the current origin.
  async rewrites() {
    if (!API_BASE) return [];
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${API_BASE}/:path*`,
      },
    ];
  },
};

export default nextConfig;
