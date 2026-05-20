import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { loadNotes, type Note } from '../lib/notes';
import { accentFor, colors, formatDate, primaryGradient, radius, shadow } from '../lib/theme';

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadNotes().then(setNotes);
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        contentContainerStyle={notes.length === 0 ? styles.emptyWrap : styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          notes.length > 0 ? (
            <Text style={styles.count}>
              {notes.length} not{notes.length > 1 ? '' : ''}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Henüz not yok</Text>
            <Text style={styles.emptySub}>İlk notunu eklemek için aşağıdaki butona dokun.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const accent = accentFor(item.id);
          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push(`/note/${item.id}`)}
            >
              <View style={[styles.accent, { backgroundColor: accent }]} />
              <View style={styles.cardBodyWrap}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardPreview} numberOfLines={2}>
                  {item.body || 'Boş not'}
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </Pressable>
          );
        }}
      />

      {/* FORGE Cycle 1: labeled FAB replaces the easy-to-miss header "+". */}
      <Pressable
        style={({ pressed }) => [styles.fabWrap, pressed && { transform: [{ scale: 0.97 }] }]}
        onPress={() => router.push('/new-note')}
      >
        <LinearGradient
          colors={primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={22} color={colors.white} />
          <Text style={styles.fabText}>Yeni Not</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: 16, paddingBottom: 120, gap: 12 },
  count: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 4, marginLeft: 4 },

  empty: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    gap: 12,
    ...shadow.card,
  },
  cardPressed: { transform: [{ scale: 0.985 }], opacity: 0.95 },
  accent: { width: 4, alignSelf: 'stretch', borderRadius: 4 },
  cardBodyWrap: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardPreview: { fontSize: 14, color: colors.textMuted, marginTop: 3, lineHeight: 19 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  metaText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },

  fabWrap: { position: 'absolute', bottom: 28, alignSelf: 'center', borderRadius: radius.pill, ...shadow.floating },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
  },
  fabText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
