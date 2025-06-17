/** @type {import('next').NextConfig} */
const nextConfig = {
  // KEIN output: 'standalone' mehr!
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig