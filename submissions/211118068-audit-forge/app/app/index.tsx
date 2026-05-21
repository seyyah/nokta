import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.hero}>
        <Text style={styles.emoji}>💡</Text>
        <Text style={styles.title}>Nokta</Text>
        <Text style={styles.subtitle}>
          Fikirlerini yakala, olgunlaştır, hayata geçir.
        </Text>
      </View>

      <View style={styles.features}>
        <FeatureRow icon="📋" text="Fikir listesi — hepsini bir arada gör" />
        <FeatureRow icon="🔍" text="Detay görünümü — derinlemesine incele" />
        <FeatureRow icon="🐛" text="Audit widget — hataları saniyeler içinde raporla" />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/ideas' as never)}
        >
          <Text style={styles.buttonText}>Başla →</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Devam etmek için dokun</Text>
      </View>
    </View>
  );
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  hero: { alignItems: 'center', marginBottom: 48 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 40, fontWeight: '800', color: '#111827', letterSpacing: -1 },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  features: { flex: 1, justifyContent: 'center', gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 24, width: 36 },
  featureText: { fontSize: 15, color: '#374151', flex: 1 },
  footer: { alignItems: 'center', gap: 12 },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  hint: { fontSize: 12, color: '#9CA3AF' },
});
