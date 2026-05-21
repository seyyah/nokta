import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../theme/colors';

type AuditWidgetProps = {
  children: React.ReactNode;
  deps: AuditWidgetDeps;
  screenName: string;
};

export type AuditWidgetDeps = {
  copyFile: (from: string, to: string) => Promise<void>;
  ensureDirectory: (path: string) => Promise<void>;
  getReportsDirectory: () => string;
  captureView: (target: React.RefObject<View | null>) => Promise<string>;
  writeText: (path: string, content: string) => Promise<void>;
};

function formatStamp(date: Date) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, '\\|').trim();
}

function AuditIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 5h6l1.4 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3.6L9 5Z"
        stroke="#07130f"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#07130f" strokeWidth={2} />
    </Svg>
  );
}

export default function AuditWidget({ children, deps, screenName }: AuditWidgetProps) {
  const captureTargetRef = React.useRef<View>(null);
  const burnInTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPromptOpen, setPromptOpen] = React.useState(false);
  const [isBurnInVisible, setBurnInVisible] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [isSaving, setSaving] = React.useState(false);

  React.useEffect(() => {
    return () => {
      if (burnInTimerRef.current) {
        clearTimeout(burnInTimerRef.current);
      }
    };
  }, []);

  const openPrompt = React.useCallback(() => {
    setNote('');
    setPromptOpen(true);
  }, []);

  const saveAuditReport = React.useCallback(async () => {
    if (!captureTargetRef.current || isSaving) return;

    setSaving(true);
    try {
      const reportsDirectory = deps.getReportsDirectory();
      await deps.ensureDirectory(reportsDirectory);
      const now = new Date();
      const stamp = formatStamp(now);
      setBurnInVisible(true);
      await new Promise((resolve) => setTimeout(resolve, 120));
      const screenshotUri = await deps.captureView(captureTargetRef);
      if (burnInTimerRef.current) {
        clearTimeout(burnInTimerRef.current);
      }
      burnInTimerRef.current = setTimeout(() => setBurnInVisible(false), 500);
      const screenshotName = `audit-${stamp}.png`;
      const screenshotPath = `${reportsDirectory}${screenshotName}`;
      await deps.copyFile(screenshotUri, screenshotPath);

      const reportName = `audit-${stamp}.md`;
      const reportPath = `${reportsDirectory}${reportName}`;
      const reportBody = [
        `# Audit ${stamp}`,
        '',
        `- Screen: ${escapeMarkdown(screenName) || 'Unknown'}`,
        `- Created: ${now.toISOString()}`,
        `- Screenshot: ./${screenshotName}`,
        '',
        '## Note',
        '',
        note.trim() || '_No note provided._',
        '',
      ].join('\n');

      await deps.writeText(reportPath, reportBody);
      setPromptOpen(false);
      Alert.alert('Audit saved', `Report written to audit-reports/${reportName}`);
    } catch (error) {
      setBurnInVisible(false);
      const message = error instanceof Error ? error.message : 'Unknown save error';
      Alert.alert('Audit failed', message);
    } finally {
      setSaving(false);
    }
  }, [deps, isSaving, note, screenName]);

  return (
    <View style={styles.root}>
      <View ref={captureTargetRef} collapsable={false} style={styles.captureRoot}>
        {children}
        {isBurnInVisible ? <View pointerEvents="none" style={styles.yellowBox} /> : null}
      </View>

      <Pressable
        accessibilityLabel="Create audit report"
        accessibilityRole="button"
        onPress={openPrompt}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <AuditIcon />
      </Pressable>

      <Modal transparent animationType="fade" onRequestClose={() => setPromptOpen(false)} visible={isPromptOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.prompt}>
            <Text style={styles.promptTitle}>Audit note</Text>
            <Text style={styles.promptScreen}>{screenName}</Text>
            <TextInput
              autoFocus={Platform.OS !== 'web'}
              multiline
              onChangeText={setNote}
              placeholder="What should be reviewed on this screen?"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              value={note}
            />
            <View style={styles.actions}>
              <Pressable disabled={isSaving} onPress={() => setPromptOpen(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
              <Pressable disabled={isSaving} onPress={saveAuditReport} style={styles.primaryButton}>
                {isSaving ? <ActivityIndicator color="#07130f" /> : <Text style={styles.primaryText}>Save</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  captureRoot: {
    flex: 1,
  },
  yellowBox: {
    position: 'absolute',
    top: 72,
    right: 18,
    bottom: 88,
    left: 18,
    borderWidth: 5,
    borderColor: '#FFD60A',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 214, 10, 0.08)',
    zIndex: 15,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 94,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: colors.primary,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    zIndex: 20,
  },
  fabPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(3, 8, 7, 0.66)',
  },
  prompt: {
    width: '100%',
    maxWidth: 420,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  promptTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  promptScreen: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13,
  },
  input: {
    minHeight: 120,
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: colors.background,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    minWidth: 88,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '700',
  },
  primaryButton: {
    minWidth: 88,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: '#07130f',
    fontWeight: '800',
  },
});
