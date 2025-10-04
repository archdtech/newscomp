import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
<<<<<<< HEAD
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ['**/*'], // 忽略所有文件变化
      };
    }
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
=======
  // Allow cross-origin requests from preview chat
  allowedDevOrigins: [
    'preview-chat-34ca4ccb-0b76-42af-b10b-902d5f456a92.space.z.ai',
    'https://localhost:3000',
    'http://localhost:3000',
    'https://localhost:3001',
    'http://localhost:3001',
  ],
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  // Enable output in standalone mode for Docker
  output: 'standalone',
  // Allow Docker container to access the app
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
>>>>>>> 681bf3f8575421626dc4166ce9f4b2df0df214b5
};

export default nextConfig;
