import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DailyLog } from '../context/AppContext';
import { colors } from '../theme/colors';

interface HITLReviewPanelProps {
  isVisible: boolean;
  log: DailyLog;
  onCancel: () => void;
  onFinalize: (finalLog: DailyLog) => void;
}

export default function HITLReviewPanel({ isVisible, log, onCancel, onFinalize }: HITLReviewPanelProps) {
  const [editedMessage, setEditedMessage] = useState(log.coachMessage);
  const [editedScore, setEditedScore] = useState(log.fitScore.toString());
  const [isEscalating, setIsEscalating] = useState(false);
  const [expertNote, setExpertNote] = useState<string | null>(null);

  const simulateEscalation = () => {
    setIsEscalating(true);
    // Simulate mentor review delay
    setTimeout(() => {
      setIsEscalating(false);
      setExpertNote(
        "Uzman Notu: Mevcut kalori dengen iyi ancak proteini %20 artırman toparlanmanı hızlandıracaktır. Yarın sabah yürüyüşünü 15 dk uzat."
      );
    }, 2000);
  };

  const handleFinalize = () => {
    const finalScore = parseInt(editedScore, 10);
    onFinalize({
      ...log,
      fitScore: isNaN(finalScore) ? log.fitScore : finalScore,
      coachMessage: editedMessage + (expertNote ? `\n\n🎯 ${expertNote}` : ''),
    });
  };

  const isLowScore = log.fitScore < 50;

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>HITL Yönetişim Merkezi</Text>
            <Text style={styles.headerSub}>AI önerisini denetle veya bir uzmana eskalasyon tetikle.</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.section}>
              <Text style={styles.label}>AI Skoru ve Koçluk</Text>
              <View style={styles.scoreRow}>
                <TextInput
                  style={styles.scoreInput}
                  value={editedScore}
                  onChangeText={setEditedScore}
                  keyboardType="number-pad"
                />
                <Text style={styles.scoreInfo}>/ 100</Text>
              </View>
              <TextInput
                style={[styles.messageInput, { marginTop: 12 }]}
                value={editedMessage}
                onChangeText={setEditedMessage}
                multiline
              />
            </View>

            <View style={styles.hr} />

            <View style={styles.section}>
              <Text style={styles.label}>Uzman Desteği (Escalation)</Text>
              {isEscalating ? (
                <View style={styles.loadingBox}>
                  <Text style={styles.loadingText}>Mentora bağlanılıyor... Transkript analiz ediliyor.</Text>
                </View>
              ) : expertNote ? (
                <View style={styles.expertNoteBox}>
                  <Text style={styles.expertNoteTitle}>✅ Uzman Geri Bildirimi Alındı</Text>
                  <Text style={styles.expertNoteContent}>{expertNote}</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.escalateBtn} onPress={simulateEscalation}>
                  <Text style={styles.escalateBtnText}>🚀 Bir Uzmana (Mentor) Sor</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.hint}>
                {isLowScore 
                  ? "⚠️ Skorun düşük olduğu için uzman görüşü almanı şiddetle öneririz." 
                  : "AI önerisinden emin değilsen bir üst seviyeye eskalasyon tetikleyebilirsin."}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, isLowScore && !expertNote && styles.saveBtnWarning]}
              onPress={handleFinalize}
            >
              <Text style={styles.saveBtnText}>
                {expertNote ? 'Onaylı Veriyi Kaydet' : isLowScore ? 'Yine de Kaydet (Önerilmez)' : 'Onayla ve Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '90%',
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { marginBottom: 24 },
  headerTitle: { color: colors.accent, fontSize: 24, fontWeight: '900' },
  headerSub: { color: colors.textSecondary, fontSize: 14, marginTop: 4, lineHeight: 20 },
  scroll: { paddingBottom: 40 },
  hr: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
  section: { marginBottom: 12 },
  label: { color: colors.text, fontWeight: '800', marginBottom: 12, fontSize: 17 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    width: 80,
    textAlign: 'center',
  },
  scoreInfo: { color: colors.textSecondary, fontSize: 18, fontWeight: '600' },
  messageInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: { color: colors.textSecondary, fontSize: 12, marginTop: 12, fontStyle: 'italic', lineHeight: 18 },
  escalateBtn: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  escalateBtnText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  loadingBox: { padding: 20, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16 },
  loadingText: { color: colors.textSecondary, fontWeight: '700' },
  expertNoteBox: {
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  expertNoteTitle: { color: colors.success, fontWeight: '900', marginBottom: 8 },
  expertNoteContent: { color: colors.text, fontSize: 14, lineHeight: 20 },
  footer: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  cancelBtn: { flex: 1, padding: 16, alignItems: 'center' },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '700' },
  saveBtn: { flex: 2, backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  saveBtnWarning: { backgroundColor: colors.accent },
  saveBtnText: { color: colors.text, fontWeight: '900', fontSize: 16 },
});
