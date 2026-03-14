import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/EcoSync",
  assetPrefix: "/EcoSync/",
};

export default nextConfig;
