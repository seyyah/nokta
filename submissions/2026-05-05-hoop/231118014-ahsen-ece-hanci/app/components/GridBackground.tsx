import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "@/constants/theme";

type Props = {
  style?: ViewStyle | ViewStyle[];
  spacing?: number;
  color?: string;
};

function GridBackgroundBase({ style, spacing = 32, color = "#121619" }: Props) {
  const rows = 40;
  const cols = 12;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]} testID="grid-bg">
      <View style={{ flex: 1, flexDirection: "row" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <View key={`c-${i}`} style={{ flex: 1, borderRightWidth: 1, borderColor: color }} />
        ))}
      </View>
      <View style={[StyleSheet.absoluteFill, { flexDirection: "column" }]}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={`r-${i}`} style={{ height: spacing, borderBottomWidth: 1, borderColor: color }} />
        ))}
      </View>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg, opacity: 0.35 }]} />
    </View>
  );
}

export const GridBackground = React.memo(GridBackgroundBase);
