const webpack = require('webpack');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Handle React Native modules that MetaMask SDK tries to import in browser
    // Use a stub module instead of ignoring completely
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/lib/stubs/async-storage.js'),
    };
    
    // Suppress warnings for this specific module (applies to both server and client)
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@metamask\/sdk/,
        message: /Can't resolve '@react-native-async-storage\/async-storage'/,
      },
      /Can't resolve '@react-native-async-storage\/async-storage'/,
    ];
    
    return config;
  },
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'],
  },
};

module.exports = nextConfig;

