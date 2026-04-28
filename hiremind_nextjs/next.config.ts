import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from external sources (Unsplash used on landing page)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Required for Vercel deployment with Next.js 16
  output: "standalone",

  // Suppress build errors for missing env vars during Vercel build
  // (NEXT_PUBLIC_API_URL is set as a Vercel env variable)
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
