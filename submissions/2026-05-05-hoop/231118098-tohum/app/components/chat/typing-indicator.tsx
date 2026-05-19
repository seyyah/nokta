import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';

export function TypingIndicator() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.bubble, { opacity }]}>
        <Text style={styles.text}>Nokta AI yazıyor…</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: colors.bubbleAi,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontFamily: typography.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
