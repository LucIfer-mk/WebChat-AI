import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://webchatbackend-6893imfx1-manojs-projects-08418023.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
