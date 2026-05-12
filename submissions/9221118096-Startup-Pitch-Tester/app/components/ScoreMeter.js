import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export default function ScoreMeter({ score }) {
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fill, {
      toValue: Math.max(0, Math.min(100, score || 0)) / 100,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score, fill]);

  const width = fill.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const color = score >= 70 ? "#E53935" : score >= 40 ? "#F59E0B" : "#10B981";
  const tier =
    score >= 70 ? "PURE SLOP" : score >= 40 ? "MIXED SIGNALS" : "GROUNDED";

  return (
    <View style={S.wrap}>
      <View style={S.headerRow}>
        <Text style={S.headerLabel}>SLOP METER</Text>
        <Text style={[S.tier, { color }]}>{tier}</Text>
      </View>
      <View style={S.track}>
        <Animated.View style={[S.fill, { width, backgroundColor: color }]} />
        <View style={[S.tick, { left: "40%" }]} />
        <View style={[S.tick, { left: "70%" }]} />
      </View>
      <View style={S.labelRow}>
        <Text style={S.endLabel}>0</Text>
        <Text style={S.endLabel}>100</Text>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { marginTop: 14 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#6B7280",
  },
  tier: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  track: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  fill: {
    height: "100%",
    borderRadius: 6,
  },
  tick: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(15,23,42,0.18)",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  endLabel: { fontSize: 10, color: "#9CA3AF", fontWeight: "600" },
});
