import type { NextConfig } from "next";

// ─── Why we need this ─────────────────────────────────────────
// Next.js <Image> component is secure by default — it BLOCKS
// loading images from external domains unless you whitelist them here.
// Our product images are hosted on Cloudinary.
// Without this, every product image would show as broken.

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudinary — where all product images are uploaded to
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        // Allow any https image (useful during development)
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
