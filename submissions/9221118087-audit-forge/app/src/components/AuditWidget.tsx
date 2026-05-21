import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { AuditReport, AuditSeverity, MarkedArea, ScreenName } from '../types/audit';
import { createAuditReport } from '../utils/markdownReport';

interface Props {
  currentScreen: ScreenName;
  onReportGenerated: (report: AuditReport) => void;
}

const areasByScreen: Record<ScreenName, MarkedArea[]> = {
  HomeScreen: [
    {
      id: 'hero-summary',
      label: 'Summary panel',
      description: 'Yellow marked area over the Track C summary panel on HomeScreen.',
    },
    {
      id: 'primary-action',
      label: 'Primary action',
      description: 'Yellow marked area around the main report creation action on HomeScreen.',
    },
  ],
  ReportsScreen: [
    {
      id: 'report-list',
      label: 'Report list',
      description: 'Yellow marked area around the generated report list on ReportsScreen.',
    },
    {
      id: 'markdown-viewer',
      label: 'Markdown viewer',
      description: 'Yellow marked area around the Markdown detail viewer on ReportsScreen.',
    },
  ],
  SettingsScreen: [
    {
      id: 'track-policy',
      label: 'Track policy',
      description: 'Yellow marked area around the Track C policy controls on SettingsScreen.',
    },
    {
      id: 'rollback-policy',
      label: 'Rollback policy',
      description: 'Yellow marked area around the rollback quality gate on SettingsScreen.',
    },
  ],
};

const severities: AuditSeverity[] = ['low', 'medium', 'high'];

const firstAreaFor = (screenName: ScreenName): MarkedArea =>
  areasByScreen[screenName][0] ?? {
    id: 'screen-area',
    label: 'Screen area',
    description: `Yellow marked area on ${screenName}.`,
  };

const defaultSteps = (screenName: ScreenName) => [
  `Open ${screenName}.`,
  'Tap the floating AuditWidget button.',
  'Select the marked area and enter the issue note.',
  'Generate the Markdown report and hand it to the coding agent.',
];

