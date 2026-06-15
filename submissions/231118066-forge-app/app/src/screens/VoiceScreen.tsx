import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Platform,
} from "react-native";
import type { Screen } from "../../App";
import { AuditWidget } from "../audit/AuditWidget";

type Props = {
  navigate: (screen: Screen) => void;
  onReport: (markdown: string) => void;
};

const BAR_COUNT = 28;
const isWeb = Platform.OS === "web";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function buildMarkdown(note: string): string {
  return [
    "# Audit Report",
    "",
    "**Screen:** `Voice`",
    `**Timestamp:** ${new Date().toISOString()}`,
    `**Note:** ${note || "—"}`,
    "",
    "## Hypothesis",
    "",
    "> _To be filled in by the coding agent._",
    "",
    "## Expected Fix",
    "",
    "> _To be filled in by the coding agent._",
  ].join("\n");
}

export function VoiceScreen({ navigate, onReport }: Props) {
  const { width: W } = useWindowDimensions();
  const [isRecording, setIsRecording] = useState(false);
  const [rms, setRms] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [dictateText, setDictateText] = useState("");
  const [showDictate, setShowDictate] = useState(false);
  const [previewMd, setPreviewMd] = useState<string | null>(null);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const webPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Native audio refs
  const audioRecorderRef = useRef<any>(null);
  const recorderStateRef = useRef<any>({ isRecording: false, metering: undefined });

  const barWidth = useMemo(() => Math.max(2, (W - 48) / BAR_COUNT - 2), [W]);

  const heights = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(4))
  ).current;
  const opacities = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.55))
  ).current;

  // Animate bars based on rms
  useEffect(() => {
    const silent = rms < 0.02;
    for (let i = 0; i < BAR_COUNT; i++) {
      const phase = (Math.sin((i + 1) * 1.7) + 1) / 2;
      const shape = 0.4 + 0.6 * phase;
      const target = silent ? 4 : 4 + shape * rms * 106;
      Animated.spring(heights[i], { toValue: target, speed: 50, bounciness: 3, useNativeDriver: false }).start();
      Animated.timing(opacities[i], { toValue: silent ? 0.35 : 1, duration: 300, useNativeDriver: false }).start();
    }
  }, [heights, opacities, rms]);

  // Native recording setup
  useEffect(() => {
    if (isWeb) return;
    let audioRecorder: any = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    const setup = async () => {
      try {
        const { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } = require("expo-audio");
        // We can't use hooks conditionally, so we use the imperative API
        // This is handled in start/stop functions below
      } catch (e) {
        console.warn("expo-audio setup error", e);
      }
    };
    setup();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Web: start recording with Web Audio API
  const startWeb = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsRecording(true);
      setErrorText(null);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      webPollRef.current = setInterval(() => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rmsVal = clamp(Math.sqrt(sum / dataArray.length) * 4, 0, 1);
        setRms(rmsVal);
      }, 80);
    } catch (e) {
      setErrorText("Mikrofon izni gerekli. Tarayıcıdan izin verin.");
    }
  };

  // Web: stop recording
  const stopWeb = () => {
    if (webPollRef.current) clearInterval(webPollRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    setIsRecording(false);
    setRms(0);
  };

  // Native: start recording
  const startNative = async () => {
    try {
      const { AudioModule, RecordingPresets, setAudioModeAsync } = require("expo-audio");
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setErrorText("Mikrofon izni gerekli. Lütfen izin verin.");
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });

      const { AudioRecorder } = require("expo-audio");
      const recorder = new AudioRecorder({
        ...RecordingPresets.LOW_QUALITY,
        isMeteringEnabled: true,
      });
      audioRecorderRef.current = recorder;
      await recorder.prepareToRecordAsync({
        ...RecordingPresets.LOW_QUALITY,
        isMeteringEnabled: true,
      });
      recorder.record();
      setIsRecording(true);
      setErrorText(null);

      // Poll metering
      const poll = setInterval(async () => {
        try {
          const state = await recorder.getStatusAsync?.();
          if (state?.metering !== undefined) {
            const db = state.metering;
            setRms(clamp((db + 60) / 60, 0, 1));
          }
        } catch (_) {}
      }, 80);
      webPollRef.current = poll;
    } catch (e) {
      setErrorText("Kayıt başlatılamadı: " + String(e));
    }
  };

  // Native: stop recording
  const stopNative = async () => {
    if (webPollRef.current) clearInterval(webPollRef.current);
    try {
      await audioRecorderRef.current?.stop();
    } catch (_) {}
    audioRecorderRef.current = null;
    setIsRecording(false);
    setRms(0);
  };

  const handleStart = () => isWeb ? startWeb() : startNative();
  const handleStop = () => isWeb ? stopWeb() : stopNative();

  useEffect(() => {
    return () => {
      if (isWeb) stopWeb();
      else stopNative();
    };
  }, []);

  const generateReport = async () => {
    if (!dictateText.trim()) {
      Alert.alert("Hata", "Lütfen önce bir not girin.");
      return;
    }
    const md = buildMarkdown(dictateText);
    setPreviewMd(md);
    onReport(md);

    if (!isWeb) {
      try {
        const FileSystem = require("expo-file-system/legacy");
        const path = `${FileSystem.documentDirectory}audit-${Date.now()}.md`;
        await FileSystem.writeAsStringAsync(path, md, { encoding: FileSystem.EncodingType.UTF8 });
      } catch (e) {
        console.warn("FileSystem error", e);
      }
    } else {
      try {
        localStorage.setItem(`audit-${Date.now()}`, md);
      } catch (_) {}
    }
  };

  const shareReport = async () => {
    if (!previewMd) return;
    if (isWeb) {
      const blob = new Blob([previewMd], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-${Date.now()}.md`;
      a.click();
      return;
    }
    try {
      const FileSystem = require("expo-file-system/legacy");
      const Sharing = require("expo-sharing");
      const path = `${FileSystem.documentDirectory}audit-share-${Date.now()}.md`;
      await FileSystem.writeAsStringAsync(path, previewMd, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: "text/markdown" });
      }
    } catch (e) {
      Alert.alert("Paylaşım hatası", String(e));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigate("Home")} style={styles.backBtn}>
          <Text style={styles.backText}>← Ana Sayfa</Text>
        </Pressable>
        <Text style={styles.small}>
          {isRecording ? "🔴 Kayıt alınıyor" : "Hazır"} · rms {rms.toFixed(2)}
        </Text>
      </View>

      <Text style={styles.title}>🎙️ Ses Görselleştirici</Text>

      {/* Bars */}
      <View style={styles.vizWrap}>
        <View style={styles.vizRow}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => {
            const active = rms >= 0.02;
            const bg = active ? `hsl(${200 + i * 5}, 80%, 55%)` : "#2a2a3e";
            return (
              <Animated.View
                key={i}
                style={[styles.bar, { width: barWidth, height: heights[i], opacity: opacities[i], backgroundColor: bg }]}
              />
            );
          })}
        </View>
      </View>

      {/* Start/Stop */}
      <Pressable
        onPress={isRecording ? handleStop : handleStart}
        style={[styles.actionBtn, isRecording ? styles.stopBtn : styles.startBtn]}
      >
        <Text style={styles.actionText}>
          {isRecording ? "⏹ Durdur" : "🎙️ Mikrofonu Başlat"}
        </Text>
      </Pressable>

      {!!errorText && <Text style={styles.error}>{errorText}</Text>}

      {/* Dictation */}
      <Pressable onPress={() => setShowDictate(!showDictate)} style={styles.dictateToggle}>
        <Text style={styles.dictateToggleText}>
          {showDictate ? "▼ Dikte Alanını Gizle" : "▶ Dikteyi Başlat"}
        </Text>
      </Pressable>

      {showDictate && (
        <View style={styles.dictateCard}>
          <Text style={styles.cardTitle}>Audit Notu</Text>
          <TextInput
            value={dictateText}
            onChangeText={setDictateText}
            placeholder="Gözlemini buraya yaz veya sesli dikte et..."
            placeholderTextColor="#6f6f86"
            multiline
            style={styles.dictateInput}
            autoFocus
          />
          <Pressable onPress={generateReport} style={styles.generateBtn}>
            <Text style={styles.generateBtnText}>📄 Markdown Audit Raporu Üret</Text>
          </Pressable>
        </View>
      )}

      {/* Preview Modal */}
      <Modal visible={!!previewMd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>✅ Rapor Oluşturuldu</Text>
            <ScrollView style={styles.mdPreview}>
              <Text style={styles.mdText}>{previewMd}</Text>
            </ScrollView>
            <View style={styles.modalBtns}>
              <Pressable style={styles.modalBtn} onPress={() => setPreviewMd(null)}>
                <Text style={styles.modalBtnText}>Kapat</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.shareBtn]} onPress={shareReport}>
                <Text style={styles.modalBtnText}>📤 Paylaş</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <AuditWidget screenName="Ses" onReport={(md) => onReport(md)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a14", padding: 18 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backBtn: { backgroundColor: "#121226", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#242443" },
  backText: { color: "#e8e8ff", fontWeight: "800" },
  small: { color: "#a9a9c6", fontWeight: "700" },
  title: { marginTop: 14, color: "#f2f2ff", fontSize: 26, fontWeight: "900" },
  vizWrap: { marginTop: 18, backgroundColor: "#0f0f1f", borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: "#242443", padding: 14 },
  vizRow: { height: 120, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  bar: { borderRadius: 6 },
  actionBtn: { marginTop: 18, paddingVertical: 14, borderRadius: 18, alignItems: "center" },
  startBtn: { backgroundColor: "#1e8e5a" },
  stopBtn: { backgroundColor: "#d64545" },
  actionText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  error: { marginTop: 10, color: "#ff8b8b", fontWeight: "800" },
  dictateToggle: { marginTop: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: "#1a1a2e", alignItems: "center", borderWidth: 1, borderColor: "#2a2a45" },
  dictateToggleText: { color: "#9aa0ff", fontWeight: "800" },
  dictateCard: { marginTop: 10, backgroundColor: "#0f0f1f", borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: "#242443", padding: 14 },
  cardTitle: { color: "#f2f2ff", fontWeight: "900" },
  dictateInput: { marginTop: 10, minHeight: 80, borderRadius: 14, backgroundColor: "#121226", borderWidth: StyleSheet.hairlineWidth, borderColor: "#242443", padding: 12, color: "#f2f2ff", textAlignVertical: "top" },
  generateBtn: { marginTop: 12, backgroundColor: "#2a6df5", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  generateBtnText: { color: "#fff", fontWeight: "900" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#1a1a2e", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: "80%" },
  modalTitle: { color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 10 },
  mdPreview: { backgroundColor: "#0a0a14", borderRadius: 8, padding: 10, maxHeight: 300, marginBottom: 12 },
  mdText: { fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }), fontSize: 11, color: "#aaa" },
  modalBtns: { flexDirection: "row", gap: 8 },
  modalBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#333", alignItems: "center" },
  shareBtn: { backgroundColor: "#3949ab", borderColor: "#3949ab" },
  modalBtnText: { color: "#fff", fontWeight: "700" },
});
