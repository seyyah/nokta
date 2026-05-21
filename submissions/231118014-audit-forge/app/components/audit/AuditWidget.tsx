import { usePathname } from "expo-router";
import { Bug, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { AuditProvider, useAudit } from "./AuditProvider";
import ReportModal from "./ReportModal";
import { generateReportId } from "./markdown";
import type { Annotation, AuditReport } from "./types";

const { palette } = Colors;

const NEW_BOX_MIN = 24;

/**
 * Drop-in audit widget. Mount once at the root — it provides a floating FAB,
 * a capture overlay for drawing yellow annotation boxes, a note editor, and
 * a Markdown report sheet. No props required.
 */
export default function AuditWidget() {
  return (
    <AuditProvider>
      <AuditWidgetInner />
    </AuditProvider>
  );
}

function AuditWidgetInner() {
  const { mode } = useAudit();

  return (
    <>
      {mode === "capturing" || mode === "annotating" ? <CaptureOverlay /> : null}
      {mode === "idle" || mode === "review" ? <FloatingButton /> : null}
      <ReportModal />
    </>
  );
}

function FloatingButton() {
  const { startCapture } = useAudit();
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const onPressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  }, [scale]);
  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  }, [scale]);

  const pulseStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
    transform: [
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] }) },
    ],
  };

  return (
    <View pointerEvents="box-none" style={styles.fabWrap}>
      <Animated.View pointerEvents="none" style={[styles.fabPulse, pulseStyle]} />
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Nokta Audit"
          onPress={startCapture}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.fab}
          testID="audit-fab"
        >
          <Bug size={22} color={palette.ink} strokeWidth={2.5} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

