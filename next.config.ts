import type { NextConfig } from "next";
import path from "path";

// Silence the "inferred workspace root" warning by explicitly setting the
// tracing root to this project directory (useful when multiple lockfiles exist
// on the machine, e.g., in parent folders).
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Allow optimization of avatars and Cloudinary-hosted assets
    domains: ['i.pravatar.cc', 'res.cloudinary.com'],
  },
};

export default nextConfig;
