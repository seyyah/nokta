import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';

// Spec (idea.md) ekranı stub — bir sonraki commit'te 7-bölüm kart
// render'ı, kopyalama ve geçmişe kaydetme eklenecek.
export default function Spec() {
  const { md } = useLocalSearchParams<{ md: string }>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace('/')}
          style={styles.homeBtn}
          hitSlop={8}
        >
          <Text style={styles.homeText}>← Yeni Nokta</Text>
        </Pressable>
        <Text style={styles.title}>Spec Hazır</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.label}>Üretilen idea.md</Text>
        <View style={styles.mdBox}>
          <Text style={styles.mdText}>{md ?? ''}</Text>
        </View>
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
  homeBtn: { paddingVertical: spacing.xs },
  homeText: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  title: {
    fontFamily: typography.headlineMedium,
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  headerRight: { width: 90 },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: {
    fontFamily: typography.label,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  mdBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  mdText: {
    fontFamily: typography.mono,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
});
