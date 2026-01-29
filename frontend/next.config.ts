import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  turbopack: {
    root: "..",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kopis.or.kr",
      },
      {
        protocol: "https",
        hostname: "www.kopis.or.kr",
      },
    ],
  },

  reactCompiler: true,
  output: "standalone",
};

export default nextConfig;
