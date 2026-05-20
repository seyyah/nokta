import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { deleteNote, getNote, type Note } from '../../lib/notes';
import { accentFor, colors, formatDate, radius, shadow } from '../../lib/theme';

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
        <Ionicons name="document-outline" size={40} color={colors.textMuted} />
        <Text style={styles.muted}>Not bulunamadı.</Text>
      </View>
    );
  }

  const accent = accentFor(note.id);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <Text style={styles.title}>{note.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{formatDate(note.createdAt)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.body}>{note.body || 'Boş not'}</Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.editBtn, pressed && styles.pressed]}
          onPress={() => Alert.alert('Düzenleme', 'Düzenleme yakında geliyor.')}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={styles.editText}>Düzenle</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.deleteBtn, pressed && styles.pressed]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={styles.deleteText}>Sil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  muted: { color: colors.textMuted, fontSize: 16 },
  content: { padding: 20, paddingBottom: 24 },
  accentBar: { width: 40, height: 5, borderRadius: 5, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, lineHeight: 32 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  metaText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 18,
    marginTop: 18,
    ...shadow.card,
  },
  body: { fontSize: 16, lineHeight: 26, color: colors.text },

  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: radius.md,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  editBtn: { backgroundColor: '#EEF0FF', borderColor: '#E0E3FF' },
  editText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  deleteBtn: { backgroundColor: colors.dangerSoft, borderColor: '#FFD7DF' },
  deleteText: { color: colors.danger, fontSize: 16, fontWeight: '700' },
});
