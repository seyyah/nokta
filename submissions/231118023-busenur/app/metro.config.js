const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Project and Library roots
const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, './nokta-audit-main');

const config = getDefaultConfig(projectRoot);

// 1. Watch the local library folder
config.watchFolders = [libraryRoot];

// 2. Block Metro from watching/resolving the library's own node_modules to prevent duplicate package & codegen conflicts
config.resolver.blacklistRE = /nokta-audit-main[/\\]node_modules[/\\]/;

// 3. Force Metro to resolve packages from the app's node_modules first
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 4. Alias peer dependencies to the host app's node_modules to avoid duplicates/resolution issues
config.resolver.extraNodeModules = {
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'expo': path.resolve(projectRoot, 'node_modules/expo'),
  'expo-file-system': path.resolve(projectRoot, 'node_modules/expo-file-system'),
  'expo-sharing': path.resolve(projectRoot, 'node_modules/expo-sharing'),
  'react-native-view-shot': path.resolve(projectRoot, 'node_modules/react-native-view-shot'),
  '@react-native-async-storage/async-storage': path.resolve(projectRoot, 'node_modules/@react-native-async-storage/async-storage'),
};

module.exports = config;
