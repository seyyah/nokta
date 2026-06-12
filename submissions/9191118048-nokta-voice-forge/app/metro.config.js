const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('glb', 'gltf', 'bin', 'png', 'jpg', 'jpeg', 'webp');
module.exports = config;
