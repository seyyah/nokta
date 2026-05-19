import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export type MascotEmotion = 'idle' | 'thinking' | 'done' | 'error';

const EMOTIONS: Record<MascotEmotion, { emoji: string; label?: string; color: string }> = {
  idle:     { emoji: '🤖', color: '#6c47ff' },
  thinking: { emoji: '🤔', color: '#4a9eff' },
  done:     { emoji: '🎉', color: '#4caf50' },
  error:    { emoji: '😰', color: '#ff6b6b' },
};

interface Props {
  emotion: MascotEmotion;
  size?: number;
}

export default function NoktaMascot({ emotion, size = 28 }: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;
  const scale      = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animRef.current?.stop();

    if (emotion === 'idle') {
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -4, duration: 900, useNativeDriver: true }),
          Animated.timing(translateY, { toValue:  4, duration: 900, useNativeDriver: true }),
        ])
      );
      animRef.current.start();

    } else if (emotion === 'thinking') {
      translateY.setValue(0);
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.4, duration: 500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1.0, duration: 500, useNativeDriver: true }),
        ])
      );
      animRef.current.start();

    } else if (emotion === 'done') {
      translateY.setValue(0);
      opacity.setValue(1);
      animRef.current = Animated.sequence([
        Animated.timing(scale, { toValue: 1.35, duration: 180, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.90, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.10, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.00, duration: 80,  useNativeDriver: true }),
      ]);
      animRef.current.start();

    } else if (emotion === 'error') {
      translateY.setValue(0);
      opacity.setValue(1);
      scale.setValue(1);
      const shake = (val: number) =>
        Animated.timing(translateX, { toValue: val, duration: 60, useNativeDriver: true });
      animRef.current = Animated.sequence([
        shake(6), shake(-6), shake(4), shake(-4), shake(2), shake(-2), shake(0),
      ]);
      animRef.current.start();
    }

    return () => { animRef.current?.stop(); };
  }, [emotion]);

  const { emoji, color } = EMOTIONS[emotion];

  return (
    <View style={styles.wrapper}>
      <Animated.Text
        style={[
          { fontSize: size, marginRight: 8 },
          { transform: [{ translateY }, { scale }, { translateX }], opacity },
        ]}
      >
        {emoji}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
});
