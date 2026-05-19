/**
 * AdminScreen.tsx
 * PIN korumalı admin paneli.
 * - PIN girişi
 * - Bekleyen HITL soruları listesi
 * - Her soru için cevap formu (AdminQuestionCard)
 * - Knowledge base dosyaları listesi
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { ShieldCheck, Lock, RefreshCw, Database, AlertTriangle } from 'lucide-react-native';

import AdminQuestionCard from '../components/AdminQuestionCard';
import RadarBackground from '../components/RadarBackground';
import { getPendingQuestions, answerQuestion, HitlItem } from '../services/hitlService';
import { listKnowledgeFiles } from '../services/knowledgeService';
import { ADMIN_PIN } from '../constants/config';

export default function AdminScreen() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [pendingItems, setPendingItems] = useState<HitlItem[]>([]);
  const [knowledgeFiles, setKnowledgeFiles] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [pending, files] = await Promise.all([
        getPendingQuestions(),
        listKnowledgeFiles(),
      ]);
      setPendingItems(pending);
      setKnowledgeFiles(files);
    } catch (err) {
      console.error('Admin veri yükleme hatası:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleAnswer = async (id: string, answer: string, topic: string) => {
    await answerQuestion(id, answer, topic);
    // Cevaplanmış soruyu listeden kaldır
    setPendingItems(prev => prev.filter(i => i.id !== id));
    // Knowledge dosyalarını güncelle
    const files = await listKnowledgeFiles();
    setKnowledgeFiles(files);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // --- PIN Ekranı ---
  if (!authenticated) {
    return (
      <View style={styles.pinContainer}>
        <RadarBackground />
        <View style={styles.pinCard}>
          <Lock color="#FF003C" size={40} />
          <Text style={styles.pinTitle}>ADMIN PANELİ</Text>
          <Text style={styles.pinSubtitle}>Yetkili erişim gereklidir</Text>

          <TextInput
            style={[styles.pinInput, pinError && styles.pinInputError]}
            placeholder="PIN giriniz"
            placeholderTextColor="#444"
            value={pinInput}
            onChangeText={t => { setPinInput(t); setPinError(false); }}
            keyboardType="numeric"
            maxLength={6}
            secureTextEntry
            textAlign="center"
            autoFocus
          />

          {pinError && (
            <View style={styles.errorRow}>
              <AlertTriangle color="#FF003C" size={14} />
              <Text style={styles.errorText}>Hatalı PIN</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.pinBtn, pinInput.length < 4 && styles.pinBtnDisabled]}
            onPress={handlePinSubmit}
            disabled={pinInput.length < 4}
          >
            <Text style={styles.pinBtnText}>GİRİŞ YAP</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Admin Paneli ---
  return (
    <View style={styles.container}>
      <RadarBackground />

      {/* Header */}
      <View style={styles.header}>
        <ShieldCheck color="#00FF41" size={22} />
        <Text style={styles.headerTitle}>ADMIN PANELİ</Text>
        <TouchableOpacity onPress={loadData} style={styles.refreshBtn}>
          <RefreshCw color="#555" size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00E5FF"
          />
        }
      >
        {/* Bekleyen Sorular */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              ⏳ BEKLEYEN SORULAR
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingItems.length}</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator color="#00E5FF" style={{ marginTop: 20 }} />
          ) : pendingItems.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>✅ Tüm sorular cevaplandı</Text>
            </View>
          ) : (
            pendingItems.map(item => (
              <AdminQuestionCard
                key={item.id}
                item={item}
                onAnswer={handleAnswer}
              />
            ))
          )}
        </View>

        {/* Knowledge Base Durumu */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database color="#A78BFA" size={18} />
            <Text style={[styles.sectionTitle, { color: '#A78BFA' }]}>
              HAFIZA DOSYALARI
            </Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(167, 139, 250, 0.2)' }]}>
              <Text style={[styles.badgeText, { color: '#A78BFA' }]}>{knowledgeFiles.length}</Text>
            </View>
          </View>

          {knowledgeFiles.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                📭 Henüz hafıza dosyası yok. İlk soruyu cevaplayınca oluşacak.
              </Text>
            </View>
          ) : (
            <View style={styles.fileList}>
              {knowledgeFiles.map(f => (
                <View key={f} style={styles.fileItem}>
                  <Text style={styles.fileIcon}>📄</Text>
                  <Text style={styles.fileName}>{f}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // PIN ekranı
  pinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  pinCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderWidth: 1,
    borderColor: '#FF003C',
    borderRadius: 24,
    padding: 32,
    width: '80%',
    alignItems: 'center',
    gap: 12,
  },
  pinTitle: {
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 8,
  },
  pinSubtitle: {
    color: '#555',
    fontFamily: 'monospace',
    fontSize: 13,
    marginBottom: 8,
  },
  pinInput: {
    width: '100%',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 24,
    letterSpacing: 8,
    padding: 14,
  },
  pinInputError: {
    borderColor: '#FF003C',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    color: '#FF003C',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  pinBtn: {
    backgroundColor: '#FF003C',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  pinBtnDisabled: {
    backgroundColor: 'rgba(255, 0, 60, 0.2)',
  },
  pinBtnText: {
    color: '#fff',
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 2,
  },
  // Panel
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    zIndex: 10,
  },
  headerTitle: {
    color: '#00FF41',
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    flex: 1,
  },
  refreshBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#FF9800',
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#FF9800',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyBox: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#555',
    fontFamily: 'monospace',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  fileList: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    padding: 12,
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  fileIcon: {
    fontSize: 16,
  },
  fileName: {
    color: '#A78BFA',
    fontFamily: 'monospace',
    fontSize: 13,
  },
});
