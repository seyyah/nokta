import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { mockIdeas, type Idea } from '../../constants/mockIdeas';

export default function IdeasScreen() {
  const ideas = mockIdeas;

  return (
    <View style={styles.container}>
      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IdeaCard idea={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>💭</Text>
      <Text style={styles.emptyTitle}>Henüz fikir yok</Text>
      <Text style={styles.emptyHint}>İlk fikrini eklemek için + kullan</Text>
    </View>
  );
}

function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/idea/${idea.id}` as never)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {idea.title}
        </Text>
        <View style={[styles.badge, idea.status === 'done' && styles.badgeDone]}>
          <Text style={styles.badgeText}>
            {idea.status === 'done' ? '✅' : '🔴'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {idea.description}
      </Text>
      <Text style={styles.cardDate}>📅 {idea.createdAt}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  badge: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeDone: { backgroundColor: '#F0FDF4' },
  badgeText: { fontSize: 12 },
  cardDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  cardDate: { fontSize: 12, color: '#9CA3AF' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptyHint: { fontSize: 14, color: '#9CA3AF' },
});
