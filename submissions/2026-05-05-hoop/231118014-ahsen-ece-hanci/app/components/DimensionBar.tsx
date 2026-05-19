import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { monoFont, theme } from "@/constants/theme";
import type { Dimension } from "@/types/analysis";

type Props = {
  dimension: Dimension;
  delay?: number;
  compareScore?: number;
};

function barColor(score: number): string {
  if (score >= 75) return theme.red;
  if (score >= 55) return "#FF7744";
  if (score >= 35) return theme.amber;
  return theme.accent;
}

function DimensionBarBase({ dimension, delay = 0, compareScore }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const animB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: dimension.score, duration: 900, delay, useNativeDriver: false }).start();
    if (compareScore !== undefined) {
      Animated.timing(animB, { toValue: compareScore, duration: 900, delay: delay + 120, useNativeDriver: false }).start();
    }
  }, [dimension.score, compareScore, delay, anim, animB]);

  const color = barColor(dimension.score);

  return (
    <View style={styles.wrap} testID={`dim-${dimension.key}`}>
      <View style={styles.head}>
        <Text style={styles.label}>{dimension.label}</Text>
        <Text style={[styles.score, { color }]}>
          {dimension.score}
          {compareScore !== undefined ? ` / ${compareScore}` : ""}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
            },
          ]}
        />
        {compareScore !== undefined && (
          <Animated.View
            style={[
              styles.fillCompare,
              {
                width: animB.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
              },
            ]}
          />
        )}
      </View>
      <Text style={styles.note} numberOfLines={3}>{dimension.note}</Text>
    </View>
  );
}

export const DimensionBar = React.memo(DimensionBarBase);

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  label: { color: theme.text, fontFamily: monoFont, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" },
  score: { fontFamily: monoFont, fontSize: 13, fontWeight: "700" },
  track: { height: 6, backgroundColor: theme.border, borderRadius: 2, overflow: "hidden", position: "relative" },
  fill: { height: "100%", borderRadius: 2 },
  fillCompare: { position: "absolute", left: 0, top: 0, height: "100%", backgroundColor: theme.blue, opacity: 0.5, borderRadius: 2 },
  note: { color: theme.textDim, fontSize: 12, fontFamily: monoFont, marginTop: 6, lineHeight: 17 },
});
