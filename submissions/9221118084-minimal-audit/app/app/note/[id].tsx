import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { deleteNote, getNote, toggleStar, type Note } from '../../lib/notes';
import { bgGradient, colors, formatDate, radius, shadow } from '../../lib/theme';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | undefined>();

  const refresh = useCallback(() => {
    if (id) getNote(id).then(setNote);
  }, [id]);
  useFocusEffect(refresh);

  async function onToggleStar() {
    if (!id) return;
    await toggleStar(id);
    refresh();
  }

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
        <LinearGradient colors={bgGradient} style={StyleSheet.absoluteFill} />
        <Ionicons name="document-outline" size={40} color={colors.inkSoft} />
        <Text style={styles.muted}>Not bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={bgGradient} style={StyleSheet.absoluteFill} />
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable hitSlop={10} onPress={onToggleStar}>
              <Ionicons
                name={note.starred ? 'star' : 'star-outline'}
                size={24}
                color={note.starred ? colors.gold : colors.ink}
              />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{note.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.dateChip}>
            <Ionicons name="calendar-outline" size={13} color={colors.inkSoft} />
            <Text style={styles.metaText}>{formatDate(note.createdAt)}</Text>
          </View>
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
          <Ionicons name="create-outline" size={18} color={colors.ink} />
          <Text style={styles.editText}>Düzenle</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.deleteBtn, pressed && styles.pressed]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color={colors.white} />
          <Text style={styles.deleteText}>Sil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgTop },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  muted: { color: colors.inkSoft, fontSize: 16 },
  content: { padding: 22, paddingBottom: 24 },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink, lineHeight: 36, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaText: { fontSize: 13, color: colors.inkSoft, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, marginTop: 20, ...shadow.card },
  body: { fontSize: 16, lineHeight: 26, color: colors.ink },

  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 28 },
  pressed: { transform: [{ scale: 0.98 }] },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
    paddingVertical: 16,
  },
  editBtn: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  editText: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  deleteBtn: { backgroundColor: colors.danger, ...shadow.card },
  deleteText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
