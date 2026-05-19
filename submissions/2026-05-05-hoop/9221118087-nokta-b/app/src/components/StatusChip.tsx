import { StyleSheet, Text, View } from 'react-native';
import { ExpertReviewStatus } from '../types/expertReview';
import { AppPalette } from '../theme/palette';

type ChipTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

type StatusChipProps = {
  label: string;
  palette: AppPalette;
  tone?: ChipTone;
};

const statusToneMap: Record<ExpertReviewStatus, ChipTone> = {
  queued: 'warning',
  accepted: 'info',
  in_review: 'info',
  completed: 'success'
};

function resolveColors(tone: ChipTone, palette: AppPalette): { backgroundColor: string; textColor: string } {
  if (tone === 'success') {
    return { backgroundColor: '#DDF7E7', textColor: '#126438' };
  }

  if (tone === 'warning') {
    return { backgroundColor: '#FFF2D8', textColor: '#8A5500' };
  }

  if (tone === 'danger') {
    return { backgroundColor: '#FFE3E3', textColor: '#9B1C1C' };
  }

  if (tone === 'info') {
    return { backgroundColor: palette.accentSoft, textColor: palette.accent };
  }

  return { backgroundColor: palette.cardSoft, textColor: palette.textSecondary };
}

export function mapStatusToTone(status: ExpertReviewStatus): ChipTone {
  return statusToneMap[status] ?? 'neutral';
}

export function StatusChip({ label, palette, tone = 'neutral' }: StatusChipProps) {
  const colors = resolveColors(tone, palette);

  return (
    <View style={[styles.chip, { backgroundColor: colors.backgroundColor, borderColor: palette.border }]}>
      <Text style={[styles.text, { color: colors.textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2
  }
});
