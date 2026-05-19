import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionCard } from '@/components/spec/section-card';
import { parseIdeaMd, serializeIdeaMd } from '@/constants/idea-md';
import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';
import { generateSessionId, saveSessionIfNew } from '@/services/storage';

export default function Spec() {
  const { md } = useLocalSearchParams<{ md: string }>();
  const [copied, setCopied] = useState(false);

  const raw = typeof md === 'string' ? md : '';
  const document = useMemo(() => parseIdeaMd(raw), [raw]);

  useEffect(() => {
    if (!raw) return;
    void saveSessionIfNew({
      id: generateSessionId(),
      savedAt: Date.now(),
      title: document.title,
      tagline: document.tagline,
      idea_md: raw,
    });
  }, [raw, document.title, document.tagline]);

  const onCopy = async () => {
    await Clipboard.setStringAsync(serializeIdeaMd(raw));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const onNewDot = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onNewDot} hitSlop={8} style={styles.headerLink}>
          <Text style={styles.headerLinkText}>← Yeni Nokta</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Spec Hazır</Text>
        </View>
        <Pressable
          onPress={onCopy}
          hitSlop={8}
          style={({ pressed }) => [
            styles.copyBtn,
            copied && styles.copyBtnActive,
            pressed && styles.copyBtnPressed,
          ]}
        >
          <Text style={[styles.copyText, copied && styles.copyTextActive]}>
            {copied ? 'Kopyalandı ✓' : 'Kopyala'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <Text style={styles.title}>{document.title}</Text>
          {document.tagline.length > 0 && (
            <Text style={styles.tagline}>{document.tagline}</Text>
          )}
        </View>

        <View style={styles.sections}>
          {document.sections.map((section, i) => (
            <SectionCard
              key={`${i}-${section.heading}`}
              heading={section.heading}
              body={section.body}
            />
          ))}
        </View>

        <Pressable
          onPress={onNewDot}
          style={({ pressed }) => [
            styles.newDot,
            pressed && styles.newDotPressed,
          ]}
        >
          <Text style={styles.newDotText}>Yeni Nokta Başlat</Text>
        </Pressable>
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
  headerLink: { paddingVertical: spacing.xs, minWidth: 90 },
  headerLinkText: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  statusText: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  copyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 90,
    alignItems: 'center',
  },
  copyBtnActive: {
    borderColor: colors.success,
    backgroundColor: colors.surface,
  },
  copyBtnPressed: { opacity: 0.8 },
  copyText: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  copyTextActive: {
    color: colors.success,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.headline,
    fontSize: fontSize.xxl,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: typography.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 22,
  },
  sections: {
    gap: spacing.md,
  },
  newDot: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  newDotPressed: { opacity: 0.85 },
  newDotText: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
});
