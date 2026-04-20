import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../constants/theme";

export default function ProgressDots({ total, currentIndex }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => {
        const active = index <= currentIndex;

        return <View key={index} style={[styles.dot, active && styles.activeDot]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.border
  },
  activeDot: {
    width: 26,
    backgroundColor: colors.primary
  }
});
