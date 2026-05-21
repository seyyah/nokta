import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path, Circle } from 'react-native-svg';
import { AuditOverlay } from './AuditOverlay';
import { AuditNoteList } from './AuditNoteList';
import { AuditSelector } from './AuditSelector';
import { NoteManager } from '../core/storage';
import { buildMarkdown } from '../export/markdown';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BUTTON_W = 84;
const BUTTON_H = 52;
const DRAG_THRESHOLD = 6;

function BugIcon() {
  return (
    <View style={styles.iconRow}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <Path d="M9 12l2 2 4-4" />
      </Svg>
      <Text style={styles.iconLabel}>AUDIT</Text>
    </View>
  );
}

export function AuditWidget({ deps, appName = 'App', initialPosition }) {
  const navigation = useNavigation();
  const [mode, setMode] = useState('idle');
  const [notes, setNotes] = useState([]);
  const [capturedUri, setCapturedUri] = useState('');
  const [selectedBounds, setSelectedBounds] = useState(null);
  const [fabVisible, setFabVisible] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const managerRef = useRef(new NoteManager(deps.storage));
  const manager = managerRef.current;

  const initX = SCREEN_W - (initialPosition?.right ?? 20) - BUTTON_W;
  const initY = SCREEN_H - (initialPosition?.bottom ?? 120) - BUTTON_H;

  // Trash zone: bottom-left, far from FAB initial position
  const TRASH_SIZE = 70;
  const TRASH_X = 30;
  const TRASH_Y = SCREEN_H - 160;

  const pan = useRef(new Animated.ValueXY({ x: initX, y: initY })).current;
  const lastPos = useRef({ x: initX, y: initY });
  const isDragging = useRef(false);
  const tapTimer = useRef(null);
  const pendingTaps = useRef(0);
  const fabTapTimer = useRef(null);
  const fabPendingTaps = useRef(0);

  const handleCaptureRef = useRef(() => {});
  const handleOpenListRef = useRef(() => {});

  // Hide FAB when audit modals are open or on Vision screen
  useEffect(() => {
    if (mode !== 'idle' || deps.currentScreen === 'Vision') {
      setFabVisible(false);
    }
  }, [mode, deps.currentScreen]);

  const loadNotes = useCallback(async () => {
    setNotes(await manager.getAll());
  }, [manager]);

  const handleCapture = useCallback(async () => {
    setMode('capturing');
    try {
      const uri = await deps.captureScreen();
      setCapturedUri(uri);
      setSelectedBounds(null);
      setMode('selecting');
    } catch (e) {
      console.warn('[AuditWidget] captureScreen failed:', e);
      setMode('idle');
    }
  }, [deps]);

  const handleOpenList = useCallback(async () => {
    await loadNotes();
    setMode('list');
  }, [loadNotes]);

  handleCaptureRef.current = handleCapture;
  handleOpenListRef.current = handleOpenList;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > DRAG_THRESHOLD || Math.abs(gs.dy) > DRAG_THRESHOLD,

      onPanResponderGrant: () => {
        isDragging.current = false;
      },

      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dx) > DRAG_THRESHOLD || Math.abs(gs.dy) > DRAG_THRESHOLD) {
          isDragging.current = true;
          setShowTrash(true);
        }
        // Direct positioning: no offset/value gymnastics
        pan.setValue({
          x: lastPos.current.x + gs.dx,
          y: lastPos.current.y + gs.dy,
        });
      },

      onPanResponderRelease: (_, gs) => {
        const rawX = lastPos.current.x + gs.dx;
        const rawY = lastPos.current.y + gs.dy;

        // Trash zone drop check
        if (
          rawX > TRASH_X - 30 &&
          rawX < TRASH_X + TRASH_SIZE + 30 &&
          rawY > TRASH_Y - 30 &&
          rawY < TRASH_Y + TRASH_SIZE + 30
        ) {
          pan.setValue({ x: initX, y: initY });
          lastPos.current = { x: initX, y: initY };
          setFabVisible(false);
          setShowTrash(false);
          return;
        }

        const clampedX = Math.max(0, Math.min(SCREEN_W - BUTTON_W, rawX));
        const clampedY = Math.max(0, Math.min(SCREEN_H - BUTTON_H, rawY));
        pan.setValue({ x: clampedX, y: clampedY });
        lastPos.current = { x: clampedX, y: clampedY };
        setShowTrash(false);

        if (!isDragging.current) {
          pendingTaps.current += 1;
          if (tapTimer.current) clearTimeout(tapTimer.current);
          tapTimer.current = setTimeout(() => {
            const taps = pendingTaps.current;
            pendingTaps.current = 0;
            if (taps >= 2) {
              handleOpenListRef.current();
            } else {
              handleCaptureRef.current();
            }
          }, 280);
        }
      },
    })
  ).current;

  const handleSelectionConfirm = (bounds, annotatedUri) => {
    setSelectedBounds(bounds);
    setCapturedUri(annotatedUri);
    setMode('annotating');
  };

  const handleSaveNote = async (noteText) => {
    const { height: SH, width: SW } = Dimensions.get('screen');
    await manager.add({
      screenName: deps.currentScreen,
      screenshot: capturedUri,
      screenshotAspect: SH / SW,
      highlightBounds: selectedBounds,
      note: noteText,
      reporterId: deps.reporterId,
    });
    await loadNotes();
    setMode('idle');
    setCapturedUri('');
  };

  const handleDelete = async (id) => {
    await manager.remove(id);
    await loadNotes();
  };

  const handleEdit = async (id, newNote) => {
    await manager.update(id, { note: newNote });
    await loadNotes();
  };

  const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

  const handleExportMd = async () => {
    const all = await manager.getAll();
    const md = buildMarkdown(all, {
      appName,
      exportedAt: new Date().toISOString(),
      totalNotes: all.length,
    });
    const fileUri = await deps.writeFile(`bug-report-${stamp()}.md`, md);
    await deps.shareFile(fileUri);
  };

  const handleFabTriggerTap = () => {
    fabPendingTaps.current += 1;
    if (fabTapTimer.current) clearTimeout(fabTapTimer.current);
    fabTapTimer.current = setTimeout(() => {
      const taps = fabPendingTaps.current;
      fabPendingTaps.current = 0;
      if (taps >= 4) {
        setFabVisible(true);
      }
    }, 400);
  };

  const isAuditScreen = mode !== 'idle' || deps.currentScreen === 'Vision';

  return (
    <>
      {/* Invisible trigger — 4 quick taps in bottom-right corner to reveal FAB */}
      {!fabVisible && !isAuditScreen && (
        <TouchableOpacity
          style={styles.triggerArea}
          onPress={handleFabTriggerTap}
          activeOpacity={1}
        />
      )}

      {/* Trash zone appears when dragging FAB */}
      {showTrash && fabVisible && (
        <View style={styles.trashZone} pointerEvents="none">
          <Text style={styles.trashIcon}>🗑️</Text>
          <Text style={styles.trashLabel}>Bırak</Text>
        </View>
      )}

      {/* FAB button */}
      {mode === 'idle' && fabVisible && !isAuditScreen && (
        <Animated.View
          style={[styles.fab, { left: pan.x, top: pan.y }]}
          {...panResponder.panHandlers}
        >
          <BugIcon />
        </Animated.View>
      )}

      {mode === 'selecting' && (
        <AuditSelector
          screenshotUri={capturedUri}
          captureRef={deps.captureRef}
          onConfirm={handleSelectionConfirm}
          onCancel={() => { setMode('idle'); setCapturedUri(''); }}
        />
      )}

      <AuditOverlay
        visible={mode === 'annotating'}
        screenshotUri={capturedUri}
        selectedBounds={selectedBounds}
        screenName={deps.currentScreen}
        reporterId={deps.reporterId}
        onSave={handleSaveNote}
        onCancel={() => { setMode('idle'); setCapturedUri(''); }}
      />

      <Modal visible={mode === 'list'} animationType="slide" presentationStyle="pageSheet">
        <AuditNoteList
          notes={notes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExportMd={handleExportMd}
          onOpenVision={() => {
            setMode('idle');
            navigation.navigate('Vision');
          }}
          onClose={() => setMode('idle')}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerArea: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 80,
    height: 80,
    zIndex: 9998,
  },
  trashZone: {
    position: 'absolute',
    left: 20,
    bottom: 120,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderWidth: 2,
    borderColor: '#ef4444',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9997,
  },
  trashIcon: {
    fontSize: 28,
  },
  trashLabel: {
    fontSize: 9,
    color: '#ef4444',
    fontWeight: '700',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    zIndex: 9999,
    width: BUTTON_W,
    height: BUTTON_H,
    borderRadius: BUTTON_H / 2,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
