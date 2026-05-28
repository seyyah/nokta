const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = Array.from(
  new Set([
    ...config.resolver.assetExts,
    'glb',
    'gltf',
    'bin',
    'jpg',
    'jpeg',
    'png',
    'webp',
  ]),
);

module.exports = config;
