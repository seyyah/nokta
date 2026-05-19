import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";

import { DimensionBar } from "@/components/DimensionBar";
import { GridBackground } from "@/components/GridBackground";
import { monoFont, theme, verdictLabel } from "@/constants/theme";
import { useAnalysisContext } from "@/providers/AnalysisProvider";

export default function CompareScreen() {
  const { a: initialA } = useLocalSearchParams<{ a?: string }>();
  const { analyses } = useAnalysisContext();

  const [aId, setAId] = useState<string | undefined>(initialA ?? analyses[0]?.id);
  const [bId, setBId] = useState<string | undefined>(
    analyses.find((x) => x.id !== (initialA ?? analyses[0]?.id))?.id,
  );

  const a = useMemo(() => analyses.find((x) => x.id === aId), [analyses, aId]);
  const b = useMemo(() => analyses.find((x) => x.id === bId), [analyses, bId]);

  const delta = useMemo(() => (a && b ? a.score - b.score : 0), [a, b]);

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          title: "COMPARE",
          headerTitleStyle: { color: theme.text, fontFamily: monoFont, fontSize: 13 },
        }}
      />
      <GridBackground />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.tag}>&gt; SELECT A</Text>
        <Selector items={analyses} value={aId} onChange={setAId} other={bId} testPrefix="pickA" />

        <Text style={[styles.tag, { marginTop: 20 }]}>&gt; SELECT B</Text>
        <Selector items={analyses} value={bId} onChange={setBId} other={aId} testPrefix="pickB" />

        {a && b && (
          <View style={styles.diffCard}>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={[styles.bigScore, { color: verdictLabel(a.score).color }]}>{a.score}</Text>
              <Text style={styles.sideLabel}>A</Text>
            </View>
            <View style={styles.deltaBlock}>
              <Text style={styles.deltaLabel}>Δ</Text>
              <Text style={[styles.deltaValue, { color: delta === 0 ? theme.textDim : delta > 0 ? theme.red : theme.accent }]}>
                {delta > 0 ? "+" : ""}{delta}
              </Text>
            </View>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={[styles.bigScore, { color: verdictLabel(b.score).color }]}>{b.score}</Text>
              <Text style={styles.sideLabel}>B</Text>
            </View>
          </View>
        )}

        {a && b && (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: theme.accent }]} />
              <Text style={styles.legendText}>A (primary)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: theme.blue, opacity: 0.7 }]} />
              <Text style={styles.legendText}>B (overlay)</Text>
            </View>
          </View>
        )}

        {a && b && (
          <View style={{ marginTop: 16 }}>
            {a.dimensions.map((d, i) => {
              const other = b.dimensions.find((x) => x.key === d.key);
              return <DimensionBar key={d.key} dimension={d} delay={i * 100} compareScore={other?.score} />;
            })}
          </View>
        )}

        {(!a || !b) && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>Pick two different autopsies to compare.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Selector({
  items,
  value,
  onChange,
  other,
  testPrefix,
}: {
  items: ReturnType<typeof useAnalysisContext>["analyses"];
  value?: string;
  onChange: (id: string) => void;
  other?: string;
  testPrefix: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selector}>
      {items.map((it) => {
        const v = verdictLabel(it.score);
        const active = value === it.id;
        const disabled = other === it.id;
        return (
          <Pressable
            key={it.id}
            onPress={() => !disabled && onChange(it.id)}
            disabled={disabled}
            style={[
              styles.selCard,
              active && { borderColor: theme.accent, backgroundColor: "rgba(0,255,136,0.06)" },
              disabled && { opacity: 0.3 },
            ]}
            testID={`${testPrefix}-${it.id}`}
          >
            {active && (
              <View style={styles.selCheck}>
                <Check size={10} color="#000" strokeWidth={4} />
              </View>
            )}
            <Text style={[styles.selScore, { color: v.color }]}>{it.score}</Text>
            <Text style={styles.selPitch} numberOfLines={2}>{it.pitch}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: 20 },
  tag: { color: theme.textDim, fontFamily: monoFont, fontSize: 10, letterSpacing: 2, marginBottom: 10 },
  selector: { gap: 10, paddingRight: 10 },
  selCard: { width: 150, borderWidth: 1, borderColor: theme.border, borderRadius: 6, padding: 12, backgroundColor: theme.bgCard, position: "relative" },
  selCheck: { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: theme.accent, alignItems: "center", justifyContent: "center" },
  selScore: { fontFamily: monoFont, fontSize: 22, fontWeight: "700" },
  selPitch: { color: theme.textDim, fontFamily: monoFont, fontSize: 10, marginTop: 6, lineHeight: 14 },
  diffCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, borderWidth: 1, borderColor: theme.borderStrong, borderRadius: 6, padding: 20, backgroundColor: theme.bgCard },
  bigScore: { fontFamily: monoFont, fontSize: 52, fontWeight: "700", letterSpacing: -2 },
  sideLabel: { color: theme.textDim, fontFamily: monoFont, fontSize: 11, letterSpacing: 3, marginTop: 2 },
  deltaBlock: { alignItems: "center", paddingHorizontal: 14 },
  deltaLabel: { color: theme.textFaint, fontFamily: monoFont, fontSize: 22 },
  deltaValue: { fontFamily: monoFont, fontSize: 22, fontWeight: "700", marginTop: 2 },
  legend: { flexDirection: "row", gap: 18, marginTop: 20, marginBottom: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendSwatch: { width: 12, height: 6, borderRadius: 1 },
  legendText: { color: theme.textDim, fontFamily: monoFont, fontSize: 10, letterSpacing: 1 },
  hint: { marginTop: 30, alignItems: "center" },
  hintText: { color: theme.textFaint, fontFamily: monoFont, fontSize: 12 },
});
