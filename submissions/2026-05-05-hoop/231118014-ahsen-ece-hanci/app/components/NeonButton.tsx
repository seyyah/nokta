import React from "react";
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { monoFont, theme } from "@/constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  icon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
};

export function NeonButton({ label, onPress, disabled, variant = "primary", icon, style, testID }: Props) {
  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onPress();
  };

  const color = variant === "danger" ? theme.red : theme.accent;
  const bg = variant === "ghost" ? "transparent" : `${color}14`;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      style={({ pressed }) => [
        styles.btn,
        { borderColor: color, backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <View style={styles.row}>
        {icon}
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { fontFamily: monoFont, fontSize: 13, letterSpacing: 2.5, fontWeight: "700", textTransform: "uppercase" },
});
