import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            images: {
              name: 'images',
              chunks: 'all',
              test: /\.(png|jpg|jpeg|gif|webp|avif|svg)$/i,
              priority: 10,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;