import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export disabled for development with WebSocket support
  // output: "export",
  images: {
    unoptimized: true,
  },
  // For production deployment with WebSocket, use SSR mode
};

export default nextConfig;
