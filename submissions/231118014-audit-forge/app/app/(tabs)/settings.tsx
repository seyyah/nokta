import { Bell, ChevronRight, Github, Layers, LucideIcon, Moon, ShieldCheck, Sparkles, Vibrate } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const { palette } = Colors;

type ToggleRow = {
  key: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  defaultOn: boolean;
};

const TOGGLES: ToggleRow[] = [
  { key: "haptics", icon: Vibrate, title: "Haptics", subtitle: "Tactile feedback on actions", defaultOn: true },
  { key: "notify", icon: Bell, title: "Push notifications", subtitle: "Daily forge cycle summary", defaultOn: false },
  { key: "dark", icon: Moon, title: "Pure black UI", subtitle: "Save OLED power", defaultOn: true },
  { key: "beta", icon: Sparkles, title: "Beta widgets", subtitle: "Show experimental annotations", defaultOn: false },
];

type LinkRow = { key: string; icon: LucideIcon; title: string; meta: string };
const LINKS: LinkRow[] = [
  { key: "repo", icon: Github, title: "nokta-audit repo", meta: "github.com/seyyah/nokta-audit" },
  { key: "host", icon: Layers, title: "Host project", meta: "github.com/seyyah/nokta" },
  { key: "policy", icon: ShieldCheck, title: "Audit policy", meta: "Drop-in · zero backend" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.key, t.defaultOn]))
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: 160 + insets.bottom, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>NS</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Customer-Developer</Text>
          <Text style={styles.role}>Track A · Drop-in discipline</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>v1.0</Text>
        </View>
      </View>

      <SectionTitle>PREFERENCES</SectionTitle>
      <View style={styles.group}>
        {TOGGLES.map((t, i) => {
          const Icon = t.icon;
          const on = state[t.key];
          return (
            <View
              key={t.key}
              style={[styles.row, i === TOGGLES.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.iconWell}>
                <Icon size={16} color={palette.yellow} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{t.title}</Text>
                <Text style={styles.rowSub}>{t.subtitle}</Text>
              </View>
              <Switch
                value={on}
                onValueChange={(v) => setState((s) => ({ ...s, [t.key]: v }))}
                trackColor={{ true: palette.yellow, false: palette.border }}
                thumbColor={palette.text}
                ios_backgroundColor={palette.border}
              />
            </View>
          );
        })}
      </View>

      <SectionTitle>PROJECT</SectionTitle>
      <View style={styles.group}>
        {LINKS.map((l, i) => {
          const Icon = l.icon;
          return (
            <Pressable
              key={l.key}
              style={[styles.row, i === LINKS.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.iconWell}>
                <Icon size={16} color={palette.yellow} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{l.title}</Text>
                <Text style={styles.rowSub}>{l.meta}</Text>
              </View>
              <ChevronRight size={18} color={palette.textMuted} />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.foot}>NOKTA · AUDIT-FORGE · BUILT WITH RORK</Text>
    </ScrollView>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionText}>{children}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 1,
  },
  name: { color: palette.text, fontSize: 16, fontWeight: "700" },
  role: { color: palette.textDim, fontSize: 12, marginTop: 2 },
  badge: {
    backgroundColor: palette.ink2,
    borderWidth: 1,
    borderColor: palette.yellow,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: palette.yellow,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  sectionWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionText: {
    color: palette.yellow,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1.6,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: palette.border },
  group: {
    marginHorizontal: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  iconWell: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: palette.ink2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border,
  },
  rowTitle: { color: palette.text, fontSize: 14, fontWeight: "600" },
  rowSub: { color: palette.textDim, fontSize: 11, marginTop: 2 },
  foot: {
    textAlign: "center",
    color: palette.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "700",
    marginTop: 28,
  },
});
