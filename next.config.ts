import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // PLACEHOLDER HOSTS. Real project covers and team photos become static
    // imports from /public (CLAUDE.md §7.0), at which point these entries and
    // the remote URLs in content/*.json both go away.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;
