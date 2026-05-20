import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';

export type GenerateBannerProps = {
  onGenerate: () => void;
};

/**
 * Rubric'teki 7 sinyal hep "strong" olduğunda input'un üstünde belirir.
 * Kullanıcı tek tuşla idea.md üretimini tetikleyebilsin diye — AI ile
 * "evet üret" diye yazışmak zorunda kalmasın.
 */
export function GenerateBanner({ onGenerate }: GenerateBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>Noktan çekirdeğe ulaştı</Text>
        <Text style={styles.subtitle}>
          Tüm sinyaller dolu. idea.md üretmeye hazır.
        </Text>
      </View>
      <Pressable
        onPress={onGenerate}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      >
        <Text style={styles.btnText}>Üret</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  textBlock: { flex: 1 },
  title: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  btnPressed: { opacity: 0.85 },
  btnText: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.sm,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
