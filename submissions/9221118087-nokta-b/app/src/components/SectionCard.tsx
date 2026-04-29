import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppPalette } from '../theme/palette';

type SectionCardProps = PropsWithChildren<{
  title: string;
  palette: AppPalette;
}>;

export function SectionCard({ title, palette, children }: SectionCardProps) {
  return (
    <View style={[styles.container, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Text style={[styles.title, { color: palette.textPrimary }]}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    padding: 14
  },
  content: {
    marginTop: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '700'
  }
});
