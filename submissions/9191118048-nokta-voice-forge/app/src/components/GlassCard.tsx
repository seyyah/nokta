/**
 * Nokta Voice Forge — GlassCard Component
 * Glassmorphism card with blur, semi-transparent background, and optional press interaction
 */

import React, { ReactNode } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows, animation } from '../theme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  intensity?: number;
  tint?: 'dark' | 'light';
  noPadding?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  intensity = 40,
  tint = 'dark',
  noPadding = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, animation.springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.springConfig);
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const containerStyle: ViewStyle[] = [
    styles.container,
    !noPadding && styles.padding,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const content = (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={styles.blurView}
    >
      <View style={[styles.innerOverlay, !noPadding && styles.padding]}>
        {children}
      </View>
    </BlurView>
  );

  if (onPress) {
    return (
      <AnimatedTouchable
        style={[styles.container, animatedStyle, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {content}
      </AnimatedTouchable>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {content}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  blurView: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
  },
  innerOverlay: {
    flex: 1,
    backgroundColor: colors.surfaceGlass,
  },
  padding: {
    padding: spacing.md,
  },
});

export default GlassCard;
