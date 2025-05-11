// next.config.js
module.exports = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
      // Electron-specific configs
      if (!isServer) {
        config.target = 'electron-renderer';
      }
      return config;
    }
  };