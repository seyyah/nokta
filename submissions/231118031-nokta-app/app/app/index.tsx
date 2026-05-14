import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Nokta Audit Forge</Text>
          <Text style={styles.title}>Customer capture becomes agent work.</Text>
          <Text style={styles.body}>
            A tester marks the exact UI problem, exports a Markdown report, and the forge cycle turns that
            report into a scoped repair.
          </Text>
        </View>

        <View style={styles.handoff}>
          <View style={styles.handoffIcon}>
            <Ionicons name="scan" size={20} color="#0f766e" />
          </View>
          <View style={styles.handoffText}>
            <Text style={styles.handoffTitle}>One report, one hypothesis, one repair</Text>
            <Text style={styles.handoffBody}>
              The QA button is mounted once at the root. Remove it and the host screens still run.
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <Metric label="Screens" value="4" tone="green" />
          <Metric label="Reports" value="3" tone="amber" />
          <Metric label="Cycles" value="4" tone="red" />
        </View>

        <View style={styles.actions}>
          <Link href="/ideas" asChild>
            <Pressable style={styles.primaryAction}>
              <Ionicons name="list" size={18} color="#ffffff" />
              <Text style={styles.primaryActionText}>Open ideas</Text>
            </Pressable>
          </Link>
          <Link href="/forge" asChild>
            <Pressable style={styles.secondaryAction}>
              <Ionicons name="git-commit" size={18} color="#111827" />
              <Text style={styles.secondaryActionText}>Forge ledger</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'green' | 'amber' | 'red' }) {
  return (
    <View style={[styles.metric, styles[`${tone}Metric`]]}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  page: {
    gap: 18,
    padding: 20,
    paddingBottom: 96,
  },
  header: {
    gap: 10,
    paddingTop: 14,
  },
  eyebrow: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 40,
  },
  body: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 23,
  },
  handoff: {
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  handoffIcon: {
    alignItems: 'center',
    backgroundColor: '#ccfbf1',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  handoffText: {
    flex: 1,
    gap: 5,
  },
  handoffTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  handoffBody: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    borderRadius: 8,
    flex: 1,
    padding: 12,
  },
  greenMetric: {
    backgroundColor: '#dcfce7',
  },
  amberMetric: {
    backgroundColor: '#fef3c7',
  },
  redMetric: {
    backgroundColor: '#fee2e2',
  },
  metricValue: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  actions: {
    gap: 10,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
  },
  secondaryActionText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
});
