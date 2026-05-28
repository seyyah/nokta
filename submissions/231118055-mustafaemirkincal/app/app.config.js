module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins || []), 'expo-asset'],
  extra: {
    ...config.extra,
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  },
});
