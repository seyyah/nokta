/**
 * Nokta Voice Forge — AnimatedButton Component
 * Premium button with scale animation, haptics, gradient, and multiple variants
 */

import React, { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  ViewStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows, animation } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const VARIANT_CONFIG: Record<
  ButtonVariant,
  {
    gradient: readonly [string, string, ...string[]];
    textColor: string;
    glowColor: string;
    borderColor: string;
    isGhost: boolean;
  }
> = {
  primary: {
    gradient: colors.gradientPrimary,
    textColor: colors.textInverse,
    glowColor: colors.primaryGlow,
    borderColor: 'transparent',
    isGhost: false,
  },
  secondary: {
    gradient: colors.gradientSecondary,
    textColor: '#FFFFFF',
    glowColor: colors.secondaryGlow,
    borderColor: 'transparent',
    isGhost: false,
  },
  danger: {
    gradient: colors.gradientAccent,
    textColor: '#FFFFFF',
    glowColor: colors.accentGlow,
    borderColor: 'transparent',
    isGhost: false,
  },
  ghost: {
    gradient: ['transparent', 'transparent', 'transparent'] as const,
    textColor: colors.text,
    glowColor: 'transparent',
    borderColor: colors.borderLight,
    isGhost: true,
  },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);
  const config = VARIANT_CONFIG[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, animation.springBouncy);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.springConfig);
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const isDisabledOrLoading = disabled || loading;
  const glowStyle = !config.isGhost && !isDisabledOrLoading
    ? shadows.glow(config.glowColor)
    : {};

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.85}
      disabled={isDisabledOrLoading}
      style={[
        styles.wrapper,
        fullWidth && styles.fullWidth,
        glowStyle,
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          config.isGhost && styles.ghostBorder,
          config.isGhost && { borderColor: config.borderColor },
          isDisabledOrLoading && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={config.textColor}
            size="small"
          />
        ) : (
          <View style={styles.contentRow}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.text,
                { color: config.textColor },
                config.isGhost && styles.ghostText,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  ghostBorder: {
    borderWidth: 1.5,
  },
  disabled: {
    opacity: 0.45,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  text: {
    fontSize: typography.bodyBold.fontSize,
    fontWeight: typography.bodyBold.fontWeight,
    letterSpacing: 0.3,
  },
  ghostText: {
    fontWeight: '500',
  },
});

export default AnimatedButton;
