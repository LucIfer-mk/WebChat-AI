import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'webchatbackend-6893imfx1-manojs-projects-08418023.vercel.app',
      },
    ];
  },
};

export default nextConfig;
