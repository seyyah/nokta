import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Share, Alert, Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

const SLOP_COLORS = {
  low: '#ff6b6b',    // 0-3: çok jenerik
  mid: '#ffd93d',    // 4-6: orta
  high: '#6bcb77',   // 7-10: özgün
};

function getSlopColor(score) {
  if (score <= 3) return SLOP_COLORS.low;
  if (score <= 6) return SLOP_COLORS.mid;
  return SLOP_COLORS.high;
}

function getSlopLabel(score) {
  if (score <= 3) return 'Klişe';
  if (score <= 5) return 'Orta';
  if (score <= 7) return 'İyi';
  return 'Özgün';
}

export default function ResultScreen({ resultData, onReset }) {
  const { perfectPrompt, slopScore, slopReason, originalityTip } = resultData;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();
  }, []);

  const slopColor = getSlopColor(slopScore);
  const slopLabel = getSlopLabel(slopScore);

  const handleCopyPrompt = async () => {
    await Clipboard.setStringAsync(perfectPrompt);
    Alert.alert('✅ Kopyalandı!', 'Mükemmel prompt panoya kopyalandı.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `✨ Prompt Perfecter ile oluşturuldu:\n\n${perfectPrompt}\n\nOrijinallik Skoru: ${slopScore}/10`,
      });
    } catch (e) { /* ignore */ }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar / Back button */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onReset} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Geri</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🎉</Text>
          <Text style={styles.headerTitle}>Mükemmel Prompt Hazır!</Text>
          <Text style={styles.headerSub}>Ham fikrin dönüştürüldü</Text>
        </View>

        {/* Slop Score */}
        <View style={[styles.slopCard, { borderColor: slopColor + '44' }]}>
          <View style={styles.slopHeader}>
            <Text style={styles.slopTitle}>Özgünlük Skoru</Text>
            <View style={[styles.slopBadge, { backgroundColor: slopColor + '22' }]}>
              <Text style={[styles.slopBadgeText, { color: slopColor }]}>
                {slopLabel}
              </Text>
            </View>
          </View>
          {/* Score bar */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreFill,
                  { width: `${slopScore * 10}%`, backgroundColor: slopColor },
                ]}
              />
            </View>
            <Text style={[styles.scoreNumber, { color: slopColor }]}>{slopScore}/10</Text>
          </View>
          <Text style={styles.slopReason}>{slopReason}</Text>
          {originalityTip && (
            <View style={styles.tipBox}>
              <Text style={styles.tipLabel}>💡 Öneri</Text>
              <Text style={styles.tipText}>{originalityTip}</Text>
            </View>
          )}
        </View>

        {/* Perfect Prompt */}
        <View style={styles.promptCard}>
          <View style={styles.promptHeader}>
            <Text style={styles.promptTitle}>✨ Mükemmel Prompt</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyPrompt}>
              <Text style={styles.copyBtnText}>📋 Kopyala</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.promptText}>{perfectPrompt}</Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
          <Text style={styles.shareBtnText}>🔗  Paylaş</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.85}>
          <Text style={styles.resetBtnText}>← Yeni Fikir Dene</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Prompt Perfecter · Track A · Nokta 2025
        </Text>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0a1a' },
  container: { padding: 24, paddingBottom: 48 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 35,
  },
  backBtn: { padding: 4 },
  backBtnText: { color: '#888', fontSize: 15 },

  header: { alignItems: 'center', marginBottom: 28, paddingTop: 0 },
  headerEmoji: { fontSize: 52, marginBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { color: '#666', fontSize: 14, marginTop: 4 },

  imageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#6c47ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  image: { width: '100%', height: 240 },
  saveImageBtn: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    alignItems: 'center',
  },
  saveImageText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  noImageCard: {
    backgroundColor: '#12121f',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e1e3a',
    borderStyle: 'dashed',
  },
  noImageText: { color: '#555', fontSize: 14, textAlign: 'center' },

  slopCard: {
    backgroundColor: '#12121f',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  slopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  slopTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  slopBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  slopBadgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: { height: '100%', borderRadius: 4 },
  scoreNumber: { fontSize: 20, fontWeight: '800', width: 40, textAlign: 'right' },
  slopReason: { color: '#888', fontSize: 14, lineHeight: 20 },
  tipBox: {
    backgroundColor: '#0a0a1a',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#6c47ff33',
  },
  tipLabel: { color: '#9d7fff', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  tipText: { color: '#aaa', fontSize: 13, lineHeight: 18 },

  promptCard: {
    backgroundColor: '#12121f',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e1e3a',
    marginBottom: 16,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  promptTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  copyBtn: {
    backgroundColor: '#6c47ff22',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#6c47ff44',
  },
  copyBtnText: { color: '#9d7fff', fontSize: 13, fontWeight: '600' },
  promptText: { color: '#ccc', fontSize: 15, lineHeight: 24 },

  shareBtn: {
    backgroundColor: '#1a2240',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a4480',
  },
  shareBtnText: { color: '#6b9fff', fontSize: 16, fontWeight: '700' },

  resetBtn: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  resetBtnText: { color: '#666', fontSize: 15, fontWeight: '600' },

  footer: {
    textAlign: 'center',
    color: '#333',
    fontSize: 12,
  },
});
