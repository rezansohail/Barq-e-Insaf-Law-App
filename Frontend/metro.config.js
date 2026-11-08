// metro.config.js – fixes "react-native/setup-env" import for Expo Go
const { getDefaultConfig } = require('expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

// Alias the missing modules to our shims
defaultConfig.resolver.alias = {
  ...(defaultConfig.resolver.alias || {}),
  'react-native/setup-env': require.resolve('./app/shims/setup-env.js'),
  'react-native/asset-registry': require.resolve('./app/shims/asset-registry.js'),
};

// Also map via extraNodeModules for compatibility (optional)
defaultConfig.resolver.extraNodeModules = {
  ...(defaultConfig.resolver.extraNodeModules || {}),
  'react-native/setup-env': require.resolve('./app/shims/setup-env.js'),
  'react-native/asset-registry': require.resolve('./app/shims/asset-registry.js'),
};

module.exports = defaultConfig;
