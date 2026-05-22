/**
 * AdminQuestionCard.tsx
 * Admin panelinde bekleyen HITL sorusunu gösteren kart.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MessageSquare, Clock, Tag, Send } from 'lucide-react-native';
import { HitlItem } from '../services/hitlService';

interface AdminQuestionCardProps {
  item: HitlItem;
  onAnswer: (id: string, answer: string, topic: string) => Promise<void>;
}

export default function AdminQuestionCard({ item, onAnswer }: AdminQuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const createdDate = new Date(item.createdAt).toLocaleString('tr-TR');

  const handleSubmit = async () => {
    if (answer.trim().length < 5 || topic.trim().length < 2) return;
    setSaving(true);
    try {
      await onAnswer(item.id, answer.trim(), topic.trim());
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <View style={[styles.card, styles.cardDone]}>
        <Text style={styles.doneText}>✅ Cevap kaydedildi ve hafızaya alındı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Soru Başlığı */}
      <View style={styles.cardHeader}>
        <MessageSquare color="#FF9800" size={18} />
        <Text style={styles.cardTitle}>YENİ SORU</Text>
        <View style={styles.timeBadge}>
          <Clock color="#555" size={12} />
          <Text style={styles.timeText}>{createdDate}</Text>
        </View>
      </View>

      {/* Soru Metni */}
      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{item.question}</Text>
      </View>

      {/* Bağlam (varsa) */}
      {item.context ? (
        <View style={styles.contextBox}>
          <Text style={styles.contextLabel}>BAĞLAM:</Text>
          <Text style={styles.contextText}>{item.context}</Text>
        </View>
      ) : null}

      {/* Konu Başlığı Input */}
      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <Tag color="#00E5FF" size={14} />
          <Text style={styles.inputLabelText}>KONU BAŞLIĞI (knowledge dosyası için)</Text>
        </View>
        <TextInput
          style={styles.topicInput}
          placeholder="ör: pazar analizi, rakip karşılaştırma..."
          placeholderTextColor="#444"
          value={topic}
          onChangeText={setTopic}
        />
      </View>

      {/* Cevap Input */}
      <View style={styles.inputGroup}>
        <View style={styles.inputLabel}>
          <Send color="#00FF41" size={14} />
          <Text style={[styles.inputLabelText, { color: '#00FF41' }]}>CEVABINIZ</Text>
        </View>
        <TextInput
          style={styles.answerInput}
          placeholder="Yetkili cevabınızı buraya yazın..."
          placeholderTextColor="#444"
          multiline
          value={answer}
          onChangeText={setAnswer}
          textAlignVertical="top"
        />
      </View>

      {/* Gönder Butonu */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          (answer.trim().length < 5 || topic.trim().length < 2 || saving) && styles.submitBtnDisabled
        ]}
        onPress={handleSubmit}
        disabled={answer.trim().length < 5 || topic.trim().length < 2 || saving}
      >
        {saving ? (
          <ActivityIndicator color="#000" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>✅ CEVAPLA & HAFIZAYA AL</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF9800',
    padding: 16,
    marginBottom: 16,
  },
  cardDone: {
    borderColor: '#00FF41',
    alignItems: 'center',
    paddingVertical: 20,
  },
  doneText: {
    color: '#00FF41',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FF9800',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    flex: 1,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: '#555',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  questionBox: {
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  questionText: {
    color: '#FFD0A0',
    fontFamily: 'monospace',
    fontSize: 15,
    lineHeight: 22,
  },
  contextBox: {
    backgroundColor: '#0a0a0a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  contextLabel: {
    color: '#444',
    fontFamily: 'monospace',
    fontSize: 10,
    marginBottom: 4,
    letterSpacing: 1,
  },
  contextText: {
    color: '#666',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  inputLabelText: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  topicInput: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 12,
  },
  answerInput: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 12,
    minHeight: 120,
  },
  submitBtn: {
    backgroundColor: '#00FF41',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(0, 255, 65, 0.15)',
  },
  submitBtnText: {
    color: '#000',
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});
