import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

type Props = {
  screenName: string;
  onReport?: (markdown: string, fileUri: string) => void;
};

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function timestampForFilename(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${y}${m}${day}-${hh}${mm}${ss}`;
}

export function AuditWidget({ screenName, onReport }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [note, setNote] = useState("");
  const [savedUri, setSavedUri] = useState<string | null>(null);
  const [savedMarkdown, setSavedMarkdown] = useState<string>("");

  const markdown = useMemo(() => {
    const when = new Date().toISOString();
    const title = `# Denetim Raporu · ${screenName}\n\n`;
    const meta = `- oluşturulma: ${when}\n- ekran: ${screenName}\n\n`;
    const body = note.trim() ? note.trim() + "\n" : "(not yok)\n";
    return title + meta + body;
  }, [note, screenName]);

  const save = async () => {
    const dir = FileSystem.documentDirectory;
    if (!dir) return;
    const filename = `audit-${screenName.toLowerCase()}-${timestampForFilename(
      new Date()
    )}.md`;
    const uri = `${dir}${filename}`;
    await FileSystem.writeAsStringAsync(uri, markdown);
    setSavedUri(uri);
    setSavedMarkdown(markdown);
    onReport?.(markdown, uri);
    setSheetOpen(false);
    setPreviewOpen(true);
  };

  const share = async () => {
    if (!savedUri) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) return;
    await Sharing.shareAsync(savedUri);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setSheetOpen(true)}
        style={styles.fab}
      >
        <Text style={styles.fabText}>🐛</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent
        visible={sheetOpen}
        onRequestClose={() => setSheetOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Denetim · {screenName}</Text>
              <Pressable onPress={() => setSheetOpen(false)}>
                <Text style={styles.sheetClose}>Kapat</Text>
              </Pressable>
            </View>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Denetim notu yaz… (ör. rollback/takıldım yazarsan uzman görüşmesi tetiklenir)"
              placeholderTextColor="#6f6f86"
              multiline
              style={styles.input}
            />

            <Pressable style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveBtnText}>Raporu Kaydet (.md)</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={previewOpen}
        onRequestClose={() => setPreviewOpen(false)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Kaydedilen Önizleme</Text>
              <Pressable onPress={() => setPreviewOpen(false)}>
                <Text style={styles.sheetClose}>Bitti</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.previewScroll}>
              <Text style={styles.previewMono}>{savedMarkdown}</Text>
            </ScrollView>
            <Pressable style={styles.shareBtn} onPress={share}>
              <Text style={styles.shareBtnText}>Paylaş</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabText: { fontSize: 22 },
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: "#0f0f1f",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#23233b",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sheetTitle: { color: "#f2f2ff", fontSize: 16, fontWeight: "700" },
  sheetClose: { color: "#9aa0ff", fontWeight: "700" },
  input: {
    minHeight: 140,
    borderRadius: 14,
    backgroundColor: "#0a0a14",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#262640",
    padding: 12,
    color: "#f2f2ff",
    textAlignVertical: "top",
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: "#2a6df5",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "800" },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 18,
    justifyContent: "center",
  },
  previewCard: {
    backgroundColor: "#0f0f1f",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#23233b",
    overflow: "hidden",
    maxHeight: "85%",
  },
  previewHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#23233b",
  },
  previewTitle: { color: "#f2f2ff", fontSize: 16, fontWeight: "800" },
  previewScroll: { paddingHorizontal: 14, paddingVertical: 12 },
  previewMono: { color: "#d8d8ee", fontFamily: "monospace", fontSize: 12, lineHeight: 16 },
  shareBtn: {
    backgroundColor: "#1e8e5a",
    paddingVertical: 12,
    alignItems: "center",
  },
  shareBtnText: { color: "#fff", fontWeight: "900" },
});

