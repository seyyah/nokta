import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface SectionCardProps {
  title: string;
  content: string;
  accent: string;
  index: number;
}

export default function SectionCard({ title, content, accent, index }: SectionCardProps) {
  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 60).duration(350).springify()}
      style={styles.card}
    >
      <Text style={[styles.title, { color: accent }]}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
    fontFamily: 'DMSans_800ExtraBold',
  },
  content: {
    fontSize: 13.5,
    lineHeight: 21,
    color: '#444',
    fontFamily: 'DMSans_400Regular',
  },
});
