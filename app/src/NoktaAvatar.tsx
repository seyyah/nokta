import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableWithoutFeedback, Dimensions } from 'react-native';

interface NoktaAvatarProps {
  isSpeaking: boolean;
  voiceLevel?: number; // Optional volume level
}

export default function NoktaAvatar({ isSpeaking, voiceLevel = 0 }: NoktaAvatarProps) {
  const [reaction, setReaction] = useState<'idle' | 'sleep' | 'tickle' | 'angry' | 'love'>('idle');
  
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const mouthAnim = useRef(new Animated.Value(1)).current;

  // Sleep logic
  useEffect(() => {
    if (isSpeaking || reaction === 'tickle' || reaction === 'angry' || reaction === 'love') {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (reaction === 'sleep') setReaction('idle');
      
      idleTimer.current = setTimeout(() => {
        if (!isSpeaking) setReaction('sleep');
      }, 10000);
    } else {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setReaction('sleep');
      }, 10000);
    }

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isSpeaking, reaction]);

  // Floating idle animation
  useEffect(() => {
    if (reaction === 'idle' || reaction === 'love') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -15,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      floatAnim.setValue(0);
      floatAnim.stopAnimation();
    }
  }, [reaction]);

  // Shake / Angry / Tickle
  useEffect(() => {
    if (reaction === 'angry' || reaction === 'tickle') {
      const isAngry = reaction === 'angry';
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: isAngry ? 5 : 3, duration: isAngry ? 40 : 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: isAngry ? -5 : -3, duration: isAngry ? 40 : 80, useNativeDriver: true }),
        ])
      ).start();

      setTimeout(() => {
        shakeAnim.stopAnimation();
        shakeAnim.setValue(0);
        setReaction('idle');
      }, isAngry ? 4000 : 1000);
    }
  }, [reaction]);

  // Mouth sync
  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(mouthAnim, { toValue: 2, duration: 150, useNativeDriver: true }),
          Animated.timing(mouthAnim, { toValue: 1, duration: 150, useNativeDriver: true })
        ])
      ).start();
    } else {
      mouthAnim.stopAnimation();
      mouthAnim.setValue(1);
    }
  }, [isSpeaking]);

  const handlePress = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);

    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 1000);

    if (clickCount.current >= 3) {
      setReaction('angry');
      clickCount.current = 0;
    } else if (reaction !== 'angry') {
      setReaction('tickle');
    }
  };

  const isSleep = reaction === 'sleep';
  const isAngry = reaction === 'angry';
  const isLove = reaction === 'love';

  return (
    <View style={styles.container}>
      {isSleep && <Text style={styles.floatingText}>Zzz</Text>}
      {isAngry && <Text style={styles.floatingText}>💢</Text>}
      {isLove && <Text style={styles.floatingText}>❤️ 💕</Text>}

      <TouchableWithoutFeedback onPress={handlePress}>
        <Animated.View
          style={[
            styles.avatarBody,
            isAngry && { backgroundColor: '#ffe5e5', borderColor: '#dc2626', borderWidth: 4 },
            { transform: [{ translateY: floatAnim }, { translateX: shakeAnim }] }
          ]}
        >
          {/* Eyes */}
          <View style={styles.eyesContainer}>
            <View style={[styles.eye, (isSleep || isLove) && styles.eyeClosed, isAngry && styles.eyeAngryLeft]} />
            <View style={[styles.eye, (isSleep || isLove) && styles.eyeClosed, isAngry && styles.eyeAngryRight]} />
          </View>
          
          {/* Mouth */}
          <Animated.View style={[
            styles.mouth,
            isAngry && styles.mouthAngry,
            { transform: [{ scaleY: mouthAnim }] }
          ]} />
          
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingText: {
    fontSize: 32,
    position: 'absolute',
    top: 20,
    right: 60,
    fontWeight: 'bold',
    color: '#1a6bff',
    zIndex: 10,
  },
  avatarBody: {
    width: 140,
    height: 140,
    backgroundColor: '#ffffff',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a6bff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  eyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
    marginBottom: 15,
  },
  eye: {
    width: 14,
    height: 24,
    backgroundColor: '#1a6bff',
    borderRadius: 7,
  },
  eyeClosed: {
    height: 4,
    marginTop: 10,
  },
  eyeAngryLeft: {
    backgroundColor: '#dc2626',
    transform: [{ rotateZ: '20deg' }],
  },
  eyeAngryRight: {
    backgroundColor: '#dc2626',
    transform: [{ rotateZ: '-20deg' }],
  },
  mouth: {
    width: 24,
    height: 8,
    backgroundColor: '#1a6bff',
    borderRadius: 4,
  },
  mouthAngry: {
    backgroundColor: '#dc2626',
    width: 30,
    height: 6,
    borderRadius: 3,
    transform: [{ rotateZ: '10deg' }],
    marginTop: 5,
  }
});
