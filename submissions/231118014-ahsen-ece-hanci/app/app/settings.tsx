import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Check, Flame, Hand, Target, Trash2 } from "lucide-react-native";

import { GridBackground } from "@/components/GridBackground";
import { monoFont, theme } from "@/constants/theme";
import { useAnalysisContext } from "@/providers/AnalysisProvider";
import type { AnalysisTone } from "@/types/analysis";

const TONES: { key: AnalysisTone; label: string; desc: string; Icon: typeof Target }[] = [
  { key: "standard", label: "STANDARD", desc: "Direct, analytical, fair. Default VC eye.", Icon: Target },
  { key: "brutal", label: "BRUTAL", desc: "Merciless. Calls out every weak word.", Icon: Flame },
  { key: "merciful", label: "MERCIFUL", desc: "Constructive and kind, but still honest.", Icon: Hand },
];

export default function SettingsScreen() {
  const { tone, setTone, analyses, clearAll } = useAnalysisContext();

  const confirmClear = () => {
    if (analyses.length === 0) return;
    Alert.alert("Clear archive?", `This will delete ${analyses.length} autopsies.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => clearAll() },
    ]);
  };

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          title: "SETTINGS",
          headerTitleStyle: { color: theme.text, fontFamily: monoFont, fontSize: 13 },
        }}
      />
      <GridBackground />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>&gt; ANALYSIS TONE</Text>
        <View style={styles.group}>
          {TONES.map((t) => {
            const active = tone === t.key;
            const Icon = t.Icon;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTone(t.key)}
                style={[styles.row, active && styles.rowActive]}
                testID={`tone-${t.key}`}
              >
                <Icon size={16} color={active ? theme.accent : theme.textDim} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, active && { color: theme.accent }]}>{t.label}</Text>
                  <Text style={styles.rowDesc}>{t.desc}</Text>
                </View>
                {active && <Check size={14} color={theme.accent} />}
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>&gt; ARCHIVE</Text>
        <View style={styles.group}>
          <Pressable onPress={confirmClear} style={styles.row} disabled={analyses.length === 0} testID="clear-archive">
            <Trash2 size={16} color={analyses.length === 0 ? theme.textFaint : theme.red} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: analyses.length === 0 ? theme.textFaint : theme.red }]}>CLEAR ALL AUTOPSIES</Text>
              <Text style={styles.rowDesc}>
                {analyses.length === 0 ? "Nothing stored." : `${analyses.length} saved locally on this device.`}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLine}>&gt; NOKTA // SLOP DETECTOR v1.0</Text>
          <Text style={styles.footerLine}>&gt; all analyses live on-device only.</Text>
          <Text style={styles.footerLine}>&gt; no pitch ever leaves your archive.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: 20 },
  sectionLabel: { color: theme.textDim, fontFamily: monoFont, fontSize: 10, letterSpacing: 2, marginBottom: 10 },
  group: { borderWidth: 1, borderColor: theme.border, borderRadius: 6, overflow: "hidden", backgroundColor: theme.bgCard },
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderBottomWidth: 1, borderColor: theme.border },
  rowActive: { backgroundColor: "rgba(0,255,136,0.04)" },
  rowTitle: { color: theme.text, fontFamily: monoFont, fontSize: 13, fontWeight: "700", letterSpacing: 1.5 },
  rowDesc: { color: theme.textDim, fontFamily: monoFont, fontSize: 11, marginTop: 3, lineHeight: 15 },
  footer: { marginTop: 40, paddingTop: 20, borderTopWidth: 1, borderColor: theme.border, gap: 4 },
  footerLine: { color: theme.textFaint, fontFamily: monoFont, fontSize: 10, lineHeight: 15 },
});
