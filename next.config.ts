import type { NextConfig } from "next";

// 根据部署平台决定是否使用静态导出
// 4everland 需要静态导出，Vercel 不需要
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  // 只在需要静态导出时启用
  ...(isStaticExport && {
    output: 'export',
        images: {
          unoptimized: true,
        },
      }),
};

export default nextConfig;
