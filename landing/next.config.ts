import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: webchataibackend-jzbp88nrf-manojs-projects-08418023.vercel.app,
      },
    ];
  },
};

export default nextConfig;
