import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { type ThemeName, themeLabels, themes } from "@/constants/colors";

const THEME_COLORS: Record<ThemeName, string> = {
  warm: "#1A1A1A",
  dark: "#A8FF78",
  ink: "#FBBF24",
  forest: "#2D6A2D",
  ocean: "#38BDF8",
};

export default function SettingsScreen() {
  const { colors, themeName, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  function handleSetTheme(name: ThemeName) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(name);
  }

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
            paddingTop: webTopPad + (Platform.OS === "ios" ? insets.top : 16),
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ayarlar</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TEMA</Text>
        <View style={[styles.themeGrid]}>
          {(Object.keys(themeLabels) as ThemeName[]).map((name) => {
            const isSelected = name === themeName;
            return (
              <TouchableOpacity
                key={name}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: themes[name].background,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => handleSetTheme(name)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.themeDot,
                    { backgroundColor: THEME_COLORS[name] },
                  ]}
                />
                <Text
                  style={[
                    styles.themeLabel,
                    { color: themes[name].foreground },
                  ]}
                >
                  {themeLabels[name]}
                </Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                    <Feather name="check" size={10} color={colors.primaryForeground} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 28 }]}>
          UYGULAMA
        </Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Sürüm</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>2.0.0</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Geliştirici</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>nokta labs</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Platform</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{Platform.OS}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  content: { padding: 20, gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, marginBottom: 10, marginLeft: 2 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  themeCard: {
    width: "47%",
    borderRadius: 14,
    padding: 16,
    gap: 8,
    position: "relative",
  },
  themeDot: { width: 28, height: 28, borderRadius: 14 },
  themeLabel: { fontSize: 14, fontWeight: "600" },
  checkmark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "500" },
  separator: { height: 1 },
});
