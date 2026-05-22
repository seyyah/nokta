import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getIdea } from "@/data/ideas";
import { slopColor, slopLabel } from "@/lib/slop";

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idea = getIdea(id);

  if (!idea) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <Text style={styles.missing}>Idea not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      {/* FORGE cycle 4: content is now a ScrollView, so long descriptions scroll
          and the STATUS row is always reachable (cycle 3 proved flex alone can't
          fix unbounded content in a fixed viewport). */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.header}>
          <Text style={styles.title}>{idea.title}</Text>
          <View style={[styles.badge, { backgroundColor: slopColor(idea.slopScore) }]}>
            <Text style={styles.badgeScore}>{idea.slopScore}</Text>
            <Text style={styles.badgeLabel}>{slopLabel(idea.slopScore)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>PITCH</Text>
        <Text style={styles.pitch}>{idea.pitch}</Text>

        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
        <Text style={styles.description}>{idea.description}</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>STATUS</Text>
          <Text style={styles.statusValue}>Draft · awaiting forge review</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },
  content: { flex: 1 },
  contentInner: { padding: 20, paddingBottom: 40 },
  missing: { color: "#94A3B8", fontSize: 16, padding: 20 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  title: { color: "#F9FAFB", fontSize: 22, fontWeight: "800", flex: 1, lineHeight: 28 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignItems: "center" },
  badgeScore: { color: "#0B1220", fontSize: 16, fontWeight: "900" },
  badgeLabel: { color: "#0B1220", fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  sectionLabel: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 6,
  },
  pitch: { color: "#CBD5E1", fontSize: 15, lineHeight: 22, fontStyle: "italic" },
  description: { color: "#E2E8F0", fontSize: 15, lineHeight: 23 },
  statusRow: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#2C3E5F" },
  statusLabel: { color: "#64748B", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  statusValue: { color: "#CBD5E1", fontSize: 14, marginTop: 4 },
});
