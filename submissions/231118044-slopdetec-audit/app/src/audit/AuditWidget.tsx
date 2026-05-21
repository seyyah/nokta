import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  GestureResponderEvent,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  PanResponderGestureState,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { AuditNote, AuditNoteBounds, AuditWidgetDeps } from './types';
import { buildDocxBase64, buildMarkdown, makeReportStamp } from './report';

type Props = {
  deps: AuditWidgetDeps;
  currentScreen: string;
  appName?: string;
  initialOpen?: boolean;
};

type Mode = 'idle' | 'capturing' | 'selecting' | 'annotating' | 'list';

type DraftSelection = {
  screenshot: string;
  bounds: AuditNoteBounds;
};

const SCREEN = Dimensions.get('window');
const SELECT_MIN_SIZE = 14;

function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function AuditWidget({ deps, currentScreen, appName = 'App', initialOpen = false }: Props) {
  const [panelOpen, setPanelOpen] = useState(initialOpen);
  const [mode, setMode] = useState<Mode>('idle');
  const [notes, setNotes] = useState<AuditNote[]>([]);
  const [plainScreenshot, setPlainScreenshot] = useState('');
  const [selection, setSelection] = useState<AuditNoteBounds | null>(null);
  const [draft, setDraft] = useState<DraftSelection | null>(null);
  const [noteText, setNoteText] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  const loadNotes = useCallback(async () => {
    setNotes(await deps.storage.loadNotes());
  }, [deps.storage]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const startSelection = async () => {
    if (mode !== 'idle') return;
    setPanelOpen(false);
    setBusy(true);
    setMode('capturing');
    try {
      const screenshot = await deps.captureScreen();
      setPlainScreenshot(screenshot);
      setSelection(null);
      setMode('selecting');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ekran yakalanamadi.';
      Alert.alert('Audit', message);
      setMode('idle');
    } finally {
      setBusy(false);
    }
  };

  const openList = async () => {
    await loadNotes();
    setPanelOpen(false);
    setMode('list');
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          const { pageX, pageY } = event.nativeEvent;
          startPoint.current = { x: pageX, y: pageY };
          setSelection({ x: pageX, y: pageY, width: 0, height: 0 });
        },
        onPanResponderMove: (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
          if (!startPoint.current) return;
          const nextX = gesture.dx < 0 ? startPoint.current.x + gesture.dx : startPoint.current.x;
          const nextY = gesture.dy < 0 ? startPoint.current.y + gesture.dy : startPoint.current.y;
          setSelection({
            x: Math.max(0, nextX),
            y: Math.max(0, nextY),
            width: Math.min(Math.abs(gesture.dx), SCREEN.width),
            height: Math.min(Math.abs(gesture.dy), SCREEN.height),
          });
        },
        onPanResponderRelease: () => {
          startPoint.current = null;
        },
      }),
    [],
  );

  const selectionReady = Boolean(
    selection && selection.width >= SELECT_MIN_SIZE && selection.height >= SELECT_MIN_SIZE,
  );

  const confirmSelection = async () => {
    if (!selection || !selectionReady) return;
    const confirmedSelection = selection;
    setBusy(true);
    try {
      const burned = await deps.captureScreen(confirmedSelection);
      setDraft({ screenshot: burned, bounds: confirmedSelection });
      setMode('annotating');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Secim rapora islenemedi.';
      Alert.alert('Audit', message);
    } finally {
      setBusy(false);
    }
  };

  const cancelFlow = () => {
    setMode('idle');
    setPlainScreenshot('');
    setSelection(null);
    setDraft(null);
    setNoteText('');
  };

  const saveNote = async () => {
    if (!draft || !noteText.trim()) {
      Alert.alert('Audit', 'Not bos olamaz.');
      return;
    }

    const next: AuditNote = {
      id: generateId(),
      screenName: currentScreen,
      screenshot: draft.screenshot,
      screenshotAspect: SCREEN.height / SCREEN.width,
      highlightBounds: draft.bounds,
      note: noteText.trim(),
      status: 'open',
      timestamp: new Date().toISOString(),
      reporterId: deps.reporterId,
    };

    const all = await deps.storage.loadNotes();
    await deps.storage.saveNotes([...all, next]);
    await loadNotes();
    cancelFlow();
    showToast('Audit notu kaydedildi');
  };

  const removeNote = async (id: string) => {
    const all = await deps.storage.loadNotes();
    await deps.storage.saveNotes(all.filter((note) => note.id !== id));
    await loadNotes();
  };

  const toggleFixed = async (id: string) => {
    const all = await deps.storage.loadNotes();
    const updated: AuditNote[] = all.map((note) => {
      if (note.id !== id) return note;
      const status: AuditNote['status'] = note.status === 'fixed' ? 'open' : 'fixed';
      return { ...note, status };
    });
    await deps.storage.saveNotes(updated);
    await loadNotes();
  };

  const exportMarkdown = async () => {
    const all = await deps.storage.loadNotes();
    if (all.length === 0) {
      Alert.alert('Audit', 'Rapor icin en az bir not gerekli.');
      return;
    }
    const md = buildMarkdown(all, { appName, exportedAt: new Date().toISOString() });
    const uri = await deps.writeTextFile(`audit-report-${makeReportStamp()}.md`, md);
    await deps.shareFile(uri, 'Markdown audit report');
    showToast('Markdown raporu olusturuldu');
  };

  const exportDocx = async () => {
    const all = await deps.storage.loadNotes();
    if (all.length === 0) {
      Alert.alert('Audit', 'Word raporu icin en az bir not gerekli.');
      return;
    }
    const docx = buildDocxBase64(all, { appName, exportedAt: new Date().toISOString() });
    const uri = await deps.writeBinaryFile(`audit-report-${makeReportStamp()}.docx`, docx);
    await deps.shareFile(uri, 'Word audit report');
    showToast('Word raporu olusturuldu');
  };

  return (
    <>
      <View pointerEvents="box-none" style={styles.mount}>
        <View style={styles.rail}>
          <TouchableOpacity
            style={[styles.auditButton, panelOpen && styles.auditButtonActive]}
            onPress={() => setPanelOpen((value) => !value)}
            accessibilityLabel="Audit panelini ac"
          >
            {deps.BugIcon || <Text style={styles.auditButtonText}>Audit</Text>}
          </TouchableOpacity>

          {panelOpen && (
            <View style={styles.panel}>
              <TouchableOpacity style={styles.panelAction} onPress={startSelection} disabled={mode !== 'idle'}>
                <Text style={styles.panelActionText}>Sec</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.panelActionSecondary} onPress={openList}>
                <Text style={styles.panelActionSecondaryText}>Notlar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.panelActionSecondary} onPress={exportMarkdown}>
                <Text style={styles.panelActionSecondaryText}>MD</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.panelActionSecondary} onPress={exportDocx}>
                <Text style={styles.panelActionSecondaryText}>DOCX</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {toast && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}
      </View>

      {mode === 'selecting' && (
        <View style={styles.selector}>
          <View style={styles.selectorShade} pointerEvents="none" />
          {selection && selection.width > 2 && selection.height > 2 && (
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
          )}
          <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
          <View style={styles.selectorTop}>
            <Text style={styles.selectorTitle}>
              {selectionReady ? 'Secim hazir - Devam ile not yaz' : 'Arkayi gorerek sorunlu bolgeyi ciz'}
            </Text>
          </View>
          <View style={styles.selectorBottom} pointerEvents="box-none">
            <TouchableOpacity style={styles.selectorCancel} onPress={cancelFlow} disabled={busy}>
              <Text style={styles.selectorCancelText}>Iptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectorConfirm, !selectionReady && styles.selectorConfirmDisabled]}
              onPress={confirmSelection}
              disabled={!selectionReady || busy}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.selectorConfirmText}>Devam</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={mode === 'annotating'} transparent animationType="slide" presentationStyle="overFullScreen">
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.noteSheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Audit notu</Text>
            <Text style={styles.sheetMeta}>Ekran: {currentScreen}</Text>
            {draft && (
              <Image source={{ uri: draft.screenshot }} style={styles.previewImage} resizeMode="cover" />
            )}
            <Text style={styles.inputLabel}>Sorunu veya istegi yaz</Text>
            <TextInput
              style={styles.noteInput}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              autoFocus
              placeholder="Orn: Bu buton cok baskin, daha sakin olsun."
              placeholderTextColor="#888"
            />
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelFlow}>
                <Text style={styles.cancelButtonText}>Iptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={mode === 'list'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.listContainer}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>Audit notlari</Text>
              <Text style={styles.listSub}>{notes.length} not</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setMode('idle')}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          {notes.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Henuz not yok</Text>
              <Text style={styles.emptyText}>Sol Audit panelindeki Sec dugmesiyle ilk raporu olustur.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.noteList}>
              {notes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <Image source={{ uri: note.screenshot }} style={styles.noteImage} resizeMode="cover" />
                  <View style={styles.noteBody}>
                    <View style={styles.noteTopRow}>
                      <Text style={styles.noteScreen}>{note.screenName}</Text>
                      <Text style={[styles.noteStatus, note.status === 'fixed' && styles.noteStatusFixed]}>
                        {note.status === 'fixed' ? 'Duzeltildi' : 'Acik'}
                      </Text>
                    </View>
                    <Text style={styles.noteCopy}>{note.note}</Text>
                    <Text style={styles.noteTime}>{new Date(note.timestamp).toLocaleString('tr-TR')}</Text>
                    <View style={styles.noteActions}>
                      <TouchableOpacity style={styles.smallButton} onPress={() => toggleFixed(note.id)}>
                        <Text style={styles.smallButtonText}>
                          {note.status === 'fixed' ? 'Acik yap' : 'Duzelt'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.smallDangerButton} onPress={() => removeNote(note.id)}>
                        <Text style={styles.smallDangerText}>Sil</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.exportRow}>
            <TouchableOpacity style={styles.exportButtonMd} onPress={exportMarkdown}>
              <Text style={styles.exportText}>Markdown</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButtonDocx} onPress={exportDocx}>
              <Text style={styles.exportText}>Word (.docx)</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {mode === 'capturing' && (
        <View style={styles.captureBusy}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.captureBusyText}>Ekran yakalaniyor</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  mount: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  rail: {
    position: 'absolute',
    left: 10,
    top: SCREEN.height * 0.34,
    alignItems: 'flex-start',
    gap: 8,
  },
  auditButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 7,
    elevation: 6,
  },
  auditButtonActive: {
    backgroundColor: '#ff3366',
    borderColor: '#ff9bb5',
  },
  auditButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 11,
  },
  panel: {
    width: 92,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d3748',
    backgroundColor: '#0f172a',
    padding: 8,
    gap: 8,
  },
  panelAction: {
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: '#f6e05e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelActionText: {
    color: '#1a1a1a',
    fontWeight: '900',
    fontSize: 13,
  },
  panelActionSecondary: {
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: '#182235',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelActionSecondaryText: {
    color: '#dbeafe',
    fontWeight: '800',
    fontSize: 12,
  },
  toast: {
    position: 'absolute',
    left: 84,
    top: SCREEN.height * 0.34 + 6,
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  selector: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    backgroundColor: 'transparent',
  },
  selectorShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(246,224,94,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(246,224,94,0.35)',
  },
  selectionBox: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: '#f6e05e',
    backgroundColor: 'rgba(246,224,94,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  selectorTop: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  selectorTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
    backgroundColor: '#f6e05e',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectorBottom: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 44,
    flexDirection: 'row',
    gap: 12,
  },
  selectorCancel: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  selectorCancelText: {
    color: '#fff',
    fontWeight: '800',
  },
  selectorConfirm: {
    flex: 2,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3366',
  },
  selectorConfirmDisabled: {
    backgroundColor: '#666',
  },
  selectorConfirmText: {
    color: '#fff',
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  noteSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 22,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d8d8d8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    color: '#111',
    fontSize: 19,
    fontWeight: '900',
  },
  sheetMeta: {
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#333',
    fontWeight: '800',
    marginBottom: 6,
  },
  noteInput: {
    minHeight: 86,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dadada',
    backgroundColor: '#f7f7f7',
    color: '#111',
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eeeeee',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '800',
  },
  saveButton: {
    flex: 2,
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3366',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
  },
  listHeader: {
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    color: '#111',
    fontSize: 22,
    fontWeight: '900',
  },
  listSub: {
    color: '#777',
    marginTop: 2,
  },
  closeButton: {
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  closeButtonText: {
    color: '#333',
    fontWeight: '800',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#222',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
  },
  noteList: {
    paddingVertical: 14,
    gap: 12,
  },
  noteCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  noteImage: {
    width: 94,
    minHeight: 132,
    backgroundColor: '#111',
  },
  noteBody: {
    flex: 1,
    padding: 12,
  },
  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  noteScreen: {
    color: '#111',
    fontWeight: '900',
  },
  noteStatus: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '900',
  },
  noteStatusFixed: {
    color: '#15803d',
  },
  noteCopy: {
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
  },
  noteTime: {
    color: '#888',
    fontSize: 12,
    marginBottom: 10,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    borderRadius: 8,
    backgroundColor: '#edf2ff',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  smallButtonText: {
    color: '#1e40af',
    fontWeight: '800',
    fontSize: 12,
  },
  smallDangerButton: {
    borderRadius: 8,
    backgroundColor: '#fff1f2',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  smallDangerText: {
    color: '#be123c',
    fontWeight: '800',
    fontSize: 12,
  },
  exportRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
  },
  exportButtonMd: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d3748',
  },
  exportButtonDocx: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  exportText: {
    color: '#fff',
    fontWeight: '900',
  },
  captureBusy: {
    position: 'absolute',
    zIndex: 2500,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.38)',
    gap: 10,
  },
  captureBusyText: {
    color: '#fff',
    fontWeight: '800',
  },
});
