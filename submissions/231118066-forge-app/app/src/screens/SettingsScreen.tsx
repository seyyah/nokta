import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { Screen } from "../../App";
import { AuditWidget } from "../audit/AuditWidget";

type Props = {
  navigate: (screen: Screen) => void;
  onReport: (markdown: string) => void;
  stuckCount: number;
};

export function SettingsScreen({ navigate, onReport, stuckCount }: Props) {
  const [darkMode, setDarkMode] = useState(true);
  const [haptics, setHaptics] = useState(false);
  const [compactUI, setCompactUI] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigate("Home")} style={styles.backBtn}>
        <Text style={styles.backText}>← Ana Sayfa</Text>
      </Pressable>

      <Text style={styles.title}>Ayarlar</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Karanlık mod</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Titreşim</Text>
        <Switch value={haptics} onValueChange={setHaptics} />
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Sıkı arayüz</Text>
        <Switch value={compactUI} onValueChange={setCompactUI} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bilgi</Text>
        <Text style={styles.cardText}>öğrenci: 231118066</Text>
        <Text style={styles.cardText}>parça: A</Text>
        <Text style={styles.cardText}>döngü: 8</Text>
        <Text style={styles.cardText}>commit: a3f9c21</Text>
        <Text style={styles.cardText}>kg: 8</Text>
        <Text style={styles.cardHint}>
          takılma: {stuckCount} (≥2 olursa Uzman Görüşmesi açılır)
        </Text>
      </View>

      <AuditWidget screenName="Ayarlar" onReport={(md) => onReport(md)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a14", padding: 18 },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#121226",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#242443",
  },
  backText: { color: "#e8e8ff", fontWeight: "800" },
  title: { marginTop: 14, color: "#f2f2ff", fontSize: 26, fontWeight: "900" },
  row: {
    marginTop: 12,
    backgroundColor: "#0f0f1f",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#242443",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: { color: "#e8e8ff", fontWeight: "800" },
  card: {
    marginTop: 16,
    backgroundColor: "#121226",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#242443",
    padding: 14,
  },
  cardTitle: { color: "#f2f2ff", fontWeight: "900", fontSize: 16 },
  cardText: { color: "#cfd2ff", marginTop: 6, fontWeight: "700" },
  cardHint: { color: "#8a90c8", marginTop: 10, fontWeight: "700" },
});
