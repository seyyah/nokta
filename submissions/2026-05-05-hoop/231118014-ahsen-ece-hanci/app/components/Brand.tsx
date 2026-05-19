import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { monoFont, theme } from "@/constants/theme";

type Props = { subtitle?: string };

export function Brand({ subtitle = "SLOP DETECTOR v1" }: Props) {
  return (
    <View style={styles.wrap} testID="brand">
      <View style={styles.row}>
        <View style={styles.dotGlow} />
        <View style={styles.dot} />
        <Text style={styles.name}>NOKTA</Text>
      </View>
      <Text style={styles.sub}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent },
  dotGlow: { position: "absolute", left: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: theme.accentGlow },
  name: { color: theme.text, fontFamily: monoFont, fontSize: 15, fontWeight: "700", letterSpacing: 4, marginLeft: 4 },
  sub: { color: theme.textFaint, fontFamily: monoFont, fontSize: 10, letterSpacing: 2 },
});
