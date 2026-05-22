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
      // Step 1: Capture Full Screen (Reliable on all devices)
      const fullUri = await captureRef(globalViewRef, {
        format: 'jpg',
        quality: 1,
      });

      // Step 2: Crop the image manually using selection box coordinates
      // We must multiply coordinates by PixelRatio because captureRef works on pixels
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
      console.error('Capture/Crop failed', error);
      Alert.alert('Hata', 'Alan yakalanamadı. Lütfen tam ekran yakalamayı deneyin.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Uyarı', 'Lütfen önerinizi yazın.');
      return;
    }

    try {
      const newFeedback = {
        id: Date.now().toString(),
        text: feedbackText,
        date: new Date().toLocaleString('tr-TR'),
        image: capturedImage,
      };

      const existingData = await AsyncStorage.getItem('user_feedbacks');
      const feedbacks = existingData ? JSON.parse(existingData) : [];
      feedbacks.unshift(newFeedback);
      await AsyncStorage.setItem('user_feedbacks', JSON.stringify(feedbacks));
      
      setFeedbackText('');
      setCapturedImage(null);
      setShowFeedbackModal(false);
      Alert.alert('Başarılı', 'Öneriniz iletildi, teşekkürler!');
    } catch (error) {
      Alert.alert('Hata', 'Kaydedilemedi.');
    }
  };

  const increaseSize = () => {
    setBoxSize(prev => ({ 
      width: Math.min(350, prev.width + 30), 
      height: Math.min(500, prev.height + 20) 
    }));
  };

  const decreaseSize = () => {
    setBoxSize(prev => ({ 
      width: Math.max(100, prev.width - 30), 
      height: Math.max(80, prev.height - 20) 
    }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <View ref={globalViewRef} style={{ flex: 1 }} collapsable={false}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0F172A',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
              height: Platform.OS === 'ios' ? 85 : 65,
              paddingBottom: Platform.OS === 'ios' ? 30 : 10,
            },
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: '#64748B',
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Anasayfa', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />) }} />
          <Tabs.Screen name="tickets" options={{ title: 'Biletlerim', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'ticket' : 'ticket-outline'} size={24} color={color} />) }} />
          <Tabs.Screen name="feedbacks" options={{ title: 'Tasarım Düzeltmeler', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'color-palette' : 'color-palette-outline'} size={24} color={color} />) }} />
          <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />) }} />
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
              setBoxPos({ 
                x: Math.max(0, pageX - boxSize.width / 2), 
                y: Math.max(0, pageY - boxSize.height / 2) 
              });
            }}
          >
            <View style={styles.boxCornerTL} />
            <View style={styles.boxCornerTR} />
            <View style={styles.boxCornerBL} />
            <View style={styles.boxCornerBR} />
            
            <TouchableOpacity style={styles.captureActionBtn} onPress={handleCapture} activeOpacity={0.8}>
              <Ionicons name="camera" size={24} color="#FFF" />
              <Text style={styles.captureActionText}>{isCapturing ? "İŞLENİYOR..." : "YAKALA"}</Text>
            </TouchableOpacity>

            <View style={styles.resizeControls}>
              <TouchableOpacity style={styles.resizeBtn} onPress={decreaseSize}>
                <Ionicons name="remove-circle" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.resizeBtn} onPress={increaseSize}>
                <Ionicons name="add-circle" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.designHintContainer}>
            <Text style={styles.designHintText}>Çerçeveyi sürükleyin ve boyutu ayarlayıp yakalayın</Text>
          </View>
        </View>
      )}

      {/* FAB */}
      {!showFeedbackModal && (
        <TouchableOpacity 
          style={[styles.fab, isDesignMode && { backgroundColor: '#EF4444' }]}
          onPress={() => setIsDesignMode(!isDesignMode)}
        >
          <Ionicons name={isDesignMode ? "close" : "scan"} size={20} color="#FFF" />
          <Text style={styles.fabText}>{isDesignMode ? "KAPAT" : "TASARIM DÜZELT"}</Text>
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
  captureActionBtn: { backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 30, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  captureActionText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  resizeControls: { position: 'absolute', bottom: -50, flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 25, padding: 8, gap: 20, borderWidth: 2, borderColor: '#3B82F6' },
  resizeBtn: { padding: 5 },
  designHintContainer: { position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 30, elevation: 5 },
  designHintText: { color: '#FFF', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 70, right: 20, backgroundColor: '#3B82F6', paddingHorizontal: 25, height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 15, zIndex: 10000 },
  fabText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBlur: { borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  modalContent: { backgroundColor: '#1E293B', padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  previewContainer: { width: '100%', height: 240, backgroundColor: '#0F172A', borderRadius: 24, marginBottom: 25, overflow: 'hidden', borderWidth: 2, borderColor: '#3B82F6' },
  previewImage: { width: '100%', height: '100%' },
  feedbackInput: { backgroundColor: '#334155', borderRadius: 24, padding: 20, color: '#FFF', fontSize: 17, height: 130, textAlignVertical: 'top', marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  saveBtn: { backgroundColor: '#3B82F6', height: 65, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  saveBtnText: { color: '#FFF', fontSize: 20, fontWeight: '900' }
});
