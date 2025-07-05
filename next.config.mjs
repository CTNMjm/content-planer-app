/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  experimental: {
    webpackBuildWorker: false,
  },
  webpack: (config, { isServer }) => {
    config.optimization.minimize = false;
    return config;
  },
}

export default nextConfig