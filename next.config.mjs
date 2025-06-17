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
}

export default nextConfig  // Verwende export default statt module.exports