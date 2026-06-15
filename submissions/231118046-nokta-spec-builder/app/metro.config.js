const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Register glb and gltf 3D file formats as assets
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;
