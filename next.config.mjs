/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  webpack: (config, { isServer }) => {
    config.optimization.minimize = false;
    return config;
  },
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;