function CaptureOverlay() {
  const pathname = usePathname();
  const {
    annotations,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    cancelCapture,
    saveReport,
  } = useAudit();

  const [draft, setDraft] = useState<Annotation | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const draftRef = useRef<Annotation | null>(null);
  const editingIdRef = useRef<string | null>(null);

  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editingIdRef.current === null,
      onMoveShouldSetPanResponder: () => editingIdRef.current === null,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        startRef.current = { x: locationX, y: locationY };
        const next: Annotation = {
          id: `a_${Date.now()}`,
          x: locationX,
          y: locationY,
          width: 0,
          height: 0,
          note: "",
          createdAt: Date.now(),
        };
        draftRef.current = next;
        setDraft(next);
      },
      onPanResponderMove: (e) => {
        const start = startRef.current;
        if (!start) return;
        const { locationX, locationY } = e.nativeEvent;
        const x = Math.min(start.x, locationX);
        const y = Math.min(start.y, locationY);
        const width = Math.abs(locationX - start.x);
        const height = Math.abs(locationY - start.y);
        const current = draftRef.current;
        if (!current) return;
        const updated: Annotation = { ...current, x, y, width, height };
        draftRef.current = updated;
        setDraft(updated);
      },
      onPanResponderRelease: () => {
        const d = draftRef.current;
        startRef.current = null;
        if (d && d.width >= NEW_BOX_MIN && d.height >= NEW_BOX_MIN) {
          addAnnotation(d);
          setEditingId(d.id);
          editingIdRef.current = d.id;
          setNoteText("");
        }
        draftRef.current = null;
        setDraft(null);
      },
      onPanResponderTerminate: () => {
        startRef.current = null;
        draftRef.current = null;
        setDraft(null);
      },
    })
  ).current;

  const onSaveNote = useCallback(() => {
    if (editingId) {
      updateAnnotation(editingId, { note: noteText });
    }
    setEditingId(null);
    setNoteText("");
  }, [editingId, noteText, updateAnnotation]);

  const onDeleteEditing = useCallback(() => {
    if (editingId) removeAnnotation(editingId);
    setEditingId(null);
    setNoteText("");
  }, [editingId, removeAnnotation]);

  const onGenerate = useCallback(() => {
    const { width: sw, height: sh } = Dimensions.get("window");
    const report: AuditReport = {
      id: generateReportId(),
      screen: pathname ?? "(unknown)",
      createdAt: Date.now(),
      device: {
        os: Platform.OS,
        osVersion: Platform.Version,
        screenWidth: Math.round(sw),
        screenHeight: Math.round(sh),
      },
      annotations,
    };
    saveReport(report);
  }, [annotations, pathname, saveReport]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dim layer with pointer events for drawing */}
      <View
        style={[StyleSheet.absoluteFill, styles.dim]}
        {...panResponder.panHandlers}
      />

      {/* Existing annotations */}
      {annotations.map((a, i) => (
        <Pressable
          key={a.id}
          onPress={() => {
            setEditingId(a.id);
            setNoteText(a.note);
          }}
          style={[
            styles.box,
            { left: a.x, top: a.y, width: a.width, height: a.height },
          ]}
        >
          <View style={styles.boxLabel}>
            <Text style={styles.boxLabelText}>{String.fromCharCode(65 + (i % 26))}</Text>
          </View>
        </Pressable>
      ))}

      {/* Drawing draft */}
      {draft && draft.width > 0 && draft.height > 0 ? (
        <View
          pointerEvents="none"
          style={[
            styles.box,
            styles.boxDraft,
            { left: draft.x, top: draft.y, width: draft.width, height: draft.height },
          ]}
        />
      ) : null}

      {/* Top bar */}
      <View pointerEvents="box-none" style={styles.topBar}>
        <View style={styles.topBarInner}>
          <View style={styles.recDot} />
          <Text style={styles.topBarTitle}>NOKTA · AUDIT MODE</Text>
          <Text style={styles.topBarCount}>{annotations.length} {annotations.length === 1 ? "mark" : "marks"}</Text>
        </View>
        <Pressable onPress={cancelCapture} style={styles.topClose} testID="audit-cancel">
          <X size={18} color={palette.text} />
        </Pressable>
      </View>

      {/* Hint or bottom actions */}
      {annotations.length === 0 && !draft ? (
        <View pointerEvents="none" style={styles.hint}>
          <Text style={styles.hintTitle}>Drag to mark a region</Text>
          <Text style={styles.hintSub}>Tap a mark to add a note. Hit GENERATE when done.</Text>
        </View>
      ) : null}

      {annotations.length > 0 && !editingId ? (
        <View pointerEvents="box-none" style={styles.bottomBar}>
          <Pressable onPress={cancelCapture} style={[styles.btn, styles.btnGhost]}>
            <Text style={styles.btnGhostText}>DISCARD</Text>
          </Pressable>
          <Pressable onPress={onGenerate} style={[styles.btn, styles.btnPrimary]} testID="audit-generate">
            <Text style={styles.btnPrimaryText}>GENERATE .md</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Note editor sheet */}
      {editingId ? (
        <View style={styles.noteSheet}>
          <View style={styles.noteHandle} />
          <Text style={styles.noteTitle}>Add a note</Text>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="What's wrong here?"
            placeholderTextColor={palette.textMuted}
            style={styles.noteInput}
            multiline
            autoFocus
            testID="audit-note-input"
          />
          <View style={styles.noteActions}>
            <Pressable onPress={onDeleteEditing} style={[styles.btn, styles.btnDanger]}>
              <Text style={styles.btnDangerText}>DELETE</Text>
            </Pressable>
            <Pressable onPress={onSaveNote} style={[styles.btn, styles.btnPrimary]}>
              <Text style={styles.btnPrimaryText}>SAVE</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: "absolute",
    right: 18,
    bottom: 92,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  fabPulse: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.yellow,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.yellow,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palette.yellow,
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    borderWidth: 2,
    borderColor: palette.ink,
  },
  dim: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  topBar: {
    position: "absolute",
    top: 54,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.ink,
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.yellow,
  },
  topBarInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.yellow,
  },
  topBarTitle: {
    color: palette.yellow,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  topBarCount: {
    color: palette.textDim,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginLeft: "auto" as const,
  },
  topClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    marginLeft: 8,
  },
  box: {
    position: "absolute",
    borderColor: palette.yellow,
    borderWidth: 2.5,
    backgroundColor: "rgba(255, 214, 10, 0.18)",
  },
  boxDraft: {
    borderStyle: "dashed" as const,
    backgroundColor: "rgba(255, 214, 10, 0.08)",
  },
  boxLabel: {
    position: "absolute",
    top: -1,
    left: -1,
    backgroundColor: palette.yellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  boxLabelText: {
    color: palette.ink,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  hint: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 120,
    alignItems: "center",
  },
  hintTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  hintSub: {
    color: palette.textDim,
    fontSize: 13,
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 32,
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    backgroundColor: palette.yellow,
  },
  btnPrimaryText: {
    color: palette.ink,
    fontWeight: "800",
    letterSpacing: 1.2,
    fontSize: 13,
  },
  btnGhost: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  btnGhostText: {
    color: palette.text,
    fontWeight: "700",
    letterSpacing: 1.2,
    fontSize: 13,
  },
  btnDanger: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.red,
  },
  btnDangerText: {
    color: palette.red,
    fontWeight: "700",
    letterSpacing: 1.2,
    fontSize: 13,
  },
  noteSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.ink2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: palette.borderStrong,
  },
  noteHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.borderStrong,
    marginBottom: 12,
  },
  noteTitle: {
    color: palette.yellow,
    fontWeight: "800",
    letterSpacing: 1.4,
    fontSize: 12,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: palette.surface,
    color: palette.text,
    borderRadius: 10,
    padding: 14,
    minHeight: 96,
    textAlignVertical: "top" as const,
    fontSize: 15,
    borderWidth: 1,
    borderColor: palette.border,
  },
  noteActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
});
