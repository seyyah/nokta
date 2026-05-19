import { router, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EXPERTS, renderStars } from '@/constants/experts';
import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';

export default function ExpertList() {
  const { sid } = useLocalSearchParams<{ sid: string }>();

  const onSelect = (expertId: string) => {
    router.push({ pathname: '/expert-review', params: { sid, expertId } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backText}>← Geri</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Uzman Seç</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.subtitle}>
        Spec'ini inceleyecek bir uzman seç. Uzman NDA kapsamında değerlendirme yapar.
      </Text>

      <ScrollView contentContainerStyle={styles.list}>
        {EXPERTS.map((expert) => (
          <View key={expert.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.avatar}>{expert.avatar}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.expertName}>{expert.name}</Text>
                <Text style={styles.expertField}>{expert.field}</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.stars}>{renderStars(expert.rating)}</Text>
                  <Text style={styles.ratingNum}>{expert.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>· {expert.reviewCount} inceleme</Text>
                </View>
              </View>
            </View>
            <Text style={styles.bio}>{expert.bio}</Text>
            <Pressable
              onPress={() => onSelect(expert.id)}
              style={({ pressed }) => [styles.selectBtn, pressed && styles.selectBtnPressed]}
            >
              <Text style={styles.selectBtnText}>Bu Uzmanı Seç</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { paddingVertical: spacing.xs, minWidth: 60 },
  backText: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: typography.headline,
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: '700',
  },
  headerSpacer: { minWidth: 60 },
  subtitle: {
    fontFamily: typography.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    lineHeight: 20,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  avatar: {
    fontSize: 36,
    lineHeight: 44,
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  expertName: {
    fontFamily: typography.headline,
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: '700',
  },
  expertField: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  stars: {
    fontSize: fontSize.sm,
    color: colors.warn,
  },
  ratingNum: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  reviewCount: {
    fontFamily: typography.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  bio: {
    fontFamily: typography.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  selectBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  selectBtnPressed: { opacity: 0.85 },
  selectBtnText: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.sm,
    color: colors.bg,
    fontWeight: '600',
  },
});
