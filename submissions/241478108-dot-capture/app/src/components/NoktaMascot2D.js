import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View, Text } from 'react-native';
import Svg, { Circle, Path, Ellipse, G } from 'react-native-svg';

export default function NoktaMascot2D({ state = 'idle' }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const mouthAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Float animation
  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );

    if (state === 'angry') {
      float.stop();
      const shake = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        ])
      );
      shake.start();
      return () => shake.stop();
    } else {
      shakeAnim.setValue(0);
      float.start();
      return () => float.stop();
    }
  }, [state]);

  // Mouth animation
  useEffect(() => {
    if (state === 'speaking') {
      const talk = Animated.loop(
        Animated.sequence([
          Animated.timing(mouthAnim, { toValue: 2.5, duration: 200, useNativeDriver: true }),
          Animated.timing(mouthAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ])
      );
      talk.start();
      return () => talk.stop();
    } else {
      mouthAnim.setValue(1);
    }
  }, [state]);

  const getBodyColor = () => {
    if (state === 'angry') return '#ff4444';
    if (state === 'love') return '#ff88bb';
    return '#1a6bff';
  };

  return (
    <Animated.View style={{
      width: 120,
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [
        { translateY: floatAnim },
        { translateX: shakeAnim },
      ]
    }}>
      <Svg width="120" height="120" viewBox="0 0 100 100">
        {/* Tail */}
        <Path d="M 50 95 L 30 80 L 70 80 Z" fill={getBodyColor()} />
        {/* Body */}
        <Circle cx="50" cy="48" r="38" fill={getBodyColor()} />

        {/* Eyes */}
        {(state === 'sleep' || state === 'love') ? (
          <G>
            <Path d="M 28 42 Q 36 34 44 42" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
            <Path d="M 56 42 Q 64 34 72 42" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          </G>
        ) : state === 'angry' ? (
          <G>
            <Path d="M 24 34 L 44 42" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <Path d="M 76 34 L 56 42" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <Circle cx="35" cy="48" r="4" fill="white" />
            <Circle cx="65" cy="48" r="4" fill="white" />
          </G>
        ) : (
          <G>
            <Ellipse cx="35" cy="44" rx="5" ry="7" fill="white" />
            <Ellipse cx="65" cy="44" rx="5" ry="7" fill="white" />
            <Circle cx="37" cy="46" r="2.5" fill="#0a0a20" />
            <Circle cx="67" cy="46" r="2.5" fill="#0a0a20" />
          </G>
        )}

        {/* Mouth */}
        {state === 'speaking' ? null : state === 'angry' ? (
          <Path d="M 38 68 Q 50 60 62 68" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : state === 'sleep' ? (
          <Path d="M 42 63 Q 50 68 58 63" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <Ellipse cx="50" cy="63" rx="8" ry="4" fill="white" />
        )}
      </Svg>

      {/* Animated mouth overlay using RN Animated */}
      {state === 'speaking' && (
        <Animated.View style={{
          position: 'absolute',
          bottom: 22,
          width: 16,
          height: 8,
          borderRadius: 4,
          backgroundColor: 'white',
          transform: [{ scaleY: mouthAnim }],
        }} />
      )}

      {/* Sleep bubble */}
      {state === 'sleep' && (
        <View style={{ position: 'absolute', top: -5, right: -10 }}>
          <Text style={{ color: '#a0c4ff', fontSize: 20, fontWeight: 'bold' }}>Zzz</Text>
        </View>
      )}

      {/* Love hearts */}
      {state === 'love' && (
        <View style={{ position: 'absolute', top: -10, right: -5 }}>
          <Text style={{ fontSize: 18 }}>❤️</Text>
        </View>
      )}
    </Animated.View>
  );
}
