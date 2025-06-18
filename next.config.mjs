/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // CSS Module explizit aktivieren
  cssModules: true,
  // PostCSS explizit aktivieren
  postcss: true,
}

export default nextConfig