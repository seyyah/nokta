import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

export default function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false
}) {
  const isGhost = variant === "ghost";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isGhost ? styles.ghostButton : styles.primaryButton,
        (disabled || loading) && styles.disabledButton,
        pressed && !disabled && !loading && styles.pressedButton
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.primary : "#FFFFFF"} />
      ) : (
        <Text style={[styles.text, isGhost ? styles.ghostText : styles.primaryText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  ghostButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  disabledButton: {
    opacity: 0.55
  },
  pressedButton: {
    transform: [{ scale: 0.99 }]
  },
  text: {
    fontSize: 16,
    fontWeight: "700"
  },
  primaryText: {
    color: "#FFFFFF"
  },
  ghostText: {
    color: colors.primary
  }
});
