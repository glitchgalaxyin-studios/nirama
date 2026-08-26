import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["framer-motion", "three", "lenis", "openai", "zod"],
  },
};

export default nextConfig;
