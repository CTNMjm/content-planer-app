/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Deaktiviere Minification für Debugging
  swcMinify: false,
  productionBrowserSourceMaps: true,
  // Force rebuild
  env: {
    BUILD_ID: Date.now().toString(),
  },
}

export default nextConfig