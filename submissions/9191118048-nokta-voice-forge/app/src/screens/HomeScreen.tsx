/**
 * HomeScreen — Premium Dashboard Home
 * Hero header, 2×2 feature cards, status bar, WaveBackground
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows, animation } from '../theme';
import { RootStackParamList } from '../types';
import GlassCard from '../components/GlassCard';
import WaveBackground from '../components/WaveBackground';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP) / 2;

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  accentColor: string;
  route: keyof RootStackParamList;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: '🎙️',
    title: 'Voice Visualizer',
    description: 'Sesini görselleştir',
    accentColor: colors.primary,
    route: 'Voice',
  },
  {
    icon: '🪞',
    title: 'Avatar Chat',
    description: 'Avatarınla konuş',
    accentColor: colors.secondary,
    route: 'Avatar',
  },
  {
    icon: '🛠️',
    title: 'Forge Dashboard',
    description: 'Tamir döngüsü',
    accentColor: colors.warning,
    route: 'Forge',
  },
  {
    icon: '📋',
    title: 'Audit Reports',
    description: 'Denetim raporları',
    accentColor: '#4DACFF',
    route: 'Audit',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FeatureCardItem({
  card,
  index,
  onPress,
}: {
  card: FeatureCard;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, animation.springBouncy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.springBouncy);
  }, [scale]);

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 100).duration(500).springify()}
    >
      <AnimatedPressable
        style={[styles.cardPressable, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <GlassCard style={styles.featureCard}>
          <View style={[styles.cardLeftBorder, { backgroundColor: card.accentColor }]} />
          <View style={styles.cardContent}>
            <Text style={styles.cardIcon}>{card.icon}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
          </View>
          <View
            style={[
              styles.cardGlow,
              { backgroundColor: card.accentColor, opacity: 0.08 },
            ]}
          />
        </GlassCard>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const handleCardPress = useCallback(
    (route: keyof RootStackParamList) => {
      if (route === 'ExpertCall') {
        navigation.navigate('ExpertCall', {});
      } else {
        navigation.navigate(route as any);
      }
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <WaveBackground />

      {/* Gradient Header Overlay */}
      <LinearGradient
        colors={[
          'rgba(0, 212, 170, 0.08)',
          'rgba(124, 92, 252, 0.05)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Hero Header */}
        <Animated.View
          entering={FadeInUp.duration(600).springify()}
          style={styles.headerArea}
        >
          <View style={styles.titleRow}>
            <Text style={styles.heroTitle}>Nokta Voice Forge</Text>
          </View>

          {/* Student ID Badge */}
          <View style={styles.badgeRow}>
            <View style={styles.studentBadge}>
              <Text style={styles.badgeText}>9191118048</Text>
            </View>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Sesini görselleştir · Avatarınla konuş · Uzmanla bağlan
          </Text>
        </Animated.View>

        {/* Feature Cards Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            {FEATURE_CARDS.slice(0, 2).map((card, index) => (
              <FeatureCardItem
                key={card.route}
                card={card}
                index={index}
                onPress={() => handleCardPress(card.route)}
              />
            ))}
          </View>
          <View style={styles.gridRow}>
            {FEATURE_CARDS.slice(2, 4).map((card, index) => (
              <FeatureCardItem
                key={card.route}
                card={card}
                index={index + 2}
                onPress={() => handleCardPress(card.route)}
              />
            ))}
          </View>
        </View>

        {/* Bottom Status Bar */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400)}
          style={styles.statusBarContainer}
        >
          <LinearGradient
            colors={[colors.surfaceGlass, colors.surfaceGlassLight]}
            style={styles.statusBar}
          >
            <Text style={styles.statusText}>
              Forge: 3 ✅ 1 ❌ | kg: 2.8
            </Text>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  headerArea: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitle: {
    ...typography.hero,
    color: colors.text,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  studentBadge: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeText: {
    ...typography.micro,
    color: colors.primary,
    letterSpacing: 1.5,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: CARD_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  cardPressable: {
    flex: 1,
  },
  featureCard: {
    height: CARD_WIDTH * 0.95,
    overflow: 'hidden',
    position: 'relative',
  },
  cardLeftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statusBarContainer: {
    marginBottom: spacing.lg,
  },
  statusBar: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
});
