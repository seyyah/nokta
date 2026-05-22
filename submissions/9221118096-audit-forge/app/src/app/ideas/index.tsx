import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IDEAS, type Idea } from "@/data/ideas";
import { slopColor, slopLabel } from "@/lib/slop";

function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/ideas/${idea.id}`)}>
      <View style={styles.cardHeader}>
        {/* FORGE cycle 2: title is now flex-constrained + clamped to 2 lines, and
            the badge no longer shrinks, so it always stays fully on-screen. */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {idea.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: slopColor(idea.slopScore) }]}>
          <Text style={styles.badgeScore}>{idea.slopScore}</Text>
          <Text style={styles.badgeLabel}>{slopLabel(idea.slopScore)}</Text>
        </View>
      </View>
      <Text style={styles.cardPitch} numberOfLines={2}>
        {idea.pitch}
      </Text>
    </Pressable>
  );
}

// FORGE cycle 5: friendly empty state (feature request from audit report 04).
function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyDot}>·</Text>
      <Text style={styles.emptyTitle}>No ideas yet</Text>
      <Text style={styles.emptyBody}>
        Capture your first scattered dot and Nokta will help you ground it.
      </Text>
      <Pressable style={styles.emptyCta} onPress={() => router.push("/")}>
        <Text style={styles.emptyCtaText}>Add your first dot</Text>
      </Pressable>
    </View>
  );
}

export default function IdeaListScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        data={IDEAS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[styles.list, IDEAS.length === 0 && styles.listEmpty]}
        renderItem={({ item }) => <IdeaCard idea={item} />}
        ListEmptyComponent={EmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#1E2A44",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2C3E5F",
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start" },
  cardTitle: { color: "#F9FAFB", fontSize: 16, fontWeight: "700", flex: 1, marginRight: 12 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignItems: "center", flexShrink: 0 },
  badgeScore: { color: "#0B1220", fontSize: 16, fontWeight: "900" },
  badgeLabel: { color: "#0B1220", fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  cardPitch: { color: "#94A3B8", fontSize: 13, marginTop: 8, lineHeight: 18 },
  listEmpty: { flexGrow: 1, justifyContent: "center" },
  empty: { alignItems: "center", paddingHorizontal: 32, gap: 8 },
  emptyDot: { color: "#D4AF37", fontSize: 56, lineHeight: 56, fontWeight: "900" },
  emptyTitle: { color: "#F9FAFB", fontSize: 20, fontWeight: "800" },
  emptyBody: { color: "#94A3B8", fontSize: 14, textAlign: "center", lineHeight: 20 },
  emptyCta: {
    marginTop: 12,
    backgroundColor: "#D4AF37",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyCtaText: { color: "#0B1220", fontSize: 15, fontWeight: "800" },
});