export function AuditWidget({ currentScreen, onReportGenerated }: Props) {
  const screenAreas = areasByScreen[currentScreen];
  const [visible, setVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState<MarkedArea>(() => firstAreaFor(currentScreen));
  const [severity, setSeverity] = useState<AuditSeverity>('medium');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [latestMarkdown, setLatestMarkdown] = useState('');

  const canSave = title.trim().length > 2 && note.trim().length > 2;

  const agentInstruction = useMemo(
    () =>
      `Use this audit report as repair input. READ the report, LOCATE the ${currentScreen} implementation, HYPOTHESIZE the smallest fix, REPAIR it, TEST with typecheck/lint, VERIFY the marked area behavior, then COMMIT only if verified or ROLLBACK and document the rejection in FORGE.md.`,
    [currentScreen]
  );

  useEffect(() => {
    setSelectedArea(firstAreaFor(currentScreen));
  }, [currentScreen]);

  const reset = () => {
    setTitle('');
    setNote('');
    setExpected('');
    setActual('');
    setSeverity('medium');
    setSelectedArea(firstAreaFor(currentScreen));
  };

  const close = () => {
    setVisible(false);
    reset();
  };

  const save = () => {
    if (!canSave) return;

    const report = createAuditReport({
      title: title.trim(),
      screenName: currentScreen,
      timestamp: new Date().toISOString(),
      markedArea: selectedArea,
      userNote: note.trim(),
      expectedBehavior: expected.trim() || 'The marked area should support the intended user flow clearly.',
      actualBehavior: actual.trim() || 'The marked area does not match the expected behavior described by the reporter.',
      severity,
      stepsToReproduce: defaultSteps(currentScreen),
      agentInstruction,
    });

    onReportGenerated(report);
    setLatestMarkdown(report.markdown);
    setVisible(false);
    setPreviewVisible(true);
    reset();
  };

  return (
    <>
      <Pressable style={styles.fab} onPress={() => setVisible(true)}>
        <Text style={styles.fabText}>!</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView contentContainerStyle={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.eyebrow}>AuditWidget</Text>
                  <Text style={styles.heading}>Report current screen issue</Text>
                </View>
                <Pressable style={styles.closeButton} onPress={close}>
                  <Text style={styles.closeText}>Close</Text>
                </Pressable>
              </View>

              <View style={styles.mockScreen}>
                <Text style={styles.mockTitle}>{currentScreen}</Text>
                <View style={styles.mockLine} />
                <View style={styles.mockLineShort} />
                <View style={styles.markedArea}>
                  <Text style={styles.markedAreaText}>{selectedArea.label}</Text>
                </View>
                <View style={styles.mockFooter} />
              </View>

              <Text style={styles.label}>Marked area</Text>
              <View style={styles.chipRow}>
                {screenAreas.map((area) => (
                  <Pressable
                    key={area.id}
                    style={[styles.chip, selectedArea.id === area.id && styles.chipActive]}
                    onPress={() => setSelectedArea(area)}
                  >
                    <Text style={[styles.chipText, selectedArea.id === area.id && styles.chipTextActive]}>
                      {area.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Issue title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Example: Report card source is unclear"
              />

              <Text style={styles.label}>User note</Text>
              <TextInput
                multiline
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder="Describe what looks wrong in human language."
              />

              <Text style={styles.label}>Expected behavior</Text>
              <TextInput
                multiline
                style={[styles.input, styles.smallTextArea]}
                value={expected}
                onChangeText={setExpected}
                placeholder="What should happen?"
              />

              <Text style={styles.label}>Actual behavior</Text>
              <TextInput
                multiline
                style={[styles.input, styles.smallTextArea]}
                value={actual}
                onChangeText={setActual}
                placeholder="What happens now?"
              />

              <Text style={styles.label}>Severity</Text>
              <View style={styles.chipRow}>
                {severities.map((item) => (
                  <Pressable
                    key={item}
                    style={[styles.chip, severity === item && styles.chipActive]}
                    onPress={() => setSeverity(item)}
                  >
                    <Text style={[styles.chipText, severity === item && styles.chipTextActive]}>
                      {item.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={[styles.saveButton, !canSave && styles.saveButtonDisabled]} onPress={save}>
                <Text style={styles.saveText}>Generate Markdown Report</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <View style={styles.preview}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.eyebrow}>Generated .md</Text>
              <Text style={styles.heading}>Agent-ready report</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={() => setPreviewVisible(false)}>
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.markdownBox}>
            <Text style={styles.markdownText}>{latestMarkdown}</Text>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    backgroundColor: '#be123c',
    borderRadius: 28,
    bottom: 82,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    width: 56,
    zIndex: 20,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '92%',
  },
  sheetContent: {
    gap: 12,
    padding: 18,
    paddingBottom: 26,
  },
  sheetHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    color: '#be123c',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heading: {
    color: '#17202a',
    fontSize: 21,
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
    fontWeight: '800',
  },
  mockScreen: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  mockTitle: {
    color: '#17202a',
    fontSize: 18,
    fontWeight: '900',
  },
  mockLine: {
    backgroundColor: '#dbe4ef',
    borderRadius: 4,
    height: 14,
    width: '86%',
  },
  mockLineShort: {
    backgroundColor: '#e8eef6',
    borderRadius: 4,
    height: 14,
    width: '58%',
  },
  markedArea: {
    backgroundColor: '#fef3c7',
    borderColor: '#eab308',
    borderRadius: 8,
    borderWidth: 3,
    padding: 18,
  },
  markedAreaText: {
    color: '#713f12',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  mockFooter: {
    backgroundColor: '#e8eef6',
    borderRadius: 4,
    height: 28,
    width: '100%',
  },
  label: {
    color: '#17202a',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c',
  },
  chipText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#17202a',
    fontSize: 15,
    padding: 12,
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  smallTextArea: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#be123c',
    borderRadius: 8,
    padding: 14,
  },
  saveButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  preview: {
    backgroundColor: '#f8fafc',
    flex: 1,
    padding: 18,
    paddingTop: 54,
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
