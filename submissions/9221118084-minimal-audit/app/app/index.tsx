import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { loadNotes, type Note } from '../lib/notes';

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
        ListEmptyComponent={<Text style={styles.empty}>Henüz not yok.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/note/${item.id}`)}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardBody} numberOfLines={1}>
              {item.body.slice(0, 50) || 'Boş not'}
            </Text>
          </Pressable>
        )}
      />

      {/* FORGE Cycle 1: labeled bottom FAB replaces the easy-to-miss header "+". */}
      <Pressable style={styles.fab} onPress={() => router.push('/new-note')}>
        <Text style={styles.fabText}>+ Yeni Not</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 16, gap: 12 },
  emptyWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#999', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#222' },
  cardBody: { fontSize: 14, color: '#777', marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
