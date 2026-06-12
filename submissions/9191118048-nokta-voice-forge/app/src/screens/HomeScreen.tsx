/**
 * HomeScreen — Voice Forge Dashboard
 * Clean, dark, minimal. Five feature cards, no clutter.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows, animation } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeatureCard {
  icon: string;
  title: string;
  route: keyof RootStackParamList;
  params?: object;
}

const FEATURES: FeatureCard[] = [
  { icon: '🪞', title: 'Avatar Chat',       route: 'Avatar' },
  { icon: '🎙️', title: 'Voice Visualizer', route: 'Voice' },
  { icon: '🛠️', title: 'Forge Dashboard',  route: 'Forge' },
  { icon: '📋', title: 'Audit Reports',     route: 'Audit' },
  { icon: '📞', title: 'Expert Bridge',     route: 'ExpertCall', params: {} },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Card({
  card,
  index,
  onPress,
}: {
  card: FeatureCard;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(120 + index * 70).duration(400).springify()}>
      <AnimatedPressable
        style={[styles.card, style]}
        onPressIn={() => { scale.value = withSpring(0.96, animation.springBouncy); }}
        onPressOut={() => { scale.value = withSpring(1, animation.springBouncy); }}
        onPress={onPress}
      >
        <Text style={styles.cardIcon}>{card.icon}</Text>
        <Text style={styles.cardTitle}>{card.title}</Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const navigate = useCallback(
    (card: FeatureCard) => {
      if (card.params) {
        (navigation as any).navigate(card.route, card.params);
      } else {
        (navigation as any).navigate(card.route);
      }
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Title */}
        <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
          <Text style={styles.title}>Voice Forge</Text>
        </Animated.View>

        {/* Cards */}
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {FEATURES.map((card, i) => (
            <Card key={card.route} card={card} index={i} onPress={() => navigate(card)} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const CARD_MARGIN = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - CARD_MARGIN) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginTop: spacing.xl + 8,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_MARGIN,
    paddingBottom: spacing.xxl,
  },
  card: {
    width: CARD_WIDTH,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
