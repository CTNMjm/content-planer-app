import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features entfernen für 14.1.4
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
