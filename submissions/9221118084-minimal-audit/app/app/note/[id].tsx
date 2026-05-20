import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { deleteNote, getNote, type Note } from '../../lib/notes';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | undefined>();

  useFocusEffect(
    useCallback(() => {
      if (id) getNote(id).then(setNote);
    }, [id])
  );

  function handleDelete() {
    // FORGE Cycle 4: require confirmation before destroying the note.
    Alert.alert('Notu sil', 'Bu notu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          if (id) await deleteNote(id);
          router.back();
        },
      },
    ]);
  }

  if (!note) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Not bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.body}>{note.body || 'Boş not'}</Text>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          style={[styles.btn, styles.editBtn]}
          onPress={() => Alert.alert('Düzenleme', 'Düzenleme yakında geliyor.')}
        >
          <Text style={styles.editText}>Düzenle</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.deleteBtn]} onPress={handleDelete}>
          <Text style={styles.deleteText}>Sil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#999', fontSize: 16 },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  body: { fontSize: 16, lineHeight: 24, color: '#444' },
  actions: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  editBtn: { backgroundColor: '#e5e7eb' },
  editText: { color: '#222', fontSize: 16, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#ef4444' },
  deleteText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
