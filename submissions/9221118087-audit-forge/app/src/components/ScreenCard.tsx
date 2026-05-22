import { StyleSheet, Text, View } from 'react-native';
import type { ScreenSummary } from '../types/audit';

interface Props {
  screen: ScreenSummary;
}

export function ScreenCard({ screen }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{screen.title}</Text>
        <Text style={styles.name}>{screen.name}</Text>
      </View>
      <Text style={styles.description}>{screen.description}</Text>
      <Text style={styles.risk}>{screen.risk}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  header: {
    gap: 4,
  },
  title: {
    color: '#17202a',
    fontSize: 18,
    fontWeight: '700',
  },
  name: {
    color: '#52606d',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  description: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  risk: {
    color: '#8a4b00',
    fontSize: 13,
    lineHeight: 18,
  },
});
