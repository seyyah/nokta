import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import SectionCard from "../components/SectionCard";
import { colors, spacing } from "../constants/theme";

export default function LoadingScreen({ idea }) {
  return (
    <View style={styles.container}>
      <SectionCard style={styles.card}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.title}>Spec hazırlanıyor</Text>
        <Text style={styles.text}>
          "{idea}" fikri için cevapların birleştiriliyor ve tek sayfalık ürün özeti oluşturuluyor.
        </Text>
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center"
  },
  card: {
    alignItems: "center",
    gap: spacing.md
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text
  },
  text: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted
  }
});
