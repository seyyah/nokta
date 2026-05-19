import { StyleSheet, Text, View } from 'react-native';
import { AppPalette } from '../theme/palette';
import { ExpertReviewer } from '../types/expertReview';

type ExpertProfileCardProps = {
  reviewer: ExpertReviewer;
  palette: AppPalette;
};

export function ExpertProfileCard({ reviewer, palette }: ExpertProfileCardProps) {
  return (
    <View style={[styles.container, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
      <Text style={[styles.name, { color: palette.textPrimary }]}>{reviewer.name}</Text>
      <Text style={[styles.meta, { color: palette.textSecondary }]}>Domain: {reviewer.domain}</Text>
      <Text style={[styles.meta, { color: palette.textSecondary }]}>Availability: {reviewer.availability}</Text>
      <Text style={[styles.meta, { color: palette.textSecondary }]}>Response ETA: {reviewer.responseEta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    padding: 12
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4
  },
  name: {
    fontSize: 15,
    fontWeight: '800'
  }
});
