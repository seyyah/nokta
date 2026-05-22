import { CheckCircle2, Circle, Plus, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const { palette } = Colors;

type Note = { id: string; title: string; preview: string; done: boolean; tag: string };
const SEED: Note[] = [
  { id: "n1", title: "Audit FAB position", preview: "Should not overlap the home indicator on iPhone 15 Pro.", done: false, tag: "UI" },
  { id: "n2", title: "Forge cycle template", preview: "READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY.", done: true, tag: "DOC" },
  { id: "n3", title: "Rollback heuristic", preview: "If 2 consecutive TEST failures, ROLLBACK and re-read.", done: false, tag: "OPS" },
  { id: "n4", title: "Markdown burn-in", preview: "Include device, screen, coordinates, ASCII layout.", done: true, tag: "DOC" },
  { id: "n5", title: "Toast confirmations", preview: "Show subtle confirmation when report copied.", done: false, tag: "UI" },
  { id: "n6", title: "Empty state", preview: "Make hint disappear after first annotation.", done: true, tag: "UI" },
];

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState<string>("");
  const [items, setItems] = useState<Note[]>(SEED);

  const filtered = useMemo<Note[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) => n.title.toLowerCase().includes(q) || n.preview.toLowerCase().includes(q)
    );
  }, [items, query]);

  const toggle = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, done: !n.done } : n)));
  };

  return (
    <View style={styles.root}>
      <View style={styles.searchWrap}>
        <Search size={16} color={palette.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search notes"
          placeholderTextColor={palette.textMuted}
          style={styles.searchInput}
          testID="notes-search"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 140 + insets.bottom,
          paddingTop: 4,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptySub}>Try a different search term.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => toggle(item.id)} style={styles.card}>
            <View style={{ marginTop: 2 }}>
              {item.done ? (
                <CheckCircle2 size={20} color={palette.yellow} strokeWidth={2.4} />
              ) : (
                <Circle size={20} color={palette.textMuted} strokeWidth={2} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.cardTopRow}>
                <Text
                  style={[
                    styles.cardTitle,
                    item.done && { color: palette.textDim, textDecorationLine: "line-through" },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
              </View>
              <Text style={styles.cardPreview} numberOfLines={2}>{item.preview}</Text>
            </View>
          </Pressable>
        )}
      />

      <Pressable style={[styles.addBtn, { bottom: 90 + insets.bottom / 2 }]} accessibilityLabel="Add note">
        <Plus size={22} color={palette.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  searchWrap: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: palette.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: palette.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  cardPreview: { color: palette.textDim, fontSize: 13, marginTop: 4, lineHeight: 17 },
  tag: {
    backgroundColor: palette.ink2,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: palette.border,
  },
  tagText: {
    color: palette.yellow,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { color: palette.text, fontWeight: "700", fontSize: 16 },
  emptySub: { color: palette.textMuted, fontSize: 12, marginTop: 4 },
  addBtn: {
    position: "absolute",
    right: 86,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.surface2,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
