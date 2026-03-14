import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: process.env.BASE_PATH || "",
  assetPrefix: process.env.BASE_PATH ? `/${process.env.BASE_PATH}/` : "",
};

export default nextConfig;
