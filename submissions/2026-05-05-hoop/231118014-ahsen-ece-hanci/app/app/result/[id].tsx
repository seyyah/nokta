import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  GitCompare,
  Search,
  Share2,
  Trash2,
} from "lucide-react-native";

import { DimensionBar } from "@/components/DimensionBar";
import { GridBackground } from "@/components/GridBackground";
import { ScoreGauge } from "@/components/ScoreGauge";
import { monoFont, theme, verdictLabel } from "@/constants/theme";
import { useAnalysisById, useAnalysisContext } from "@/providers/AnalysisProvider";

function severityColor(s: "low" | "medium" | "high"): string {
  if (s === "high") return theme.red;
  if (s === "medium") return theme.amber;
  return theme.blue;
}

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const analysis = useAnalysisById(id);
  const { analyses, deleteAnalysis } = useAnalysisContext();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  const otherAnalyses = useMemo(
    () => (analysis ? analyses.filter((a) => a.id !== analysis.id) : []),
    [analyses, analysis],
  );

  const copyRewrite = useCallback(async () => {
    if (!analysis) return;
    await Clipboard.setStringAsync(analysis.rewrite);
    setCopied(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => setCopied(false), 1600);
  }, [analysis]);

  const shareVerdict = useCallback(async () => {
    if (!analysis) return;
    const v = verdictLabel(analysis.score);
    const msg = `NOKTA // SLOP AUTOPSY\n\nScore: ${analysis.score}/100 — ${v.label}\n\n${analysis.verdict}\n\n— via Nokta Slop Detector`;
    try {
      if (Platform.OS === "web") {
        await Clipboard.setStringAsync(msg);
        Alert.alert("Copied", "Verdict copied to clipboard.");
      } else {
        await Share.share({ message: msg });
      }
    } catch (e) {
      console.log("[Nokta] share error", e);
    }
  }, [analysis]);

  const confirmDelete = useCallback(() => {
    if (!analysis) return;
    Alert.alert("Delete autopsy?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteAnalysis(analysis.id);
          router.back();
        },
      },
    ]);
  }, [analysis, deleteAnalysis, router]);

  const openCompare = useCallback(() => {
    if (!analysis) return;
    if (otherAnalyses.length === 0) {
      Alert.alert("Nothing to compare", "Save at least one more analysis to compare.");
      return;
    }
    router.push({ pathname: "/compare", params: { a: analysis.id } });
  }, [analysis, otherAnalyses.length, router]);

  if (!analysis) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.missing}>Analysis not found.</Text>
      </View>
    );
  }

  const v = verdictLabel(analysis.score);

  return (
    <View style={styles.root} testID="result-screen">
      <Stack.Screen options={{ headerShown: false }} />
      <GridBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn} testID="back">
            <ArrowLeft size={18} color={theme.text} />
          </Pressable>
          <Text style={styles.topTitle}>AUTOPSY REPORT</Text>
          <Pressable onPress={confirmDelete} style={styles.iconBtn} testID="delete">
            <Trash2 size={16} color={theme.textDim} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.verdictCard}>
            <Text style={styles.reportTag}>&gt; FINAL VERDICT</Text>
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <ScoreGauge score={analysis.score} />
            </View>
            <Text style={[styles.verdictHeadline, { color: v.color }]}>{analysis.verdict}</Text>
            <Text style={styles.summary}>{analysis.summary}</Text>

            <View style={styles.actionRow}>
              <Pressable onPress={shareVerdict} style={styles.actionBtn} testID="share">
                <Share2 size={14} color={theme.accent} />
                <Text style={styles.actionLabel}>SHARE</Text>
              </Pressable>
              <Pressable onPress={openCompare} style={styles.actionBtn} testID="compare">
                <GitCompare size={14} color={theme.accent} />
                <Text style={styles.actionLabel}>COMPARE</Text>
              </Pressable>
            </View>
          </View>

          <Section label="DIMENSIONS" count={analysis.dimensions.length}>
            {analysis.dimensions.map((d, i) => (
              <DimensionBar key={d.key} dimension={d} delay={i * 120} />
            ))}
          </Section>

          {analysis.redFlags.length > 0 && (
            <Section label="RED FLAGS" count={analysis.redFlags.length} accent={theme.red}>
              {analysis.redFlags.map((f, i) => {
                const open = expanded[i] ?? false;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setExpanded((p) => ({ ...p, [i]: !open }))}
                    style={styles.flagCard}
                    testID={`flag-${i}`}
                  >
                    <View style={styles.flagHead}>
                      <View style={[styles.sevDot, { backgroundColor: severityColor(f.severity) }]} />
                      <AlertTriangle size={14} color={severityColor(f.severity)} />
                      <Text style={styles.flagTitle}>{f.title}</Text>
                      {open ? <ChevronUp size={14} color={theme.textDim} /> : <ChevronDown size={14} color={theme.textDim} />}
                    </View>
                    {open && (
                      <View style={styles.flagBody}>
                        <Text style={styles.flagQuote}>"{f.quote}"</Text>
                        <Text style={styles.flagExp}>{f.explanation}</Text>
                        <Text style={[styles.sevLabel, { color: severityColor(f.severity) }]}>
                          SEVERITY: {f.severity.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </Section>
          )}

          {analysis.claimsToVerify.length > 0 && (
            <Section label="CLAIMS TO VERIFY" count={analysis.claimsToVerify.length} accent={theme.amber}>
              {analysis.claimsToVerify.map((c, i) => {
                const isChecked = checked[i] ?? false;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setChecked((p) => ({ ...p, [i]: !isChecked }))}
                    style={styles.claimRow}
                    testID={`claim-${i}`}
                  >
                    <View style={[styles.checkbox, isChecked && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
                      {isChecked && <Check size={11} color="#000" strokeWidth={4} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.claim, isChecked && styles.claimDone]}>{c.claim}</Text>
                      <View style={styles.whyRow}>
                        <Search size={11} color={theme.textFaint} />
                        <Text style={styles.why}>{c.why}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </Section>
          )}

          <Section label="GROUNDED REWRITE" accent={theme.accent}>
            <View style={styles.rewriteCard}>
              <Text style={styles.rewriteText}>{analysis.rewrite}</Text>
              <Pressable onPress={copyRewrite} style={styles.copyBtn} testID="copy-rewrite">
                {copied ? (
                  <>
                    <Check size={13} color={theme.accent} />
                    <Text style={styles.copyLabel}>COPIED</Text>
                  </>
                ) : (
                  <>
                    <Copy size={13} color={theme.accent} />
                    <Text style={styles.copyLabel}>COPY</Text>
                  </>
                )}
              </Pressable>
            </View>
          </Section>

          <View style={styles.meta}>
            <Text style={styles.metaLine}>&gt; autopsy_id: {analysis.id}</Text>
            <Text style={styles.metaLine}>&gt; tone: {analysis.tone}</Text>
            <Text style={styles.metaLine}>&gt; ts: {new Date(analysis.createdAt).toISOString()}</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({
  label,
  count,
  accent,
  children,
}: {
  label: string;
  count?: number;
  accent?: string;
  children: React.ReactNode;
}) {
  const c = accent ?? theme.accent;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionBar, { backgroundColor: c }]} />
        <Text style={[styles.sectionLabel, { color: c }]}>{label}</Text>
        {count !== undefined && <Text style={styles.sectionCount}>[{count}]</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  center: { alignItems: "center", justifyContent: "center" },
  missing: { color: theme.textDim, fontFamily: monoFont },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 4, borderWidth: 1, borderColor: theme.border, alignItems: "center", justifyContent: "center" },
  topTitle: { color: theme.text, fontFamily: monoFont, fontSize: 12, letterSpacing: 3, fontWeight: "700" },
  scroll: { padding: 20, paddingBottom: 60 },
  verdictCard: { borderWidth: 1, borderColor: theme.borderStrong, borderRadius: 6, padding: 20, backgroundColor: theme.bgCard, alignItems: "center" },
  reportTag: { color: theme.accent, fontFamily: monoFont, fontSize: 10, letterSpacing: 2, alignSelf: "flex-start" },
  verdictHeadline: { fontFamily: monoFont, fontSize: 15, fontWeight: "700", textAlign: "center", marginTop: 16, lineHeight: 21 },
  summary: { color: theme.textDim, fontFamily: monoFont, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 10 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 4, backgroundColor: theme.bgElevated },
  actionLabel: { color: theme.accent, fontFamily: monoFont, fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  section: { marginTop: 28 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionBar: { width: 3, height: 14, borderRadius: 1 },
  sectionLabel: { fontFamily: monoFont, fontSize: 12, letterSpacing: 3, fontWeight: "700" },
  sectionCount: { color: theme.textFaint, fontFamily: monoFont, fontSize: 11 },
  flagCard: { borderWidth: 1, borderColor: theme.border, borderRadius: 4, padding: 12, marginBottom: 8, backgroundColor: theme.bgCard },
  flagHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  sevDot: { width: 8, height: 8, borderRadius: 4 },
  flagTitle: { flex: 1, color: theme.text, fontFamily: monoFont, fontSize: 13, fontWeight: "600" },
  flagBody: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: theme.border },
  flagQuote: { color: theme.amber, fontFamily: monoFont, fontSize: 12, fontStyle: "italic", marginBottom: 8, lineHeight: 18 },
  flagExp: { color: theme.textDim, fontFamily: monoFont, fontSize: 12, lineHeight: 18 },
  sevLabel: { fontFamily: monoFont, fontSize: 10, letterSpacing: 1.5, marginTop: 8, fontWeight: "700" },
  claimRow: { flexDirection: "row", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.border },
  checkbox: { width: 20, height: 20, borderRadius: 3, borderWidth: 1, borderColor: theme.borderStrong, alignItems: "center", justifyContent: "center", marginTop: 2 },
  claim: { color: theme.text, fontFamily: monoFont, fontSize: 13, lineHeight: 19 },
  claimDone: { color: theme.textFaint, textDecorationLine: "line-through" },
  whyRow: { flexDirection: "row", gap: 6, alignItems: "flex-start", marginTop: 4 },
  why: { flex: 1, color: theme.textDim, fontFamily: monoFont, fontSize: 11, lineHeight: 16 },
  rewriteCard: { borderWidth: 1, borderColor: theme.accent, borderRadius: 6, padding: 16, backgroundColor: "rgba(0,255,136,0.04)" },
  rewriteText: { color: theme.text, fontFamily: monoFont, fontSize: 13, lineHeight: 20 },
  copyBtn: { alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: theme.accent, borderRadius: 3 },
  copyLabel: { color: theme.accent, fontFamily: monoFont, fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  meta: { marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderColor: theme.border },
  metaLine: { color: theme.textFaint, fontFamily: monoFont, fontSize: 10, lineHeight: 16 },
});
