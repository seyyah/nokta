import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
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
      {/*
        INTENTIONAL UX BUG (HomeScreen):
        The only way to create a note is this tiny, unlabeled "+" in the header.
        It is easy to miss and gives no hint of what it does.
      */}
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/new-note')} hitSlop={6}>
              <Text style={styles.headerPlus}>+</Text>
            </Pressable>
          ),
        }}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerPlus: { fontSize: 22, color: '#222', paddingHorizontal: 4 },
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
});
