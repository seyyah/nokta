import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AuditReport } from '../types/audit';

interface Props {
  report: AuditReport;
  source: 'generated' | 'sample';
  onPress: () => void;
}

const severityColors = {
  low: '#d9f99d',
  medium: '#fde68a',
  high: '#fecaca',
};

const sourceMeta = {
  generated: {
    label: 'Generated locally',
    badgeColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  sample: {
    label: 'Sample file',
    badgeColor: '#e0f2fe',
    borderColor: '#38bdf8',
  },
};

export function ReportCard({ report, source, onPress }: Props) {
  const sourceDetails = sourceMeta[source];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: sourceDetails.borderColor },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: severityColors[report.severity] }]}>
          <Text style={styles.badgeText}>{report.severity.toUpperCase()}</Text>
        </View>
        <View style={[styles.sourceBadge, { backgroundColor: sourceDetails.badgeColor }]}>
          <Text style={styles.source}>{sourceDetails.label}</Text>
        </View>
      </View>
      <Text style={styles.title}>{report.title}</Text>
      <Text style={styles.meta}>
        {report.screenName} · {new Date(report.timestamp).toLocaleString()}
      </Text>
      <Text style={styles.note} numberOfLines={2}>
        {report.userNote}
      </Text>
      <Text style={styles.agent} numberOfLines={2}>
        Agent: {report.agentInstruction}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d4dce8',
    borderLeftWidth: 5,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  pressed: {
    opacity: 0.78,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '800',
  },
  sourceBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  source: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#17202a',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  meta: {
    color: '#64748b',
    fontSize: 12,
  },
  note: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  agent: {
    color: '#0f4c5c',
    fontSize: 13,
    lineHeight: 18,
  },
});
