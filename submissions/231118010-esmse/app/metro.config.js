const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch the nokta-audit directory outside the project root
const noktaAuditPath = path.resolve(__dirname, '../../../../nokta-audit');
config.watchFolders = [noktaAuditPath];

// Let Metro know where to resolve packages (node_modules)
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(noktaAuditPath, 'node_modules'),
];

module.exports = config;
