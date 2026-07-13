import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (sharper at the same file size), WebP fallback.
    formats: ["image/avif", "image/webp"],
    // Next 16 only honours quality values that are allowlisted here.
    qualities: [75, 90, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "haizcnclldbtsozfvbts.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
