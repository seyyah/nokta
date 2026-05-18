import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { mockIdeas } from '../../constants/mockIdeas';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idea = mockIdeas.find((i) => i.id === id);

  if (!idea) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Fikir bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
        {idea.title}
      </Text>

      <View style={styles.metaRow}>
        <View style={[styles.statusBadge, idea.status === 'done' && styles.statusDone]}>
          <Text style={styles.statusText}>
            {idea.status === 'done' ? '✅ Tamamlandı' : '🔴 Açık'}
          </Text>
        </View>
        <Text style={styles.date}>📅 {idea.createdAt}</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>Açıklama</Text>
      <Text style={styles.description}>{idea.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16, color: '#6B7280' },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 34,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusBadge: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusDone: { backgroundColor: '#F0FDF4' },
  statusText: { fontSize: 13, fontWeight: '600' },
  date: { fontSize: 13, color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' },
  description: { fontSize: 16, color: '#374151', lineHeight: 26 },
});
