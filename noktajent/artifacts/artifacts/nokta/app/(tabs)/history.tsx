import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { type HistoryEntry, useHistory } from "@/contexts/HistoryContext";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function HistoryItemView({
  entry,
  onDelete,
  onCopy,
  colors,
}: {
  entry: HistoryEntry;
  onDelete: () => void;
  onCopy: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.7}
        style={styles.itemHeader}
      >
        <View style={styles.itemMeta}>
          <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>
            {entry.title}
          </Text>
          <Text style={[styles.itemDate, { color: colors.mutedForeground }]}>
            {formatDate(entry.createdAt)} · {entry.ideas.length} fikir
          </Text>
          {entry.tags.length > 0 && (
            <View style={styles.tagRow}>
              {entry.tags.map((t) => (
                <View key={t} style={[styles.tag, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.tagText, { color: colors.accentForeground }]}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.expanded, { borderTopColor: colors.border }]}>
          <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
            {entry.ideas.map((idea, i) => (
              <View key={i} style={styles.ideaRow}>
                <Text style={[styles.ideaNum, { color: colors.mutedForeground }]}>
                  {i + 1}.
                </Text>
                <Text style={[styles.ideaText, { color: colors.foreground }]}>{idea}</Text>
              </View>
            ))}
          </ScrollView>
          {entry.duplicatesRemoved > 0 && (
            <Text style={[styles.dupText, { color: colors.mutedForeground }]}>
              {entry.duplicatesRemoved} tekrar silindi
            </Text>
          )}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.border }]}
              onPress={onCopy}
            >
              <Feather name="copy" size={13} color={colors.mutedForeground} />
              <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Kopyala</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.destructive }]}
              onPress={onDelete}
            >
              <Feather name="trash-2" size={13} color={colors.destructive} />
              <Text style={[styles.actionText, { color: colors.destructive }]}>Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { history, deleteEntry, clearHistory } = useHistory();
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  async function handleCopy(entry: HistoryEntry) {
    await Clipboard.setStringAsync(entry.ideas.join("\n"));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Sil", "Bu kaydı silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => deleteEntry(id),
      },
    ]);
  }

  function handleClearAll() {
    Alert.alert("Tümünü Sil", "Tüm geçmişi silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Tümünü Sil",
        style: "destructive",
        onPress: clearHistory,
      },
    ]);
  }

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
            paddingTop: webTopPad,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Geçmiş</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={[styles.clearText, { color: colors.destructive }]}>Tümünü Sil</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="clock" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Henüz geçmiş yok
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Notlarını işledikçe burada görünecek
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryItemView
              entry={item}
              onDelete={() => handleDelete(item.id)}
              onCopy={() => handleCopy(item)}
              colors={colors}
            />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!history.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  clearText: { fontSize: 14, fontWeight: "500" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  list: { padding: 16, gap: 10 },
  item: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  itemMeta: { flex: 1, gap: 3 },
  itemTitle: { fontSize: 15, fontWeight: "600" },
  itemDate: { fontSize: 12 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: "500" },
  expanded: { borderTopWidth: 1, padding: 14 },
  ideaRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  ideaNum: { fontSize: 13, minWidth: 20 },
  ideaText: { flex: 1, fontSize: 13, lineHeight: 20 },
  dupText: { fontSize: 11, marginTop: 8 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: { fontSize: 12, fontWeight: "500" },
});
