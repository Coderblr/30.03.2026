import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://10.1.161.165:5050";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;


