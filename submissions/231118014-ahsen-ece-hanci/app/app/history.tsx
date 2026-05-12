import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Archive, Inbox } from "lucide-react-native";

import { GridBackground } from "@/components/GridBackground";
import { monoFont, theme, verdictLabel } from "@/constants/theme";
import { useAnalysisContext } from "@/providers/AnalysisProvider";

export default function HistoryScreen() {
  const router = useRouter();
  const { analyses } = useAnalysisContext();

  const grouped = useMemo(() => {
    const out: { date: string; items: typeof analyses }[] = [];
    analyses.forEach((a) => {
      const d = new Date(a.createdAt);
      const key = d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
      const last = out[out.length - 1];
      if (last && last.date === key) last.items.push(a);
      else out.push({ date: key, items: [a] });
    });
    return out;
  }, [analyses]);

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          title: "ARCHIVE",
          headerTitleStyle: { color: theme.text, fontFamily: monoFont, fontSize: 13 },
          headerRight: () =>
            analyses.length >= 2 ? (
              <Pressable onPress={() => router.push("/compare")} style={styles.compareBtn} testID="open-compare">
                <Text style={styles.compareLabel}>COMPARE</Text>
              </Pressable>
            ) : null,
        }}
      />
      <GridBackground />
      {analyses.length === 0 ? (
        <View style={styles.empty}>
          <Inbox size={36} color={theme.textFaint} />
          <Text style={styles.emptyTitle}>NO AUTOPSIES YET</Text>
          <Text style={styles.emptySub}>Run your first pitch through Nokta.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.statsBar}>
            <Archive size={14} color={theme.accent} />
            <Text style={styles.statsText}>
              {analyses.length} autopsies · avg{" "}
              {Math.round(analyses.reduce((s, a) => s + a.score, 0) / analyses.length)}/100
            </Text>
          </View>

          {grouped.map((g) => (
            <View key={g.date} style={styles.group}>
              <Text style={styles.groupLabel}>&gt; {g.date}</Text>
              {g.items.map((a) => {
                const v = verdictLabel(a.score);
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => router.push({ pathname: "/result/[id]", params: { id: a.id } })}
                    style={styles.card}
                    testID={`archive-${a.id}`}
                  >
                    <View style={[styles.scoreBlock, { borderColor: v.color }]}>
                      <Text style={[styles.scoreText, { color: v.color }]}>{a.score}</Text>
                      <Text style={[styles.vLabel, { color: v.color }]}>{v.label}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardPitch} numberOfLines={2}>{a.pitch}</Text>
                      <Text style={styles.cardVerdict} numberOfLines={1}>{a.verdict}</Text>
                      <View style={styles.cardMeta}>
                        <Text style={styles.metaChip}>{a.tone}</Text>
                        <Text style={styles.metaChip}>{a.redFlags.length} flags</Text>
                        <Text style={styles.metaChip}>{a.claimsToVerify.length} claims</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { color: theme.text, fontFamily: monoFont, fontSize: 13, letterSpacing: 3, fontWeight: "700", marginTop: 8 },
  emptySub: { color: theme.textDim, fontFamily: monoFont, fontSize: 12 },
  scroll: { padding: 20 },
  statsBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.border, borderRadius: 4, backgroundColor: theme.bgCard, marginBottom: 20 },
  statsText: { color: theme.text, fontFamily: monoFont, fontSize: 12 },
  group: { marginBottom: 20 },
  groupLabel: { color: theme.textDim, fontFamily: monoFont, fontSize: 10, letterSpacing: 2, marginBottom: 10 },
  card: { flexDirection: "row", gap: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 6, padding: 12, marginBottom: 10, backgroundColor: theme.bgCard },
  scoreBlock: { width: 68, borderWidth: 1, borderRadius: 4, alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  scoreText: { fontFamily: monoFont, fontSize: 24, fontWeight: "700" },
  vLabel: { fontFamily: monoFont, fontSize: 8, letterSpacing: 1.2, marginTop: 2 },
  cardPitch: { color: theme.text, fontFamily: monoFont, fontSize: 12, lineHeight: 17 },
  cardVerdict: { color: theme.textDim, fontFamily: monoFont, fontSize: 11, marginTop: 6, fontStyle: "italic" },
  cardMeta: { flexDirection: "row", gap: 6, marginTop: 8 },
  metaChip: { color: theme.textFaint, fontFamily: monoFont, fontSize: 9, letterSpacing: 1, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  compareBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: theme.accent, borderRadius: 3, marginRight: 6 },
  compareLabel: { color: theme.accent, fontFamily: monoFont, fontSize: 10, letterSpacing: 2, fontWeight: "700" },
});
