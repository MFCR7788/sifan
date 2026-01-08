import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // 在某些部署环境下禁用图片优化，确保兼容性
  },
  // 添加移动端和浏览器兼容性配置
  eslint: {
    // 生产环境禁用 ESLint 提升构建速度
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 生产环境禁用类型检查（如果构建时类型检查通过）
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
