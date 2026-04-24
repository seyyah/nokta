import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, shadows } from '../theme';
import { SectionTone } from '../types/draft';

type DraftSectionCardProps = {
  title: string;
  items: string[];
  helperText?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: SectionTone;
  compact?: boolean;
};

export function DraftSectionCard({
  title,
  items,
  helperText,
  actionLabel,
  onAction,
  tone = 'default',
  compact = false,
}: DraftSectionCardProps) {
  return (
    <View
      style={[
        styles.card,
        tone === 'muted' ? styles.cardMuted : undefined,
        compact ? styles.cardCompact : undefined,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} style={styles.action}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item} style={styles.itemRow}>
            <View style={styles.bullet} />
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
    ...shadows,
  },
  cardMuted: {
    backgroundColor: palette.surfaceMuted,
  },
  cardCompact: {
    borderRadius: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: 'Newsreader_700Bold',
    fontSize: 30,
    lineHeight: 32,
    color: palette.ink,
    letterSpacing: -0.6,
  },
  action: {
    backgroundColor: palette.blueSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: palette.blueDeep,
  },
  helper: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: palette.muted,
  },
  list: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 8,
    backgroundColor: palette.amber,
  },
  itemText: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    lineHeight: 23,
    color: palette.inkSoft,
  },
});
