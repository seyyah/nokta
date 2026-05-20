import { StyleSheet, Text, View } from 'react-native';
import { AppPalette } from '../theme/palette';

type BulletListProps = {
  items: string[];
  palette: AppPalette;
  emptyText?: string;
  checklistMode?: boolean;
};

export function BulletList({ items, palette, emptyText = 'No items.', checklistMode = false }: BulletListProps) {
  if (items.length === 0) {
    return <Text style={[styles.empty, { color: palette.textMuted }]}>{emptyText}</Text>;
  }

  return (
    <View>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.row}>
          <Text style={[styles.marker, { color: palette.textMuted }]}>{checklistMode ? '[ ]' : '-'}</Text>
          <Text style={[styles.itemText, { color: palette.textSecondary }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 13,
    lineHeight: 20
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  },
  marker: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8
  }
});
