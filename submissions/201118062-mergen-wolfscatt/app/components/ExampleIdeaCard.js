import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

export default function ExampleIdeaCard({ title, description, exampleText, onPress }) {
  return (
    <Pressable
      onPress={() => onPress(exampleText)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Örnek fikir</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.exampleText}>{exampleText}</Text>
      <Text style={styles.hint}>Dokununca giriş alanını doldurur</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.primarySoft
  },
  cardPressed: {
    opacity: 0.9
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.sm
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: spacing.sm
  },
  exampleText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text
  },
  hint: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary
  }
});
