import React, { useState, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Image, Alert, PixelRatio } from 'react-native';
import { BlurView } from 'expo-blur';
import { captureRef } from 'react-native-view-shot';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  // Global Design Mode states
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const globalViewRef = useRef<View>(null);

  // Box Selection states
  const [boxPos, setBoxPos] = useState({ x: 50, y: 150 });
  const [boxSize, setBoxSize] = useState({ width: 250, height: 150 });

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const fullUri = await captureRef(globalViewRef, { format: 'jpg', quality: 1 });
      const scale = PixelRatio.get();
      const cropRect = {
        originX: Math.max(0, boxPos.x * scale),
        originY: Math.max(0, boxPos.y * scale),
        width: boxSize.width * scale,
        height: boxSize.height * scale,
      };
      const croppedResult = await ImageManipulator.manipulateAsync(
        fullUri,
        [{ crop: cropRect }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCapturedImage(croppedResult.uri);
      setShowFeedbackModal(true);
      setIsDesignMode(false);
    } catch (error) {
      Alert.alert('Hata', 'Alan yakalanamadı.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!feedbackText.trim()) { Alert.alert('Uyarı', 'Lütfen önerinizi yazın.'); return; }
    try {
      const newFeedback = { id: Date.now().toString(), text: feedbackText, date: new Date().toLocaleString('tr-TR'), image: capturedImage };
      const existingData = await AsyncStorage.getItem('user_feedbacks');
      const feedbacks = existingData ? JSON.parse(existingData) : [];
      feedbacks.unshift(newFeedback);
      await AsyncStorage.setItem('user_feedbacks', JSON.stringify(feedbacks));
      setFeedbackText(''); setCapturedImage(null); setShowFeedbackModal(false);
      Alert.alert('Başarılı', 'Öneriniz iletildi!');
    } catch { Alert.alert('Hata', 'Kaydedilemedi.'); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <View ref={globalViewRef} style={{ flex: 1 }} collapsable={false}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#080B14',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.08)',
              height: Platform.OS === 'ios' ? 88 : 68,
              paddingBottom: Platform.OS === 'ios' ? 30 : 10,
            },
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: '#475569',
            tabBarLabelStyle: { fontSize: 9, fontWeight: '700', marginTop: 2 },
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Anasayfa', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'home' : 'home-outline'} size={21} color={color} />) }} />
          <Tabs.Screen name="tickets" options={{ title: 'Biletler', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'ticket' : 'ticket-outline'} size={21} color={color} />) }} />
          <Tabs.Screen name="voice" options={{
            title: 'Ses',
            tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'mic' : 'mic-outline'} size={21} color={color} />),
            tabBarActiveTintColor: '#8B5CF6',
          }} />
          <Tabs.Screen name="avatar" options={{
            title: 'Avatar',
            tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={21} color={color} />),
            tabBarActiveTintColor: '#EC4899',
          }} />
          <Tabs.Screen name="forge" options={{
            title: 'Forge',
            tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'flash' : 'flash-outline'} size={21} color={color} />),
            tabBarActiveTintColor: '#F59E0B',
          }} />
          <Tabs.Screen name="feedbacks" options={{ title: 'Audit', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'color-palette' : 'color-palette-outline'} size={21} color={color} />) }} />
          <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'person' : 'person-outline'} size={21} color={color} />) }} />
        </Tabs>
      </View>

      {/* DRAGGABLE & RESIZABLE SELECTION BOX */}
      {isDesignMode && (
        <View style={styles.designOverlay}>
          <View
            style={[styles.targetBox, { left: boxPos.x, top: boxPos.y, width: boxSize.width, height: boxSize.height }]}
            onStartShouldSetResponder={() => true}
            onResponderMove={(evt) => {
              const { pageX, pageY } = evt.nativeEvent;
              setBoxPos({ x: Math.max(0, pageX - boxSize.width / 2), y: Math.max(0, pageY - boxSize.height / 2) });
            }}
          >
            <View style={styles.boxCornerTL} /><View style={styles.boxCornerTR} />
            <View style={styles.boxCornerBL} /><View style={styles.boxCornerBR} />
            <TouchableOpacity style={styles.captureActionBtn} onPress={handleCapture} activeOpacity={0.8}>
              <Ionicons name="camera" size={22} color="#FFF" />
              <Text style={styles.captureActionText}>{isCapturing ? "İŞLENİYOR..." : "YAKALA"}</Text>
            </TouchableOpacity>
            <View style={styles.resizeControls}>
              <TouchableOpacity style={styles.resizeBtn} onPress={() => setBoxSize(p => ({ width: Math.max(100, p.width-30), height: Math.max(80, p.height-20) }))}>
                <Ionicons name="remove-circle" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.resizeBtn} onPress={() => setBoxSize(p => ({ width: Math.min(350, p.width+30), height: Math.min(500, p.height+20) }))}>
                <Ionicons name="add-circle" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.designHintContainer}>
            <Text style={styles.designHintText}>Çerçeveyi sürükle · boyutu ayarla · yakala</Text>
          </View>
        </View>
      )}

      {/* FAB - Audit Widget */}
      {!showFeedbackModal && (
        <TouchableOpacity
          style={[styles.fab, isDesignMode && { backgroundColor: '#EF4444' }]}
          onPress={() => setIsDesignMode(!isDesignMode)}
        >
          <Ionicons name={isDesignMode ? "close" : "scan-circle"} size={20} color="#FFF" />
          <Text style={styles.fabText}>{isDesignMode ? "KAPAT" : "AUDİT"}</Text>
        </TouchableOpacity>
      )}

      {/* FEEDBACK MODAL */}
      <Modal visible={showFeedbackModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tasarım Geri Bildirimi</Text>
                <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <View style={styles.previewContainer}>
                {capturedImage && <Image source={{ uri: capturedImage }} style={styles.previewImage} resizeMode="contain" />}
              </View>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Önerinizi buraya yazın..."
                placeholderTextColor="#64748B"
                multiline
                value={feedbackText}
                onChangeText={setFeedbackText}
                autoFocus
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveFeedback}>
                <Text style={styles.saveBtnText}>Geri Bildirimi Kaydet</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  designOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 },
  targetBox: { position: 'absolute', borderWidth: 2, borderColor: '#3B82F6', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  boxCornerTL: { position: 'absolute', top: -4, left: -4, width: 24, height: 24, borderTopWidth: 5, borderLeftWidth: 5, borderColor: '#3B82F6' },
  boxCornerTR: { position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderTopWidth: 5, borderRightWidth: 5, borderColor: '#3B82F6' },
  boxCornerBL: { position: 'absolute', bottom: -4, left: -4, width: 24, height: 24, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: '#3B82F6' },
  boxCornerBR: { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderBottomWidth: 5, borderRightWidth: 5, borderColor: '#3B82F6' },
  captureActionBtn: { backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 28, gap: 8, elevation: 8 },
  captureActionText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  resizeControls: { position: 'absolute', bottom: -50, flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 25, padding: 8, gap: 20, borderWidth: 2, borderColor: '#3B82F6' },
  resizeBtn: { padding: 5 },
  designHintContainer: { position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 28, elevation: 5 },
  designHintText: { color: '#FFF', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 75, right: 16, backgroundColor: '#3B82F6', paddingHorizontal: 16, height: 48, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 7, elevation: 15, zIndex: 10000 },
  fabText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBlur: { borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  modalContent: { backgroundColor: '#1E293B', padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  previewContainer: { width: '100%', height: 220, backgroundColor: '#0F172A', borderRadius: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#3B82F6' },
  previewImage: { width: '100%', height: '100%' },
  feedbackInput: { backgroundColor: '#334155', borderRadius: 20, padding: 18, color: '#FFF', fontSize: 16, height: 120, textAlignVertical: 'top', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  saveBtn: { backgroundColor: '#3B82F6', height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900' }
});
