import { Bug, ChevronRight, Crosshair, GitCommit, Hash, Zap } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const { palette } = Colors;

type Metric = { label: string; value: string; delta: string; positive: boolean };
const METRICS: Metric[] = [
  { label: "OPEN BUGS", value: "12", delta: "+3", positive: false },
  { label: "RESOLVED", value: "47", delta: "+8", positive: true },
  { label: "CYCLE TIME", value: "14m", delta: "-2m", positive: true },
  { label: "ROLLBACKS", value: "2", delta: "0", positive: true },
];

type LogItem = { id: string; tag: string; title: string; meta: string; status: "open" | "fixed" | "rolled-back" };
const LOG: LogItem[] = [
  { id: "1", tag: "A", title: "Tab bar overlaps last list row", meta: "/notes · 2m ago", status: "open" },
  { id: "2", tag: "B", title: "Toggle label clipped on narrow widths", meta: "/settings · 14m ago", status: "fixed" },
  { id: "3", tag: "C", title: "FAB shadow renders behind modal on Android", meta: "/ · 1h ago", status: "rolled-back" },
  { id: "4", tag: "D", title: "Empty state copy too dim", meta: "/notes · 3h ago", status: "fixed" },
];

const STATUS_COLOR: Record<LogItem["status"], string> = {
  open: palette.yellow,
  fixed: palette.green,
  "rolled-back": palette.red,
};

export default function PulseScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
      showsVerticalScrollIndicator={false}
      testID="pulse-screen"
    >
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Crosshair size={12} color={palette.yellow} strokeWidth={2.6} />
          <Text style={styles.heroBadgeText}>AUDIT · FORGE · v1</Text>
        </View>
        <Text style={styles.heroTitle}>Customer catches.{"\n"}Agent fixes.</Text>
        <Text style={styles.heroSub}>
          Tap the yellow dot to mark anything on screen. Generate a Markdown report and feed it straight into your coding agent.
        </Text>

        <View style={styles.heroCta}>
          <View style={styles.heroDot} />
          <Text style={styles.heroCtaText}>Try it — drag a region anywhere</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader icon={<Zap size={12} color={palette.yellow} />} label="LIVE METRICS" />
        <View style={styles.metricsGrid}>
          {METRICS.map((m) => (
            <View key={m.label} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text
                style={[
                  styles.metricDelta,
                  { color: m.positive ? palette.green : palette.red },
                ]}
              >
                {m.delta}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader icon={<GitCommit size={12} color={palette.yellow} />} label="FORGE LEDGER" />
        <View style={styles.list}>
          {LOG.map((item, i) => (
            <Pressable
              key={item.id}
              style={[styles.logRow, i === LOG.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={[styles.logTag, { borderColor: STATUS_COLOR[item.status] }]}>
                <Text style={[styles.logTagText, { color: STATUS_COLOR[item.status] }]}>{item.tag}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.logTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.logMeta}>{item.meta}</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
              <ChevronRight size={16} color={palette.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader icon={<Hash size={12} color={palette.yellow} />} label="HOW IT WORKS" />
        <View style={styles.steps}>
          <Step n={1} title="Tap the FAB" desc="The yellow bug button enters audit mode." />
          <Step n={2} title="Mark + note" desc="Drag yellow boxes around issues. Tap to add notes." />
          <Step n={3} title="Generate .md" desc="Burn-in Markdown ready for your coding agent." />
        </View>
      </View>

      <View style={styles.footerNote}>
        <Bug size={12} color={palette.textMuted} />
        <Text style={styles.footerText}>Drop-in widget · {Platform.OS}</Text>
      </View>
    </ScrollView>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{String(n).padStart(2, "0")}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  hero: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: palette.yellow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: palette.yellow,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: palette.text,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 38,
    letterSpacing: -1,
  },
  heroSub: {
    color: palette.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 320,
  },
  heroCta: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  heroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.yellow,
  },
  heroCtaText: { color: palette.text, fontSize: 13, fontWeight: "600" },
  section: { paddingHorizontal: 20, marginTop: 14 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionLabel: {
    color: palette.yellow,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: palette.border },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  metricLabel: {
    color: palette.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  metricValue: {
    color: palette.text,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 6,
    letterSpacing: -0.5,
  },
  metricDelta: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  list: {
    backgroundColor: palette.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: "hidden",
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  logTag: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  logTagText: { fontWeight: "900", fontSize: 12 },
  logTitle: { color: palette.text, fontSize: 14, fontWeight: "600" },
  logMeta: { color: palette.textMuted, fontSize: 11, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  steps: { gap: 10 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
  },
  stepNum: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: palette.ink2,
    borderWidth: 1,
    borderColor: palette.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    color: palette.yellow,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },
  stepTitle: { color: palette.text, fontSize: 14, fontWeight: "700" },
  stepDesc: { color: palette.textDim, fontSize: 12, marginTop: 2 },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: palette.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "700",
  },
});
