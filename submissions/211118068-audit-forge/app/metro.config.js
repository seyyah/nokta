const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = config.resolver;

config.resolver.assetExts = [
  ...assetExts.filter((ext) => ext !== 'cjs'),
  'glb',
  'gltf',
  'min.js',
];
config.resolver.sourceExts = [...sourceExts, 'cjs', 'mjs'];

module.exports = config;
