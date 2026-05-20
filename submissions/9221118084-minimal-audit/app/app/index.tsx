import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadNotes, toggleStar, type Note } from '../lib/notes';
import { bgGradient, colors, formatDate, radius, shadow } from '../lib/theme';

type Filter = 'all' | 'starred';

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const insets = useSafeAreaInsets();

  const refresh = useCallback(() => {
    loadNotes().then(setNotes);
  }, []);
  useFocusEffect(refresh);

  async function onToggleStar(id: string) {
    await toggleStar(id);
    refresh();
  }

  const starredCount = notes.filter((n) => n.starred).length;
  const visible = filter === 'starred' ? notes.filter((n) => n.starred) : notes;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={bgGradient} style={StyleSheet.absoluteFill} />

      <FlatList
        data={visible}
        keyExtractor={(n) => n.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 8 },
          visible.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header: bold title + bell + avatar */}
            <View style={styles.header}>
              <Text style={styles.h1}>Notlarım</Text>
              <View style={styles.headerRight}>
                <View style={styles.bell}>
                  <Ionicons name="notifications-outline" size={20} color={colors.ink} />
                  <View style={styles.bellDot} />
                </View>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>N</Text>
                </View>
              </View>
            </View>

            {/* Filter chips */}
            <View style={styles.chips}>
              <Chip
                label="Tümü"
                count={notes.length}
                active={filter === 'all'}
                onPress={() => setFilter('all')}
              />
              <Chip
                label="Yıldızlı"
                count={starredCount}
                active={filter === 'starred'}
                onPress={() => setFilter('starred')}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <LinearGradient
              colors={['#F7DD9C', '#E7B645']}
              style={styles.emptyIcon}
            >
              <Ionicons
                name={filter === 'starred' ? 'star' : 'document-text'}
                size={38}
                color={colors.ink}
              />
            </LinearGradient>
            <Text style={styles.emptyTitle}>
              {filter === 'starred' ? 'Yıldızlı not yok' : 'Henüz not yok'}
            </Text>
            <Text style={styles.emptySub}>
              {filter === 'starred'
                ? 'Bir notu yıldızlamak için kartındaki yıldıza dokun.'
                : 'İlk notunu eklemek için + butonuna dokun.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push(`/note/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <View style={styles.dateChip}>
                <Ionicons name="calendar-outline" size={12} color={colors.inkSoft} />
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
              </View>
              <Pressable hitSlop={10} onPress={() => onToggleStar(item.id)}>
                <Ionicons
                  name={item.starred ? 'star' : 'star-outline'}
                  size={22}
                  color={item.starred ? colors.gold : colors.inkSoft}
                />
              </Pressable>
            </View>

            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardPreview} numberOfLines={2}>
              {item.body || 'Boş not'}
            </Text>

            <View style={styles.cardBottom}>
              <View style={styles.openBtn}>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* Floating circular bottom nav */}
      <View style={[styles.nav, { paddingBottom: insets.bottom + 10 }]}>
        <NavButton icon="home" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { transform: [{ scale: 0.95 }] }]}
          onPress={() => router.push('/new-note')}
        >
          <Ionicons name="add" size={30} color={colors.white} />
        </Pressable>
        <NavButton
          icon="star"
          active={filter === 'starred'}
          onPress={() => setFilter('starred')}
        />
      </View>
    </View>
  );
}

function Chip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      <View style={[styles.badge, active && styles.badgeActive]}>
        <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{count}</Text>
      </View>
    </Pressable>
  );
}

function NavButton({
  icon,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.navBtn, active && styles.navBtnActive]} onPress={onPress}>
      <Ionicons name={icon} size={22} color={active ? colors.white : colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgTop },
  listContent: { paddingHorizontal: 20, paddingBottom: 140, gap: 14 },
  listEmpty: { flexGrow: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  h1: { fontSize: 34, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 18 },

  chips: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 15, fontWeight: '700', color: colors.ink },
  chipTextActive: { color: colors.white },
  badge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
  badgeText: { fontSize: 12, fontWeight: '800', color: colors.badgeText },
  badgeTextActive: { color: colors.white },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    ...shadow.card,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  emptySub: { fontSize: 14, color: colors.inkSoft, textAlign: 'center', marginTop: 8, lineHeight: 21 },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, ...shadow.card },
  cardPressed: { transform: [{ scale: 0.985 }] },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bgTop,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  dateText: { fontSize: 12, color: colors.inkSoft, fontWeight: '600' },
  cardTitle: { fontSize: 19, fontWeight: '800', color: colors.ink, marginTop: 12 },
  cardPreview: { fontSize: 14, color: colors.inkSoft, marginTop: 6, lineHeight: 20 },
  cardBottom: { alignItems: 'flex-end', marginTop: 14 },
  openBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 10,
  },
  navBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  navBtnActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  addBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.button,
  },
});
