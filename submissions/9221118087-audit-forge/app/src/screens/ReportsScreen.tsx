import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ReportCard } from '../components/ReportCard';
import { sampleReports } from '../data/sampleReports';
import type { AuditReport } from '../types/audit';
import { useState } from 'react';

interface Props {
  generatedReports: AuditReport[];
}

export function ReportsScreen({ generatedReports }: Props) {
  const [selected, setSelected] = useState<AuditReport | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Markdown reports</Text>
          <Text style={styles.title}>Agent input queue</Text>
          <Text style={styles.body}>
            Generated reports stay in local state for this demo. Bundled samples mirror the files in the
            submission reports folder.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generated in app</Text>
          {generatedReports.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No generated reports yet</Text>
              <Text style={styles.emptyBody}>
                Tap the floating audit button, mark an area, and generate a Markdown report.
              </Text>
            </View>
          ) : (
            generatedReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                source="generated"
                onPress={() => setSelected(report)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample reports</Text>
          {sampleReports.map((report) => (
            <ReportCard key={report.id} report={report} source="sample" onPress={() => setSelected(report)} />
          ))}
        </View>
      </ScrollView>

      <Modal visible={selected !== null} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.kicker}>Report Markdown</Text>
              <Text style={styles.modalTitle}>{selected?.title}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={() => setSelected(null)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.markdownBox}>
            <Text style={styles.markdownText}>{selected?.markdown}</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#edf2f7',
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  kicker: {
    color: '#be123c',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#17202a',
    fontSize: 26,
    fontWeight: '900',
  },
  body: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#17202a',
    fontSize: 17,
    fontWeight: '900',
  },
  empty: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 16,
  },
  emptyTitle: {
    color: '#17202a',
    fontSize: 16,
    fontWeight: '900',
  },
  emptyBody: {
    color: '#52606d',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  modal: {
    backgroundColor: '#f8fafc',
    flex: 1,
    padding: 16,
    paddingTop: 54,
  },
  modalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  modalTitleWrap: {
    flex: 1,
    gap: 4,
  },
  modalTitle: {
    color: '#17202a',
    fontSize: 20,
    fontWeight: '900',
  },
  closeButton: {
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeText: {
    color: '#334155',
    fontWeight: '900',
  },
  markdownBox: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  markdownText: {
    color: '#17202a',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});
