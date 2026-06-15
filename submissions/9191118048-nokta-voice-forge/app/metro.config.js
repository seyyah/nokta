const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const assetExts = config.resolver.assetExts;
const sourceExts = config.resolver.sourceExts;

config.resolver.assetExts = Array.from(new Set([
  ...assetExts,
  "glb",
  "gltf",
  "bin",
  "png",
  "jpg",
  "jpeg",
  "webp"
]));

module.exports = config;
