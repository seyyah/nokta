import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';
import {
  deleteSession,
  listSessions,
  type SavedSession,
} from '@/services/storage';

export default function History() {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      listSessions().then((rows) => {
        if (active) {
          setSessions(rows);
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const onOpen = (session: SavedSession) => {
    router.push({ pathname: '/spec', params: { md: session.idea_md } });
  };

  const onDelete = (session: SavedSession) => {
    Alert.alert('Fikri sil', `"${session.title}" kalıcı olarak silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deleteSession(session.id);
          const rows = await listSessions();
          setSessions(rows);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Fikirlerim</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? null : sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Henüz bir nokta büyütmedin.</Text>
          <Text style={styles.emptyBody}>
            Yeni Nokta ekranından bir fikir gir, AI ile birlikte büyüt. Final
            manifestolar burada listelenir.
          </Text>
          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => [
              styles.emptyCta,
              pressed && styles.emptyCtaPressed,
            ]}
          >
            <Text style={styles.emptyCtaText}>Yeni Nokta</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onLongPress={() => onDelete(item)}
              onPress={() => onOpen(item)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {item.tagline.length > 0 && (
                <Text style={styles.cardTagline} numberOfLines={2}>
                  {item.tagline}
                </Text>
              )}
              <Text style={styles.cardMeta}>{formatDate(item.savedAt)}</Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  backText: { fontSize: fontSize.xl, color: colors.text },
  title: {
    fontFamily: typography.headlineMedium,
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  headerRight: { width: 36 },
  listContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardPressed: { opacity: 0.85 },
  cardTitle: {
    fontFamily: typography.headlineMedium,
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  cardTagline: {
    fontFamily: typography.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  cardMeta: {
    marginTop: spacing.xs,
    fontFamily: typography.label,
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  separator: { height: spacing.md },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.headlineMedium,
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: typography.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyCta: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  emptyCtaPressed: { opacity: 0.85 },
  emptyCtaText: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.sm,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
