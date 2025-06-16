/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance Optimierungen
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Experimental features - turbo komplett entfernen
  experimental: {
    optimizeCss: false,  // Deaktivieren
    // turbo Zeile komplett entfernen!
  },
  
  webpack: (config, { isServer }) => {
    // Ignoriere HTML-Dateien in node_modules
    config.module.rules.push({
      test: /\.html$/,
      use: 'raw-loader',
      include: /node_modules/,
    });
    
    // Ignoriere bestimmte Dateien vom Build
    config.module.rules.push({
      test: /backup_prisma.*\.(ts|tsx)$/,
      loader: 'ignore-loader'
    });
    
    // Optimierungen
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  typescript: {
    // Ignoriere TypeScript Fehler beim Build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignoriere ESLint während des Builds
    ignoreDuringBuilds: true,
  },
}

export default nextConfig;