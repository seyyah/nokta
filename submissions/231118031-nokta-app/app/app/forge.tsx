import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { forgeCycles } from '../src/data';

export default function ForgeBoardScreen() {
  const totalKg = forgeCycles.reduce((sum, cycle) => sum + cycle.kg, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.topBar}>
          <Link href="/" asChild>
            <Pressable style={styles.iconButton}>
              <Ionicons name="chevron-back" size={20} color="#111827" />
            </Pressable>
          </Link>
          <Text style={styles.title}>Forge board</Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Ratchet kg</Text>
          <Text style={styles.summaryValue}>{totalKg}</Text>
          <Text style={styles.summaryBody}>Rollback rows stay visible so the next cycle does not repeat the failed hypothesis.</Text>
        </View>

        {forgeCycles.map((cycle) => (
          <View key={cycle.id} style={styles.cycle}>
            <View style={styles.cycleTop}>
              <Text style={styles.cycleId}>Cycle {cycle.id}</Text>
              <View style={[styles.resultPill, cycle.result === 'success' ? styles.successPill : styles.rollbackPill]}>
                <Text style={styles.resultText}>{cycle.result}</Text>
              </View>
            </View>
            <Text style={styles.report}>{cycle.report}</Text>
            <Text style={styles.summaryText}>{cycle.summary}</Text>
            <Text style={styles.kg}>{cycle.kg}kg</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  page: {
    gap: 12,
    padding: 20,
    paddingBottom: 96,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0,
  },
  summary: {
    backgroundColor: '#111827',
    borderRadius: 8,
    gap: 6,
    padding: 18,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
  },
  summaryBody: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  cycle: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  cycleTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cycleId: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  resultPill: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  successPill: {
    backgroundColor: '#dcfce7',
  },
  rollbackPill: {
    backgroundColor: '#fee2e2',
  },
  resultText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '900',
  },
  report: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '800',
  },
  summaryText: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  kg: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '900',
  },
});
