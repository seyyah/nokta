import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type AuditStatus = 'open' | 'fixed';

export type AuditSelection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AuditNote = {
  id: string;
  screen: string;
  note: string;
  status: AuditStatus;
  createdAt: string;
  screenshotUri: string;
  selection: AuditSelection;
};

export type AuditStorage = {
  loadNotes: () => Promise<AuditNote[]>;
  saveNotes: (notes: AuditNote[]) => Promise<void>;
};

export type AuditDeps = {
  captureScreen: (screenName: string) => Promise<string>;
  captureRef: (
    ref: unknown,
    meta: { currentScreen: string; baseUri: string; selection: AuditSelection },
  ) => Promise<string>;
  writeFile: (filename: string, contents: string) => Promise<string>;
  writeFileBinary: (filename: string, contentsBase64: string) => Promise<string>;
  shareFile: (uri: string) => Promise<void>;
  storage: AuditStorage;
};

type AuditWidgetProps = {
  deps: AuditDeps;
  currentScreen: string;
};

type Mode = 'idle' | 'selecting' | 'annotating' | 'list';

const MIN_SELECTION = 10;

export function AuditWidget({ deps, currentScreen }: AuditWidgetProps) {
  const [mode, setMode] = useState<Mode>('idle');
  const [notes, setNotes] = useState<AuditNote[]>([]);
  const [draftText, setDraftText] = useState('');
  const [baseUri, setBaseUri] = useState('');
  const [annotatedUri, setAnnotatedUri] = useState('');
  const [fabPosition, setFabPosition] = useState({ x: 22, y: 520 });
  const [selection, setSelection] = useState<AuditSelection>({
    x: 72,
    y: 220,
    width: 220,
    height: 96,
  });
  const lastTapRef = useRef(0);
  const dragStartRef = useRef({ x: 22, y: 520 });
  const selectionStartRef = useRef({ x: 72, y: 220 });

  useEffect(() => {
    deps.storage.loadNotes().then(setNotes).catch(() => setNotes([]));
  }, [deps]);

  const fabPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6,
        onPanResponderGrant: () => {
          dragStartRef.current = fabPosition;
        },
        onPanResponderMove: (_, gestureState) => {
          setFabPosition({
            x: clamp(dragStartRef.current.x + gestureState.dx, 12, 304),
            y: clamp(dragStartRef.current.y + gestureState.dy, 96, 660),
          });
        },
      }),
    [fabPosition],
  );

  const selectorPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { pageX, pageY } = event.nativeEvent;
          selectionStartRef.current = { x: pageX, y: pageY };
          setSelection({ x: pageX, y: pageY, width: 1, height: 1 });
        },
        onPanResponderMove: (event) => {
          const { pageX, pageY } = event.nativeEvent;
          const start = selectionStartRef.current;
          setSelection(normalizeSelection(start.x, start.y, pageX, pageY));
        },
      }),
    [],
  );

  const startCapture = async () => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      setMode('list');
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;
    const screenUri = await deps.captureScreen(currentScreen);
    setBaseUri(screenUri);
    setSelection({ x: 72, y: 220, width: 220, height: 96 });
    setMode('selecting');
  };

  const continueToNote = async () => {
    if (selection.width < MIN_SELECTION || selection.height < MIN_SELECTION) return;
    const burnInUri = await deps.captureRef(null, {
      currentScreen,
      baseUri,
      selection,
    });
    setAnnotatedUri(burnInUri);
    setMode('annotating');
  };

  const saveNote = async () => {
    const trimmed = draftText.trim();
    if (!trimmed) return;

    const nextNote: AuditNote = {
      id: `audit-${Date.now().toString(36)}`,
      screen: currentScreen,
      note: trimmed,
      status: 'open',
      createdAt: new Date().toISOString(),
      screenshotUri: annotatedUri,
      selection,
    };
    const nextNotes = [nextNote, ...notes];
    setNotes(nextNotes);
    await deps.storage.saveNotes(nextNotes);
    setDraftText('');
    setMode('idle');
  };

  const exportMarkdown = async () => {
    const markdown = buildMarkdown(notes);
    const uri = await deps.writeFile('nokta-audit-report.md', markdown);
    await deps.shareFile(uri);
  };

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[styles.fabLayer, { transform: [{ translateX: fabPosition.x }, { translateY: fabPosition.y }] }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Audit capture"
          onPress={startCapture}
          style={styles.fab}
          {...fabPanResponder.panHandlers}
        >
          <Text style={styles.fabText}>QA</Text>
        </Pressable>
      </View>

      <Modal visible={mode === 'selecting'} transparent animationType="fade">
        <View style={styles.fullscreen}>
          <Image source={{ uri: baseUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <View style={styles.selectorLayer} {...selectorPanResponder.panHandlers}>
            <View
              pointerEvents="none"
              style={[
                styles.selectionBox,
                {
                  left: selection.x,
                  top: selection.y,
                  width: selection.width,
                  height: selection.height,
                },
              ]}
            />
          </View>
          <View style={styles.selectorActions}>
            <Pressable style={styles.secondaryButton} onPress={() => setMode('idle')}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={continueToNote}>
              <Text style={styles.primaryText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={mode === 'annotating'} transparent animationType="slide">
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{currentScreen}</Text>
            <Image source={{ uri: annotatedUri }} style={styles.preview} resizeMode="cover" />
            <TextInput
              value={draftText}
              onChangeText={setDraftText}
              placeholder="What should the agent fix or add here?"
              multiline
              style={styles.textArea}
            />
            <View style={styles.row}>
              <Pressable style={styles.secondaryButton} onPress={() => setMode('idle')}>
                <Text style={styles.secondaryText}>Dismiss</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={saveNote}>
                <Text style={styles.primaryText}>Save note</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={mode === 'list'} transparent animationType="slide">
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.listHeader}>
              <Text style={styles.sheetTitle}>Audit notes</Text>
              <Text style={styles.countBadge}>{notes.length}</Text>
            </View>
            <ScrollView style={styles.noteList}>
              {notes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <Text style={styles.noteScreen}>{note.screen}</Text>
                  <Text style={styles.noteText}>{note.note}</Text>
                  <Text style={styles.noteMeta}>{new Date(note.createdAt).toLocaleString()}</Text>
                </View>
              ))}
              {notes.length === 0 ? <Text style={styles.emptyText}>No audit notes yet.</Text> : null}
            </ScrollView>
            <View style={styles.row}>
              <Pressable style={styles.secondaryButton} onPress={() => setMode('idle')}>
                <Text style={styles.secondaryText}>Close</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={exportMarkdown}>
                <Text style={styles.primaryText}>Export MD</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function buildMarkdown(notes: AuditNote[]) {
  const body = notes
    .map(
      (note, index) => `## ${index + 1}. ${note.screen}

- Status: ${note.status}
- Created: ${note.createdAt}
- Selection: x=${Math.round(note.selection.x)}, y=${Math.round(note.selection.y)}, w=${Math.round(note.selection.width)}, h=${Math.round(note.selection.height)}

![Burn-in screenshot](${note.screenshotUri})

${note.note}
`,
    )
    .join('\n');

  return `# Nokta Audit Report

Generated: ${new Date().toISOString()}
Count: ${notes.length}

${body}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeSelection(x1: number, y1: number, x2: number, y2: number): AuditSelection {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

const styles = StyleSheet.create({
  fabLayer: {
    left: 0,
    pointerEvents: 'box-none',
    position: 'absolute',
    top: 0,
    zIndex: 50,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: '#d92d20',
    borderRadius: 26,
    elevation: 5,
    height: 52,
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    width: 52,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  fullscreen: {
    backgroundColor: '#111827',
    flex: 1,
  },
  selectorLayer: {
    flex: 1,
  },
  selectionBox: {
    backgroundColor: 'rgba(255, 221, 87, 0.18)',
    borderColor: '#ffdd57',
    borderRadius: 4,
    borderWidth: 3,
    position: 'absolute',
  },
  selectorActions: {
    bottom: 24,
    flexDirection: 'row',
    gap: 12,
    left: 20,
    position: 'absolute',
    right: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#14532d',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secondaryText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxHeight: '86%',
    padding: 18,
  },
  sheetTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  preview: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    height: 180,
    marginTop: 14,
    width: '100%',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    marginTop: 14,
    minHeight: 104,
    padding: 12,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    color: '#991b1b',
    fontWeight: '800',
    minWidth: 34,
    paddingHorizontal: 10,
    paddingVertical: 5,
    textAlign: 'center',
  },
  noteList: {
    marginTop: 12,
  },
  noteCard: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  noteScreen: {
    color: '#14532d',
    fontSize: 13,
    fontWeight: '800',
  },
  noteText: {
    color: '#111827',
    fontSize: 15,
    marginTop: 6,
  },
  noteMeta: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
    paddingVertical: 28,
    textAlign: 'center',
  },
});
