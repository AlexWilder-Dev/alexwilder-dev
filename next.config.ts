import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // static export for GitHub Pages; the deploy workflow injects basePath
  output: "export",
  images: { unoptimized: true },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
