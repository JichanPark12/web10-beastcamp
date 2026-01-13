import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  turbopack: {
    root: "..",
  },

  reactCompiler: true,
  output: "standalone",
};

export default nextConfig;
