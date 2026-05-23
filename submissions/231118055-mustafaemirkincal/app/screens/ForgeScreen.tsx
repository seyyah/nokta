import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type ForgeCycle = {
  cycle: number;
  report: string;
  hypothesis: string;
  result: 'success' | 'rollback';
  changedFiles: string[];
  test: string;
  commit: string;
  kg: number;
  humanTouches: number;
};

const FORGE_CYCLES: ForgeCycle[] = [
  {
    cycle: 1,
    report: 'report-01-bridge-gap.md',
    hypothesis: 'A dedicated human bridge CTA will make the Week 2 handoff visible without polluting the dedup flow.',
    result: 'success',
    changedFiles: ['app/screens/DumpScreen.tsx', 'app/screens/BridgeScreen.tsx'],
    test: 'typecheck + manual navigation',
    commit: 'working-tree',
    kg: 1,
    humanTouches: 0,
  },
  {
    cycle: 2,
    report: 'report-02-over-automation.md',
    hypothesis: 'Auto-sending every dump directly to the bridge would reduce friction more than it hurts clarity.',
    result: 'rollback',
    changedFiles: [],
    test: 'UX review failed: main card extraction path became harder to find.',
    commit: 'rollback/no-commit',
    kg: 1,
    humanTouches: 1,
  },
  {
    cycle: 3,
    report: 'report-03-question-clarity.md',
    hypothesis: 'Three to five focused bridge questions are enough to capture the expert handoff without turning into a form.',
    result: 'success',
    changedFiles: ['app/services/claudeApi.ts', 'app/screens/BridgeScreen.tsx'],
    test: 'npx tsc --noEmit',
    commit: 'working-tree',
    kg: 2,
    humanTouches: 0,
  },
  {
    cycle: 4,
    report: 'report-04-ledger-ratchet.md',
    hypothesis: 'A visible forge ledger with explicit rollback history makes Week 3 legible to the reviewer.',
    result: 'success',
    changedFiles: ['app/screens/ForgeScreen.tsx', 'FORGE.md', 'audit-reports/*.md'],
    test: 'manual ledger check',
    commit: 'working-tree',
    kg: 3,
    humanTouches: 0,
  },
];

const RESULT_META: Record<ForgeCycle['result'], { label: string; tint: string; badge: string }> = {
  success: {
    label: 'Success',
    tint: '#22c55e',
    badge: 'rgba(34, 197, 94, 0.16)',
  },
  rollback: {
    label: 'Rollback',
    tint: '#fb7185',
    badge: 'rgba(251, 113, 133, 0.16)',
  },
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Forge'>;
};

export default function ForgeScreen({ navigation }: Props) {
  const successCount = FORGE_CYCLES.filter(cycle => cycle.result === 'success').length;
  const rollbackCount = FORGE_CYCLES.length - successCount;
  const totalKg = FORGE_CYCLES[FORGE_CYCLES.length - 1]?.kg ?? 0;
  const humanTouches = FORGE_CYCLES.reduce((sum, cycle) => sum + cycle.humanTouches, 0);

  return (
    <View style={styles.container}>
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Forge ledger</Text>
          <Text style={styles.headerSub}>Week 3 slice: ratchet, rollback, and monotonic kg</Text>
        </View>
      </View>

      <FlatList
        data={FORGE_CYCLES}
        keyExtractor={item => String(item.cycle)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Closed loop, not a vague progress log.</Text>
            <Text style={styles.heroCopy}>
              The human bridge gives the expert a clear handoff. The forge ledger keeps the
              repair loop visible so rollback is treated as learning, not as noise.
            </Text>

            <View style={styles.metrics}>
              <Metric label="Success" value={String(successCount)} />
              <Metric label="Rollback" value={String(rollbackCount)} />
              <Metric label="kg" value={String(totalKg)} />
              <Metric label="Human touches" value={String(humanTouches)} />
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const meta = RESULT_META[item.result];

          return (
            <View style={styles.cycleCard}>
              <View style={styles.cycleTop}>
                <View style={[styles.badge, { backgroundColor: meta.badge }]}>
                  <Text style={[styles.badgeText, { color: meta.tint }]}>{meta.label}</Text>
                </View>
                <Text style={styles.cycleLabel}>Cycle {item.cycle}</Text>
              </View>

              <Text style={styles.report}>{item.report}</Text>
              <Text style={styles.hypothesis}>{item.hypothesis}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Changed</Text>
                <Text style={styles.detailValue}>{item.changedFiles.join(', ') || 'none'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Test</Text>
                <Text style={styles.detailValue}>{item.test}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Commit</Text>
                <Text style={styles.detailValue}>{item.commit}</Text>
              </View>
              <View style={styles.footerRow}>
                <Text style={styles.footerStat}>{item.kg}kg</Text>
                <Text style={styles.footerStat}>{item.humanTouches} human touches</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>Ratchet rule</Text>
            <Text style={styles.footerText}>
              Success rows increase kg monotonically. Rollback rows stay in the ledger so future
              cycles do not repeat the same wrong hypothesis.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09111d',
  },
  bgGlowTop: {
    position: 'absolute',
    top: -110,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
  },
  bgGlowBottom: {
    position: 'absolute',
    right: -100,
    bottom: -120,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
    borderColor: 'rgba(248, 250, 252, 0.12)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroCopy: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: 'rgba(248, 250, 252, 0.04)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  cycleCard: {
    backgroundColor: 'rgba(8, 15, 33, 0.94)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  cycleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cycleLabel: {
    color: '#7c8aa6',
    fontSize: 11,
    fontWeight: '700',
  },
  report: {
    color: '#f8fafc',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  hypothesis: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  detailValue: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  footerStat: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginTop: 4,
  },
  footerTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
});
