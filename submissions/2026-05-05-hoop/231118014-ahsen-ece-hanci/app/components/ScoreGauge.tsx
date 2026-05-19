import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { monoFont, theme, verdictLabel } from "@/constants/theme";

type Props = {
  score: number;
  size?: number;
  animate?: boolean;
};

function ScoreGaugeBase({ score, size = 220, animate = true }: Props) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState<number>(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setDisplay(score);
      return;
    }
    progress.setValue(0);
    const listener = progress.addListener(({ value }) => {
      setDisplay(Math.round(value * score));
    });
    Animated.timing(progress, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => progress.removeListener(listener);
  }, [score, animate, progress]);

  const v = verdictLabel(score);
  const dash = (display / 100) * circumference;

  return (
    <View style={[styles.wrap, { width: size, height: size }]} testID="score-gauge">
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={v.color} stopOpacity="1" />
            <Stop offset="1" stopColor={v.color} stopOpacity="0.5" />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gg)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.score, { color: v.color }]} testID="score-value">{display}</Text>
        <Text style={styles.slash}>/100 SLOP</Text>
        <View style={[styles.badge, { borderColor: v.color }]}>
          <Text style={[styles.badgeText, { color: v.color }]}>{v.label}</Text>
        </View>
      </View>
    </View>
  );
}

export const ScoreGauge = React.memo(ScoreGaugeBase);

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  center: { position: "absolute", alignItems: "center", justifyContent: "center" },
  score: { fontSize: 72, fontFamily: monoFont, fontWeight: "700", letterSpacing: -2 },
  slash: { fontSize: 11, fontFamily: monoFont, color: theme.textDim, letterSpacing: 2, marginTop: -4 },
  badge: { marginTop: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4 },
  badgeText: { fontFamily: monoFont, fontSize: 11, letterSpacing: 2, fontWeight: "700" },
});
