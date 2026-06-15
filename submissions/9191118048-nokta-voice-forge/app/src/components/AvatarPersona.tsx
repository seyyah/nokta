/**
 * AvatarPersona — Persona switcher wrapping AvatarFace
 * Toggle between Junior and Senior with crossfade,
 * speech bubble, and persona info display
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, animation, personaThemes } from '../theme';
import { PersonaId } from '../types';
import AvatarFace from './AvatarFace';

interface AvatarPersonaProps {
  speakingIntensity: number;
  isActive: boolean;
  speechText: string;
  style?: ViewStyle;
  onPersonaChange?: (persona: PersonaId) => void;
}

const CROSSFADE_DURATION = 300;

const AvatarPersona: React.FC<AvatarPersonaProps> = ({
  speakingIntensity,
  isActive,
  speechText,
  style,
  onPersonaChange,
}) => {
  const [currentPersona, setCurrentPersona] = useState<PersonaId>('junior');
  const [displayedPersona, setDisplayedPersona] = useState<PersonaId>('junior');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fadeOutOpacity = useSharedValue(1);
  const fadeInOpacity = useSharedValue(0);

  const handlePersonaSwitch = useCallback(
    (newPersona: PersonaId) => {
      if (newPersona === currentPersona || isTransitioning) return;

      setIsTransitioning(true);

      // Fade out current
      fadeOutOpacity.value = withTiming(0, {
        duration: CROSSFADE_DURATION / 2,
        easing: Easing.out(Easing.ease),
      });

      setTimeout(() => {
        setDisplayedPersona(newPersona);
        setCurrentPersona(newPersona);
        fadeOutOpacity.value = 0;
        fadeInOpacity.value = 0;

        // Fade in new
        fadeInOpacity.value = withTiming(1, {
          duration: CROSSFADE_DURATION / 2,
          easing: Easing.in(Easing.ease),
        });

        fadeOutOpacity.value = withTiming(1, {
          duration: CROSSFADE_DURATION / 2,
          easing: Easing.in(Easing.ease),
        });

        setTimeout(() => {
          setIsTransitioning(false);
        }, CROSSFADE_DURATION / 2);

        onPersonaChange?.(newPersona);
      }, CROSSFADE_DURATION / 2);
    },
    [currentPersona, isTransitioning, onPersonaChange]
  );

  const avatarAnimStyle = useAnimatedStyle(() => ({
    opacity: fadeOutOpacity.value,
  }));

  const theme = personaThemes[currentPersona];
  const juniorTheme = personaThemes.junior;
  const seniorTheme = personaThemes.senior;

  const bubbleBorderColor =
    currentPersona === 'junior' ? colors.primary : colors.secondary;
  const bubbleBgColor =
    currentPersona === 'junior'
      ? 'rgba(0, 212, 170, 0.08)'
      : 'rgba(124, 92, 252, 0.08)';

  return (
    <View style={[styles.container, style]}>
      {/* ─── Persona Selector Pills ───────────── */}
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={[
            styles.selectorPill,
            currentPersona === 'junior' && [
              styles.selectorPillActive,
              { borderColor: juniorTheme.primaryColor, backgroundColor: `${juniorTheme.primaryColor}18` },
            ],
          ]}
          onPress={() => handlePersonaSwitch('junior')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.selectorText,
              currentPersona === 'junior' && {
                color: juniorTheme.primaryColor,
              },
            ]}
          >
            Junior {currentPersona === 'junior' ? '◉' : '○'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectorPill,
            currentPersona === 'senior' && [
              styles.selectorPillActive,
              { borderColor: seniorTheme.primaryColor, backgroundColor: `${seniorTheme.primaryColor}18` },
            ],
          ]}
          onPress={() => handlePersonaSwitch('senior')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.selectorText,
              currentPersona === 'senior' && {
                color: seniorTheme.primaryColor,
              },
            ]}
          >
            Senior {currentPersona === 'senior' ? '◉' : '○'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Avatar with CrossFade ────────────── */}
      <Animated.View style={[styles.avatarContainer, avatarAnimStyle]}>
        <AvatarFace
          speakingIntensity={speakingIntensity}
          persona={displayedPersona}
          isActive={isActive}
        />
      </Animated.View>

      {/* ─── Persona Info ─────────────────────── */}
      <View style={styles.personaInfo}>
        <Text style={[styles.personaName, { color: theme.primaryColor }]}>
          {theme.name}
        </Text>
        <Text style={styles.personaTone}>{theme.tone}</Text>
      </View>

      {/* ─── Speech Bubble ────────────────────── */}
      {speechText.length > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.speechBubble,
            {
              borderColor: bubbleBorderColor,
              backgroundColor: bubbleBgColor,
            },
          ]}
        >
          {/* Bubble tail */}
          <View
            style={[
              styles.bubbleTail,
              {
                borderBottomColor: bubbleBorderColor,
              },
            ]}
          />
          <View
            style={[
              styles.bubbleTailInner,
              {
                borderBottomColor: bubbleBgColor,
              },
            ]}
          />
          <Text style={styles.speechText}>{speechText}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  selectorContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  selectorPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
  },
  selectorPillActive: {
    borderWidth: 1.5,
  },
  selectorText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  personaInfo: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  personaName: {
    ...typography.subheading,
    fontSize: 18,
    marginBottom: 2,
  },
  personaTone: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  speechBubble: {
    maxWidth: '90%',
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    marginTop: spacing.md,
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bubbleTailInner: {
    position: 'absolute',
    top: -7,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  speechText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AvatarPersona;
