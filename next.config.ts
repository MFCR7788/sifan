import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // 在某些部署环境下禁用图片优化，确保兼容性
  },
};

export default nextConfig;
