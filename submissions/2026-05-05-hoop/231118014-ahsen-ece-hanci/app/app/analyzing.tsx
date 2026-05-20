import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";

import { Brand } from "@/components/Brand";
import { GridBackground } from "@/components/GridBackground";
import { monoFont, theme } from "@/constants/theme";

const LOG_LINES: string[] = [
  "booting autopsy chamber...",
  "tokenizing pitch payload...",
  "parsing declarative claims...",
  "cross-checking TAM figures...",
  "scanning for buzzword clusters...",
  "probing competitor awareness...",
  "detecting magical thinking...",
  "running evidence filter...",
  "computing novelty vector...",
  "measuring feasibility entropy...",
  "assembling verdict...",
];

export default function AnalyzingScreen() {
  const router = useRouter();
  const [lines, setLines] = useState<string[]>([]);
  const cursor = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setLines((prev) => (i < LOG_LINES.length ? [...prev, LOG_LINES[i]] : prev));
      i += 1;
    }, 550);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursor, { toValue: 0, duration: 500, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(cursor, { toValue: 1, duration: 500, easing: Easing.linear, useNativeDriver: true }),
      ]),
    ).start();
  }, [cursor]);

  return (
    <View style={styles.root} testID="analyzing-screen">
      <GridBackground />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Brand subtitle="RUNNING DIAGNOSTICS" />
          <Pressable onPress={() => router.back()} style={styles.closeBtn} testID="cancel-analysis">
            <X size={18} color={theme.textDim} />
          </Pressable>
        </View>

        <View style={styles.center}>
          <View style={styles.scanner}>
            <View style={styles.scanCore} />
            <View style={styles.scanRing} />
            <View style={[styles.scanRing, styles.scanRing2]} />
          </View>
          <Text style={styles.status}>AUTOPSY IN PROGRESS</Text>
          <Text style={styles.statusSub}>hold tight // ~8-12s</Text>
        </View>

        <View style={styles.terminal}>
          <View style={styles.terminalHead}>
            <View style={[styles.dot, { backgroundColor: theme.red }]} />
            <View style={[styles.dot, { backgroundColor: theme.amber }]} />
            <View style={[styles.dot, { backgroundColor: theme.accent }]} />
            <Text style={styles.termTitle}>nokta://autopsy</Text>
          </View>
          <View style={styles.terminalBody}>
            {lines.map((l, i) => (
              <Text key={i} style={styles.logLine}>
                <Text style={{ color: theme.accent }}>&gt; </Text>
                {l}
              </Text>
            ))}
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.logLine}>
                <Text style={{ color: theme.accent }}>&gt; </Text>
              </Text>
              <Animated.Text style={[styles.cursor, { opacity: cursor }]}>█</Animated.Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  closeBtn: { width: 36, height: 36, borderRadius: 4, borderWidth: 1, borderColor: theme.border, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  scanner: { width: 140, height: 140, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  scanCore: { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.accent, shadowColor: theme.accent, shadowOpacity: 0.8, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } },
  scanRing: { position: "absolute", width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: theme.accent, opacity: 0.4 },
  scanRing2: { width: 130, height: 130, borderRadius: 65, opacity: 0.15 },
  status: { color: theme.accent, fontFamily: monoFont, fontSize: 13, letterSpacing: 3, fontWeight: "700" },
  statusSub: { color: theme.textDim, fontFamily: monoFont, fontSize: 11, marginTop: 6 },
  terminal: { marginHorizontal: 20, flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 6, backgroundColor: "#07090B", marginBottom: 20 },
  terminalHead: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderBottomWidth: 1, borderColor: theme.border },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  termTitle: { flex: 1, textAlign: "center", color: theme.textFaint, fontFamily: monoFont, fontSize: 10, letterSpacing: 1 },
  terminalBody: { padding: 14, flex: 1 },
  logLine: { color: theme.text, fontFamily: monoFont, fontSize: 12, lineHeight: 20 },
  cursor: { color: theme.accent, fontFamily: monoFont, fontSize: 12, lineHeight: 20 },
});
