import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Screen } from "../../App";
import { AuditWidget } from "../audit/AuditWidget";

type Props = {
  navigate: (screen: Screen) => void;
  onReport: (markdown: string) => void;
};

function NavButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.navBtn}>
      <Text style={styles.navBtnText}>{label}</Text>
    </Pressable>
  );
}

export function HomeScreen({ navigate, onReport }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏠 ForgeApp</Text>
        <Text style={styles.subtitle}>231118066 · Track A · Final Hafta</Text>
      </View>

      <View style={styles.grid}>
        <NavButton label="Görevler" onPress={() => navigate("Tasks")} />
        <NavButton label="Ayarlar" onPress={() => navigate("Settings")} />
        <NavButton label="Ses" onPress={() => navigate("Voice")} />
        <NavButton label="Avatar" onPress={() => navigate("Avatar")} />
        <NavButton label="Uzman Görüşmesi" onPress={() => navigate("ExpertCall")} />
      </View>

      <AuditWidget screenName="Ana Sayfa" onReport={(md) => onReport(md)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a14", padding: 18 },
  header: { paddingTop: 16, paddingBottom: 16 },
  title: { color: "#f2f2ff", fontSize: 28, fontWeight: "900" },
  subtitle: { color: "#a9a9c6", marginTop: 6, fontSize: 14 },
  grid: { gap: 10, marginTop: 10 },
  navBtn: {
    backgroundColor: "#121226",
    borderColor: "#242443",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  navBtnText: { color: "#e8e8ff", fontWeight: "800", fontSize: 16 },
});

