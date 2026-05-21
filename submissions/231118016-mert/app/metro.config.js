const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// GLB ve 3D asset dosyaları için destek ekle
config.resolver.assetExts.push('glb', 'gltf', 'bin', 'hdr');

module.exports = config;
