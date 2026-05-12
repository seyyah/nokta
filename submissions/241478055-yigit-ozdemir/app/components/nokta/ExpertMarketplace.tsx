import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { NoktaColors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { Expert } from '@/services/expertService';

interface ExpertMarketplaceProps {
  experts: Expert[];
  onSelectExpert: (expert: Expert) => void;
  onCancel: () => void;
}

export default function ExpertMarketplace({
  experts,
  onSelectExpert,
  onCancel,
}: ExpertMarketplaceProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTag}>UZMAN MARKETPLACE</Text>
        <Text style={styles.sectionTitle}>Uzman Tipini Seçin</Text>
        <Text style={styles.sectionDesc}>
          Proje spesifikasyonunuz seçtiğiniz uzman tarafından kritik bir
          gözle incelenecek ve detaylı geri bildirim sağlanacaktır.
        </Text>
      </View>

      {/* Horizontal Expert Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
        decelerationRate="fast"
        snapToInterval={280 + Spacing.md}
        snapToAlignment="start"
      >
        {experts.map((expert) => (
          <Pressable
            key={expert.id}
            style={({ pressed }) => [
              styles.expertCard,
              { borderColor: expert.accentColor + '40' },
              pressed && styles.cardPressed,
            ]}
            onPress={() => onSelectExpert(expert)}
          >
            {/* Top accent line */}
            <View
              style={[
                styles.cardAccentLine,
                { backgroundColor: expert.accentColor },
              ]}
            />

            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: expert.accentColor + '15' },
              ]}
            >
              <Text style={styles.iconEmoji}>{expert.icon}</Text>
            </View>

            {/* Info */}
            <Text style={styles.expertTitle}>{expert.title}</Text>
            <Text
              style={[styles.expertSubtitle, { color: expert.accentColor }]}
            >
              {expert.subtitle}
            </Text>
            <Text style={styles.expertDescription} numberOfLines={3}>
              {expert.description}
            </Text>

            {/* Meta Row */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Ücret</Text>
                <Text style={styles.metaValue}>{expert.hourlyRate}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Süre</Text>
                <Text style={styles.metaValue}>{expert.responseTime}</Text>
              </View>
            </View>

            {/* Select Button */}
            <View
              style={[
                styles.selectButton,
                { backgroundColor: expert.accentColor + '15' },
              ]}
            >
              <Text
                style={[styles.selectButtonText, { color: expert.accentColor }]}
              >
                Bu Uzmanı Seç →
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Cancel */}
      <Pressable
        style={({ pressed }) => [
          styles.cancelButton,
          pressed && styles.cardPressed,
        ]}
        onPress={onCancel}
      >
        <Text style={styles.cancelButtonText}>Vazgeç</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  sectionTag: {
    fontSize: FontSize.xs,
    color: NoktaColors.accent,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: NoktaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionDesc: {
    fontSize: FontSize.sm,
    color: NoktaColors.textSecondary,
    lineHeight: 20,
  },
  cardsContainer: {
    paddingRight: Spacing.xl,
    gap: Spacing.md,
  },
  expertCard: {
    width: 280,
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: Spacing.lg,
  },
  cardAccentLine: {
    height: 3,
    width: '100%',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconEmoji: {
    fontSize: 22,
  },
  expertTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: NoktaColors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  expertSubtitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  expertDescription: {
    fontSize: FontSize.xs,
    color: NoktaColors.textTertiary,
    lineHeight: 18,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: NoktaColors.borderSubtle,
    borderBottomWidth: 1,
    borderBottomColor: NoktaColors.borderSubtle,
    marginBottom: Spacing.lg,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: NoktaColors.textDimmed,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: FontSize.xs,
    color: NoktaColors.textSecondary,
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: NoktaColors.borderSubtle,
  },
  selectButton: {
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: NoktaColors.textDimmed,
  },
});
