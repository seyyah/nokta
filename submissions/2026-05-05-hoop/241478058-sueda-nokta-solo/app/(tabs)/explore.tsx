import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTheme } from '@/lib/theme-context';

export default function ExploreScreen() {
  const { theme } = useAppTheme();

  return (
    <LinearGradient colors={theme.gradientColors} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={[styles.header, { color: theme.textPrimary }]}>Explore</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Trend Slop Örnekleri</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Aşağıdaki popüler aşırı mühendislik fikirlerinden birini seçerek hemen test edin.
            </Text>
            <View style={styles.listContainer}>
              {[
                'Blockchain tabanlı akıllı bebek bezi sensörü ve kripto ödül sistemi',
                'Kuantum yapay zeka ile kişiselleştirilmiş kedi yüzü tanıma ve mama önerme algoritması',
                'Merkeziyetsiz metaverse üzerinde sanal emlak komisyonculuğu simülasyonu'
              ].map((idea, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => router.push({ pathname: '/', params: { idea } })}
                  style={({ pressed }) => [
                    styles.ideaItem,
                    { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                    pressed && styles.ideaItemPressed
                  ]}
                >
                  <MaterialCommunityIcons name="trending-up" size={20} color="#FFD166" />
                  <Text style={[styles.ideaText, { color: theme.textPrimary }]}>{idea}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#132347',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: {
    marginTop: 16,
    gap: 12,
  },
  ideaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  ideaItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  ideaText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
