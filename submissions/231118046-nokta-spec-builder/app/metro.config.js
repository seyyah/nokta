const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../../../../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the workspace root so Metro can see the nokta-audit package
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Disable hierarchical module resolution for React/React Native to prevent duplicate versions
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
