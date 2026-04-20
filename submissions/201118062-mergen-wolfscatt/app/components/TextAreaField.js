import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

export default function TextAreaField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  minHeight = 120
}) {
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { minHeight }, error ? styles.inputError : null]}
        textAlignVertical="top"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text
  },
  inputError: {
    borderColor: colors.danger
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: 13
  }
});
