import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 静态导出，适配 4everland
  images: {
    unoptimized: true, // 静态导出不支持图片优化
  },
};

export default nextConfig;
