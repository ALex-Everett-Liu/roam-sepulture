// next.config.js
const webpack = require('webpack'); // Import webpack

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Electron-specific configs
    if (!isServer) {
      config.target = 'electron-renderer';
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      util: require.resolve('util'),
    };

    // Add DefinePlugin to provide 'global'
    config.plugins.push(
      new webpack.DefinePlugin({
        'global': 'window', // or 'self' or 'globalThis'
      })
    );

    return config;
  }
};

module.exports = nextConfig;