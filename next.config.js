// next.config.js
const webpack = require('webpack'); // Import webpack

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Only apply these changes for client-side builds
    if (!isServer) {
      config.target = 'electron-renderer';
      
      // Provide polyfills
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.DefinePlugin({
          'global': 'window',
          'process.env': JSON.stringify(process.env),
        })
      );
    }
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      path: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      util: require.resolve('util'),
      process: require.resolve('process/browser'),
    };
    
    return config;
  }
};

module.exports = nextConfig;