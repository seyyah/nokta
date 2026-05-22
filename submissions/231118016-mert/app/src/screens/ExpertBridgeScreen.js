import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';

// Jitsi ile ücretsiz, kurulum gerektirmeyen WebRTC görüşme
// Belirli bir oda adı oluştur → linki sınıf arkadaşına gönder
const ROOM_NAME = 'nokta-231118016-expert-bridge';
const JITSI_URL = `https://meet.jit.si/${ROOM_NAME}`;

export default function ExpertBridgeScreen({ failCount = 0 }) {
  const isStuck = failCount >= 2;

  const openCall = async () => {
    const supported = await Linking.canOpenURL(JITSI_URL);
    if (supported) {
      await Linking.openURL(JITSI_URL);
    }
  };

  return (
    <View style={styles.container}>
      {/* Status */}
      <View style={[styles.statusBadge, isStuck ? styles.statusDanger : styles.statusOk]}>
        <Text style={styles.statusText}>
          {isStuck ? '🔴 STUCK TESPİT EDİLDİ' : '🟢 Normal — Forge döngüsü aktif'}
        </Text>
      </View>

      <Text style={styles.title}>📞 Uzman Köprüsü</Text>
      <Text style={styles.subtitle}>
        {isStuck
          ? '2 üst üste FAIL/ROLLBACK tespit edildi.\nUzmana bağlanmak için butona dokun.'
          : 'Forge döngüsü STUCK olursa\notomatik olarak bu ekrana yönlendirilirsin.'}
      </Text>

      {/* Expert Call Button */}
      <TouchableOpacity
        style={[styles.callBtn, !isStuck && styles.callBtnDisabled]}
        onPress={isStuck ? openCall : null}
        activeOpacity={isStuck ? 0.8 : 1}
      >
        <Text style={styles.callBtnText}>
          {isStuck ? '📹 Uzmana Bağlan' : '⏳ Bekleniyor...'}
        </Text>
      </TouchableOpacity>

      {/* Room Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Oda Adı:</Text>
        <Text style={styles.infoValue}>{ROOM_NAME}</Text>
        <Text style={styles.infoLabel}>Platform:</Text>
        <Text style={styles.infoValue}>Jitsi Meet (ücretsiz)</Text>
        <Text style={styles.infoHint}>
          Aynı linki sınıf arkadaşınla paylaş → ekran paylaşımı + ses + video hazır
        </Text>
      </View>

      {/* Trigger Info */}
      <View style={styles.triggerBox}>
        <Text style={styles.triggerTitle}>Tetiklenme Koşulu</Text>
        <Text style={styles.triggerText}>
          Forge döngüsünde 2 ardışık FAIL veya ROLLBACK → Expert Bridge otomatik açılır
        </Text>
        <Text style={styles.triggerCounter}>
          Mevcut FAIL sayısı: <Text style={{ color: failCount >= 2 ? '#ef4444' : '#22c55e' }}>{failCount}/2</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statusOk: { backgroundColor: '#052e16' },
  statusDanger: { backgroundColor: '#450a0a' },
  statusText: { color: '#f8fafc', fontSize: 13, fontWeight: '600' },
  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  callBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  callBtnDisabled: {
    backgroundColor: '#1e293b',
  },
  callBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    gap: 4,
  },
  infoLabel: { color: '#64748b', fontSize: 12 },
  infoValue: { color: '#f8fafc', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  infoHint: { color: '#94a3b8', fontSize: 12, marginTop: 8, lineHeight: 18 },
  triggerBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  triggerTitle: { color: '#f59e0b', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  triggerText: { color: '#94a3b8', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  triggerCounter: { color: '#f8fafc', fontSize: 14, fontWeight: '600' },
});
