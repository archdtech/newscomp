import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
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
};

export default nextConfig;
