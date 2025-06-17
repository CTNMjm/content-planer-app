/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Auskommentiert für normalen Mode
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  swcMinify: false,
  productionBrowserSourceMaps: true,
}

export default nextConfig