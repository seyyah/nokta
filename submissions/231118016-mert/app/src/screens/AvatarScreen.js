import React, { Suspense, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';

// 3D Kütüphaneleri (sadece web/gl desteklenen ortamda çalışır)
let Canvas;
try {
  const r3f = require('@react-three/fiber');
  Canvas = r3f.Canvas;
} catch (e) {
  console.warn('react-three-fiber yüklenemedi:', e.message);
}

function AvatarModel({ url, speaking }) {
  if (!Canvas) return null;
  
  const { useLoader } = require('@react-three/fiber');
  const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader');
  
  // GLB Modelini Yükle
  const gltf = useLoader(GLTFLoader, url);
  const scene = gltf.scene;
  const ref = useRef();

  useEffect(() => {
    if (!ref.current || !scene) return;
    
    // Viseme / Lipsync Simülasyonu
    const interval = setInterval(() => {
      scene.traverse((node) => {
        if (node.isMesh && node.morphTargetDictionary && node.morphTargetInfluences) {
          const jawOpen = node.morphTargetDictionary['jawOpen'] ?? node.morphTargetDictionary['mouthOpen'];
          if (jawOpen !== undefined) {
            // Konuşurken çeneyi rastgele oynat
            node.morphTargetInfluences[jawOpen] = speaking ? 0.15 + Math.random() * 0.4 : 0;
          }
        }
      });
    }, 80);
    
    return () => clearInterval(interval);
  }, [speaking, scene]);

  // Modelin boyutu ve konumunu ayarla
  return <primitive ref={ref} object={scene} scale={2.5} position={[0, -2.5, 0]} />;
}

export default function AvatarScreen() {
  const [speaking, setSpeaking] = useState(false);
  const [modelUri, setModelUri] = useState(null);

  // Asset yükleyici - GLB dosyasının URI'sini çözer
  useEffect(() => {
    async function loadAsset() {
      try {
        const asset = Asset.fromModule(require('../../../assets/avatar.glb'));
        await asset.downloadAsync();
        setModelUri(asset.localUri || asset.uri);
      } catch (e) {
        console.error("Avatar GLB yüklenemedi:", e);
      }
    }
    loadAsset();
  }, []);

  const handleSpeakToggle = () => {
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    } else {
      if ('speechSynthesis' in window) {
        const text = "Merhaba! Ben senin kişisel yapay zeka uzmanıyım. Fikrini analiz etmeye ve geliştirmeye hazırım!";
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.pitch = 1.1;
        utterance.rate = 0.95;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback for non-web or unsupported browsers
        setSpeaking(true);
        setTimeout(() => setSpeaking(false), 5000);
      }
    }
  };

  if (!Canvas) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>⚠️ 3D Desteklenmiyor</Text>
        <Text style={styles.fallbackText}>Lütfen projeyi web'de çalıştırın (npx expo start --web)</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🪞 3D Avatar Uzmanı</Text>
      <Text style={styles.subtitle}>
        {speaking ? '🔊 Konuşuyor...' : 'Sessiz'}
      </Text>

      <View style={styles.canvasContainer}>
        {modelUri ? (
          <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[2, 5, 5]} intensity={2.5} />
            <pointLight position={[-2, 2, 2]} intensity={1} />
            
            <Suspense fallback={null}>
              <AvatarModel url={modelUri} speaking={speaking} />
            </Suspense>
          </Canvas>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Avatar Yükleniyor...</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.speakBtn, speaking && styles.speakBtnActive]}
        onPress={handleSpeakToggle}
        activeOpacity={0.8}
        disabled={!modelUri}
      >
        <Text style={styles.speakBtnText}>
          {speaking ? '⏹ Konuşmayı Durdur' : '🎙️ Bana Kendini Tanıt'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.hint}>Avatar Web Speech API ile senkronize çalışır</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center' },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '700', marginTop: 40, marginBottom: 8 },
  subtitle: { color: '#64748b', fontSize: 14, marginBottom: 20 },
  canvasContainer: { flex: 1, width: '100%', maxHeight: 450, backgroundColor: '#1e293b', borderRadius: 16, overflow: 'hidden' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94a3b8', marginTop: 12 },
  speakBtn: { backgroundColor: '#3b82f6', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 16, marginTop: 24, marginBottom: 12 },
  speakBtnActive: { backgroundColor: '#ef4444' },
  speakBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hint: { color: '#64748b', fontSize: 12 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  fallbackTitle: { color: '#ef4444', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  fallbackText: { color: '#94a3b8' }
});
