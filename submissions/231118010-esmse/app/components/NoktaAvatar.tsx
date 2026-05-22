import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

export type MascotState = 'idle' | 'sleep' | 'tickle' | 'angry' | 'love';

interface Props {
  state: MascotState;
  onStateChange?: (newState: MascotState) => void;
}

export default function NoktaAvatar({ state, onStateChange }: Props) {
  // Animations
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Interaction tracking
  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Basic floating animation
    if (state === 'sleep') {
      floatY.value = withTiming(10, { duration: 1000 });
      scale.value = withTiming(0.9, { duration: 1000 });
      rotation.value = withTiming(0, { duration: 500 });
    } else if (state === 'angry') {
      floatY.value = withRepeat(withSequence(withTiming(-5, {duration: 50}), withTiming(5, {duration: 50})), -1, true);
      scale.value = withSpring(1.1);
      rotation.value = withTiming(0);
    } else if (state === 'love') {
      floatY.value = withRepeat(withSequence(withTiming(-10, {duration: 1000}), withTiming(0, {duration: 1000})), -1, true);
      scale.value = withSpring(1.1);
      rotation.value = withRepeat(withSequence(withTiming(-0.1, {duration: 500}), withTiming(0.1, {duration: 500})), -1, true);
    } else if (state === 'tickle') {
      floatY.value = withRepeat(withSequence(withTiming(-5, {duration: 100}), withTiming(5, {duration: 100})), 10, true);
      scale.value = withSpring(1.05);
      rotation.value = withTiming(0);
      
      setTimeout(() => {
        if (onStateChange) onStateChange('idle');
      }, 1000);
    } else {
      // idle
      floatY.value = withRepeat(withSequence(
        withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ), -1, true);
      scale.value = withSpring(1);
      rotation.value = withTiming(0);
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` }
      ],
    };
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.stop();
    Speech.speak("Pik!", { language: 'tr-TR', pitch: 2.0, rate: 1.5 });
    
    tapCount.current += 1;
    
    if (tapTimer.current) clearTimeout(tapTimer.current);
    
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1000);

    if (tapCount.current >= 3) {
      if (onStateChange) onStateChange('angry');
      tapCount.current = 0;
      setTimeout(() => {
        if (onStateChange) onStateChange('idle');
      }, 3000);
    } else if (state !== 'angry') {
      if (onStateChange) onStateChange('tickle');
    }
  };

  const renderFace = () => {
    switch (state) {
      case 'sleep':
        return <Text style={styles.faceText}>- u -</Text>;
      case 'angry':
        return <Text style={[styles.faceText, {color: '#dc2626'}]}>&gt; _ &lt;</Text>;
      case 'love':
        return <Text style={styles.faceText}>^ o ^</Text>;
      case 'tickle':
        return <Text style={styles.faceText}>&gt; o &lt;</Text>;
      case 'idle':
      default:
        return <Text style={styles.faceText}>^ _ ^</Text>;
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.avatarContainer, animatedStyle]}>
        <View style={styles.antenna} />
        <View style={[styles.antennaBall, state === 'sleep' && styles.dimBall, state === 'angry' && styles.angryBall]} />
        <View style={[styles.body, state === 'angry' && styles.angryBody]}>
          {renderFace()}
        </View>
        
        {state === 'sleep' && <Text style={styles.floatingText}>Zzz</Text>}
        {state === 'love' && <Text style={styles.floatingText}>❤️</Text>}
        {state === 'angry' && <Text style={styles.floatingText}>💢</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 120,
  },
  antenna: {
    width: 4,
    height: 20,
    backgroundColor: '#fff',
    marginTop: -10,
    zIndex: 1,
  },
  antennaBall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D8B4FE',
    position: 'absolute',
    top: 5,
    zIndex: 2,
    shadowColor: '#D8B4FE',
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  dimBall: {
    opacity: 0.3,
  },
  angryBall: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  body: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 3,
  },
  angryBody: {
    backgroundColor: '#ffcccc',
  },
  faceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  floatingText: {
    position: 'absolute',
    top: -10,
    right: -20,
    fontSize: 24,
    zIndex: 4,
  }
});
