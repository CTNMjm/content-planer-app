/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  
  // WICHTIG: Force Dynamic für alle Seiten
  output: 'standalone',
  
  // Deaktiviere Static Generation
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  // Deaktiviere Compiler-Optimierungen
  compiler: {
    removeConsole: false,
    styledComponents: false,
  },
  
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    optimizeCss: false,
    optimizePackageImports: [],
  },
  
  // Deaktiviere Output-Optimierungen
  compress: false,
  poweredByHeader: false,
  generateEtags: false,
  
  webpack: (config, { isServer, dev }) => {
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
    
    // WICHTIG: Deaktiviere ALLE Optimierungen
    config.optimization = {
      minimize: false,
      concatenateModules: false,
      splitChunks: false,
      runtimeChunk: false,
      usedExports: false,
      sideEffects: false,
    };
    
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
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig;