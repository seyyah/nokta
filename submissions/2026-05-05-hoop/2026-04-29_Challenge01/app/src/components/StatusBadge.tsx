import { View, Text, StyleSheet } from 'react-native';
import type { ProviderName } from '@/types';

const COLORS: Record<ProviderName, string> = {
  anthropic: '#d97706',
  gemini: '#3b82f6',
  groq: '#10b981',
};

export function StatusBadge({ provider, attempts }: { provider: ProviderName; attempts: number }) {
  return (
    <View style={[styles.badge, { borderColor: COLORS[provider] }]}>
      <View style={[styles.dot, { backgroundColor: COLORS[provider] }]} />
      <Text style={styles.text}>
        {provider}
        {attempts > 1 ? `  ·  ${attempts} deneme` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { color: '#aaa', fontSize: 12, fontWeight: '500' },
});
