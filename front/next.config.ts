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
        // Cloudinary — production image host
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        // Picsum Photos — reliable seed-based placeholder images
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        // Unsplash — high quality stock photos
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        // Fallback: allow any https image during development
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
