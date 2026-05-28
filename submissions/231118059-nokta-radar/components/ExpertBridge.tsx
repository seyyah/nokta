/**
 * ExpertBridge.tsx
 * "Uzmana Bağlan" köprüsü.
 * Jitsi Meet URL'ini expo-web-browser ile açar.
 * Ekran paylaşımı + ses + video — Jitsi Meet uygulaması üzerinden çalışır.
 *
 * STUCK tetiklendiğinde otomatik veya manüel açılabilir.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Video, PhoneCall, X, AlertTriangle, ExternalLink } from 'lucide-react-native';
import { forgeMonitor } from '../services/forgeMonitor';

const JITSI_ROOM_BASE = 'https://meet.jit.si/nokta-radar-expert-';

interface Props {
  cycleId?: string;
  onBridgeStarted?: (roomUrl: string) => void;
  onBridgeEnded?: () => void;
  style?: any;
}

export default function ExpertBridge({
  cycleId,
  onBridgeStarted,
  onBridgeEnded,
  style,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isStuck, setIsStuck] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  // Pulse animasyonu
  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, glowAnim]);

  // STUCK dedektörü dinle
  useEffect(() => {
    const unsub = forgeMonitor.onStuck(() => {
      setIsStuck(true);
      startPulse();
    });
    setIsStuck(forgeMonitor.isCurrentlyStuck());
    return unsub;
  }, [startPulse]);

  const openModal = () => {
    // Otomatik oda kodu oluştur
    const auto = `${Date.now().toString(36)}`;
    setRoomCode(cycleId ? `${cycleId}-${auto}` : auto);
    setModalVisible(true);
  };

  const openJitsi = async () => {
    const room = roomCode.trim() || `nokta-${Date.now().toString(36)}`;
    const url = `${JITSI_ROOM_BASE}${room}`;

    setModalVisible(false);
    onBridgeStarted?.(url);

    try {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        createTask: true, // Android: yeni görev olarak aç
      });
      // Browser kapandıktan sonra
      onBridgeEnded?.();
      forgeMonitor.resolveStuck();
      setIsStuck(false);
    } catch (err: any) {
      Alert.alert(
        'Jitsi Açılamadı',
        `Tarayıcı hatası: ${err?.message || 'Bilinmeyen hata'}\n\nURL: ${url}`,
        [
          { text: 'Tamam' },
        ]
      );
    }
  };

  const consecutiveFails = forgeMonitor.getConsecutiveFailures();

  return (
    <View style={[styles.container, style]}>

      {/* STUCK Uyarı Banner */}
      {isStuck && (
        <Animated.View
          style={[
            styles.stuckBanner,
            { opacity: glowAnim },
          ]}
        >
          <AlertTriangle color="#FF6B00" size={16} />
          <Text style={styles.stuckBannerText}>
            🔴 STUCK — {consecutiveFails} ardışık başarısız cycle
          </Text>
        </Animated.View>
      )}

      {/* Ana Buton */}
      <Animated.View style={{ transform: [{ scale: isStuck ? pulseAnim : 1 }] }}>
        <TouchableOpacity
          style={[
            styles.bridgeButton,
            isStuck && styles.bridgeButtonStuck,
          ]}
          onPress={openModal}
          activeOpacity={0.8}
        >
          <Video
            color={isStuck ? '#FF6B00' : '#00E5FF'}
            size={20}
          />
          <Text style={[
            styles.bridgeButtonText,
            isStuck && styles.bridgeButtonTextStuck,
          ]}>
            {isStuck ? '🆘 Uzmana Bağlan' : 'Uzmana Bağlan'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Bağlantı Modalı */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Başlık */}
            <View style={styles.modalHeader}>
              <PhoneCall color="#00E5FF" size={24} />
              <Text style={styles.modalTitle}>Uzman Görüşmesi</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X color="#666" size={20} />
              </TouchableOpacity>
            </View>

            {/* Açıklama */}
            <Text style={styles.modalDesc}>
              Jitsi Meet ile şifreli görüntülü görüşme açılacak.{'\n'}
              Ekran paylaşımı + ses + video desteklenir.
            </Text>

            {/* STUCK bilgisi */}
            {isStuck && (
              <View style={styles.stuckInfo}>
                <Text style={styles.stuckInfoText}>
                  ⚠️ Forge döngüsü {consecutiveFails} cycle üst üste başarısız oldu.
                  {'\n'}Uzman müdahalesi önerilir.
                </Text>
              </View>
            )}

            {/* Oda kodu */}
            <Text style={styles.inputLabel}>Görüşme Oda Kodu</Text>
            <TextInput
              style={styles.roomInput}
              value={roomCode}
              onChangeText={setRoomCode}
              placeholder="oda-kodu"
              placeholderTextColor="#444"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.urlPreview}>
              🔗 meet.jit.si/nokta-radar-expert-{roomCode || '...'}
            </Text>

            {/* Butonlar */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.connectBtn}
                onPress={openJitsi}
              >
                <ExternalLink color="#000" size={16} />
                <Text style={styles.connectBtnText}>Görüşmeyi Aç</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFooter}>
              Görüşme bittikten sonra geri dönün — STUCK durumu sıfırlanacak.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  stuckBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stuckBannerText: {
    color: '#FF6B00',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  bridgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bridgeButtonStuck: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderColor: 'rgba(255, 107, 0, 0.5)',
  },
  bridgeButtonText: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bridgeButtonTextStuck: {
    color: '#FF6B00',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0d0d18',
    borderWidth: 1,
    borderColor: '#1a1a3a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    flex: 1,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalDesc: {
    color: '#888',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  stuckInfo: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  stuckInfoText: {
    color: '#FF9944',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  inputLabel: {
    color: '#555',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  roomInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a4a',
    borderRadius: 10,
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  urlPreview: {
    color: '#334',
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: -8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  connectBtn: {
    flex: 2,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#00E5FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBtnText: {
    color: '#000',
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalFooter: {
    color: '#333',
    fontFamily: 'monospace',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
