import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // 允许的图片域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '42.121.218.14',
      },
      {
        protocol: 'https',
        hostname: 'www.zjsifan.com',
      },
      {
        protocol: 'https',
        hostname: 'zjsifan.com',
      },
    ],
    // 优先使用 WebP 格式
    formats: ['image/webp', 'image/avif'],
    // 图片优化配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 图片质量
    quality: 75,
    // 启用缓存
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
