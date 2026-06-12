const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb');
config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('mjs');

module.exports = config;
