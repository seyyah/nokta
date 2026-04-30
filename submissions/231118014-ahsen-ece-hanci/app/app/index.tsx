import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Archive, Beaker, Settings as SettingsIcon, Sparkles } from "lucide-react-native";

import { Brand } from "@/components/Brand";
import { GridBackground } from "@/components/GridBackground";
import { NeonButton } from "@/components/NeonButton";
import { SAMPLE_PITCHES } from "@/constants/samples";
import { monoFont, theme, verdictLabel } from "@/constants/theme";
import { useAnalysisContext } from "@/providers/AnalysisProvider";

export default function HomeScreen() {
  const router = useRouter();
  const [pitch, setPitch] = useState<string>("");
  const { analyses, analyzeMutation, saveAnalysis, tone } = useAnalysisContext();

  const canRun = useMemo(() => pitch.trim().length >= 30 && !analyzeMutation.isPending, [pitch, analyzeMutation.isPending]);

  const run = useCallback(async () => {
    if (!canRun) return;
    router.push("/analyzing");
    try {
      const result = await analyzeMutation.mutateAsync({ pitch: pitch.trim(), tone });
      await saveAnalysis(result);
      router.replace({ pathname: "/result/[id]", params: { id: result.id } });
    } catch (e) {
      console.log("[Nokta] analyze failed", e);
      router.back();
    }
  }, [canRun, analyzeMutation, pitch, tone, router, saveAnalysis]);

  const recent = useMemo(() => analyses.slice(0, 5), [analyses]);

  return (
    <View style={styles.root} testID="home-screen">
      <GridBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Brand />
              <View style={styles.headerActions}>
                <Pressable onPress={() => router.push("/history")} style={styles.iconBtn} testID="open-history">
                  <Archive size={18} color={theme.textDim} />
                </Pressable>
                <Pressable onPress={() => router.push("/settings")} style={styles.iconBtn} testID="open-settings">
                  <SettingsIcon size={18} color={theme.textDim} />
                </Pressable>
              </View>
            </View>

            <View style={styles.hero}>
              <Text style={styles.heroTag}>&gt; DISSECTION CHAMBER</Text>
              <Text style={styles.heroTitle}>Paste a pitch.</Text>
              <Text style={styles.heroTitle}>
                We'll <Text style={{ color: theme.accent }}>autopsy</Text> it.
              </Text>
              <Text style={styles.heroSub}>
                Instant VC-grade due diligence. Slop score, red flags, claims to verify, grounded rewrite.
              </Text>
            </View>

            <View style={styles.editorWrap}>
              <View style={styles.editorHeader}>
                <View style={styles.dots}>
                  <View style={[styles.statusDot, { backgroundColor: theme.red }]} />
                  <View style={[styles.statusDot, { backgroundColor: theme.amber }]} />
                  <View style={[styles.statusDot, { backgroundColor: theme.accent }]} />
                </View>
                <Text style={styles.editorTitle}>pitch.txt</Text>
                <Text style={styles.editorCount}>{pitch.length} ch</Text>
              </View>
              <TextInput
                testID="pitch-input"
                value={pitch}
                onChangeText={setPitch}
                multiline
                placeholder="// e.g. 'We are building the world's first AI-powered blockchain dog walker...'"
                placeholderTextColor={theme.textFaint}
                style={styles.input}
                textAlignVertical="top"
                autoCapitalize="sentences"
                autoCorrect
              />
              <View style={styles.editorFooter}>
                <Text style={styles.toneBadge}>TONE: {tone.toUpperCase()}</Text>
                {pitch.length > 0 && (
                  <Pressable onPress={() => setPitch("")} hitSlop={8}>
                    <Text style={styles.clearBtn}>clear</Text>
                  </Pressable>
                )}
              </View>
            </View>

            <View style={styles.samples}>
              <Text style={styles.samplesLabel}>
                <Sparkles size={10} color={theme.textDim} /> LOAD SAMPLE
              </Text>
              <View style={styles.sampleList}>
                {SAMPLE_PITCHES.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => setPitch(s.text)}
                    style={({ pressed }) => [styles.sampleChip, pressed && { borderColor: theme.accent }]}
                    testID={`sample-${s.id}`}
                  >
                    <Text style={styles.sampleLabel}>{s.label}</Text>
                    <Text style={styles.sampleSub}>{s.subtitle}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {recent.length > 0 && (
              <View style={styles.recent}>
                <Text style={styles.recentLabel}>&gt; RECENT AUTOPSIES</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {recent.map((a) => {
                    const v = verdictLabel(a.score);
                    return (
                      <Pressable
                        key={a.id}
                        onPress={() => router.push({ pathname: "/result/[id]", params: { id: a.id } })}
                        style={styles.recentCard}
                        testID={`recent-${a.id}`}
                      >
                        <View style={styles.recentHead}>
                          <Text style={[styles.recentScore, { color: v.color }]}>{a.score}</Text>
                          <Text style={[styles.recentVerdict, { color: v.color }]}>{v.label}</Text>
                        </View>
                        <Text style={styles.recentPitch} numberOfLines={3}>{a.pitch}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>

          <View style={styles.ctaBar}>
            <NeonButton
              label={analyzeMutation.isPending ? "RUNNING..." : "RUN AUTOPSY"}
              onPress={run}
              disabled={!canRun}
              icon={<Beaker size={16} color={theme.accent} />}
              testID="run-autopsy"
            />
            {pitch.trim().length > 0 && pitch.trim().length < 30 && (
              <Text style={styles.hint}>// need at least 30 chars</Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  header: { marginBottom: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 4, borderWidth: 1, borderColor: theme.border, alignItems: "center", justifyContent: "center" },
  hero: { marginBottom: 24 },
  heroTag: { color: theme.accent, fontFamily: monoFont, fontSize: 11, letterSpacing: 2, marginBottom: 12 },
  heroTitle: { color: theme.text, fontSize: 36, fontWeight: "800", letterSpacing: -1.5, lineHeight: 40 },
  heroSub: { color: theme.textDim, fontSize: 13, fontFamily: monoFont, marginTop: 14, lineHeight: 19 },
  editorWrap: { borderWidth: 1, borderColor: theme.borderStrong, backgroundColor: theme.bgCard, borderRadius: 6, overflow: "hidden" },
  editorHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.border, gap: 10 },
  dots: { flexDirection: "row", gap: 5 },
  statusDot: { width: 9, height: 9, borderRadius: 4.5 },
  editorTitle: { flex: 1, color: theme.textDim, fontFamily: monoFont, fontSize: 11, letterSpacing: 1, textAlign: "center" },
  editorCount: { color: theme.textFaint, fontFamily: monoFont, fontSize: 10 },
  input: { minHeight: 200, color: theme.text, fontFamily: monoFont, fontSize: 14, padding: 14, lineHeight: 21 },
  editorFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderColor: theme.border },
  toneBadge: { color: theme.accent, fontFamily: monoFont, fontSize: 10, letterSpacing: 1.5 },
  clearBtn: { color: theme.textDim, fontFamily: monoFont, fontSize: 11, textDecorationLine: "underline" },
  samples: { marginTop: 20 },
  samplesLabel: { color: theme.textDim, fontFamily: monoFont, fontSize: 10, letterSpacing: 2, marginBottom: 10 },
  sampleList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sampleChip: { borderWidth: 1, borderColor: theme.border, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: theme.bgElevated },
  sampleLabel: { color: theme.text, fontFamily: monoFont, fontSize: 12, fontWeight: "600" },
  sampleSub: { color: theme.textFaint, fontFamily: monoFont, fontSize: 10, marginTop: 2 },
  recent: { marginTop: 28 },
  recentLabel: { color: theme.textDim, fontFamily: monoFont, fontSize: 10, letterSpacing: 2, marginBottom: 10 },
  recentCard: { width: 180, borderWidth: 1, borderColor: theme.border, borderRadius: 6, padding: 12, backgroundColor: theme.bgCard },
  recentHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 },
  recentScore: { fontFamily: monoFont, fontSize: 22, fontWeight: "700" },
  recentVerdict: { fontFamily: monoFont, fontSize: 9, letterSpacing: 1.5 },
  recentPitch: { color: theme.textDim, fontFamily: monoFont, fontSize: 11, lineHeight: 15 },
  ctaBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderColor: theme.border, backgroundColor: theme.bg },
  hint: { color: theme.textDim, fontFamily: monoFont, fontSize: 10, textAlign: "center", marginTop: 6 },
});
