import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // 启用图片优化以支持移动端
    unoptimized: false,
    // 允许从外部域名加载图片（如果需要）
    remotePatterns: [],
    // 支持的图片格式
    formats: ['image/avif', 'image/webp'],
    // 设备尺寸配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // 图片尺寸配置
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  // 压缩配置
  compress: true,
  // 生产环境优化
  swcMinify: true,
};

export default nextConfig;
