import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Animated, Dimensions, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Persona definitions
const PERSONAS = [
  {
    id: 'junior',
    name: 'Junior Sen',
    color: '#3B82F6',
    accent: '#1D4ED8',
    tone: 'Samimi & Meraklı',
    description: 'Yeni başlayan, coşkulu, soru soran versiyon',
    voice: 'Heyecanlı, hızlı tempo, soru işaretleri çok',
    icon: '🎓',
    messages: [
      'Merhaba! Bu ekranda bir sorun fark ettim, sana anlatmak istiyorum.',
      'Hmm, kullanıcı deneyimi açısından bu akış biraz karışık değil mi?',
      'Acaba şu butonu daha belirgin yapabilir miyiz? Bence çok iyi olur!',
    ],
  },
  {
    id: 'senior',
    name: 'Senior Sen',
    color: '#F59E0B',
    accent: '#D97706',
    tone: 'Analitik & Doğrudan',
    description: 'Deneyimli, net, çözüm odaklı versiyon',
    voice: 'Sakin, otoriter, kısa ve öz cümleler',
    icon: '💼',
    messages: [
      'Bu akışta kritik bir UX sorunu tespit ettim. Hemen müdahale gerekiyor.',
      'Bilet onay süreci 3 adıma indirilebilir. Koltuk seçimi gereksiz modal açıyor.',
      'Renk kontrastı WCAG AA standardını karşılamıyor. Düzeltme zorunlu.',
    ],
  },
];

// Viseme sequence for mouth animation
const VISEME_SEQUENCE = [
  { shape: 'rest', duration: 100 },
  { shape: 'open', duration: 80 },
  { shape: 'mid', duration: 90 },
  { shape: 'open', duration: 70 },
  { shape: 'close', duration: 60 },
  { shape: 'mid', duration: 85 },
  { shape: 'open', duration: 75 },
  { shape: 'rest', duration: 100 },
];

// Three.js / WebGL avatar scene as an HTML string
function buildAvatarHTML(personaColor: string, isSpeaking: boolean, viseme: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #080B14; overflow: hidden; }
canvas { display: block; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
const canvas = document.getElementById('c');
const W = window.innerWidth, H = window.innerHeight;
canvas.width = W; canvas.height = H;
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

// If WebGL not available, use Canvas 2D fallback
const ctx2d = !gl ? canvas.getContext('2d') : null;

let speaking = ${isSpeaking};
let viseme = '${viseme}';
let t = 0;
const color = '${personaColor}';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return [r,g,b];
}

// 2D Canvas fallback avatar renderer
function draw2D() {
  const ctx = ctx2d;
  ctx.clearRect(0,0,W,H);
  
  // Background gradient
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H));
  bg.addColorStop(0, '#0F172A');
  bg.addColorStop(1, '#080B14');
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);
  
  // Ambient glow behind head
  const glow = ctx.createRadialGradient(W/2, H*0.42, 0, W/2, H*0.42, 120);
  glow.addColorStop(0, color + '44');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0,0,W,H);
  
  // Neck
  ctx.fillStyle = '#E8C9A0';
  ctx.beginPath();
  ctx.rect(W/2 - 32, H*0.62, 64, 80);
  ctx.fill();
  
  // Head (ellipse)
  ctx.fillStyle = '#F5D5A8';
  ctx.beginPath();
  ctx.ellipse(W/2, H*0.42, 115, 140, 0, 0, Math.PI*2);
  ctx.fill();
  
  // Face highlight
  const faceGrad = ctx.createRadialGradient(W/2-20, H*0.35, 0, W/2, H*0.42, 115);
  faceGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
  faceGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(W/2, H*0.42, 115, 140, 0, 0, Math.PI*2);
  ctx.fill();
  
  // Hair
  ctx.fillStyle = '#3D2B1F';
  ctx.beginPath();
  ctx.ellipse(W/2, H*0.3, 120, 85, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W/2, H*0.28, 125, 50, 0, Math.PI, 0);
  ctx.fill();
  // Hair strands
  for(let i=-3;i<=3;i++){
    ctx.beginPath();
    ctx.moveTo(W/2 + i*35, H*0.28);
    ctx.quadraticCurveTo(W/2 + i*38, H*0.24, W/2 + i*30, H*0.21);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3D2B1F';
    ctx.stroke();
  }
  
  // Eyebrows
  const browY = H*0.365;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#4A3728';
  // Left brow
  ctx.beginPath();
  ctx.moveTo(W/2 - 70, browY + (speaking ? -3*Math.sin(t*0.1) : 0));
  ctx.quadraticCurveTo(W/2 - 44, browY - 8 + (speaking ? -2*Math.sin(t*0.1) : 0), W/2 - 25, browY);
  ctx.stroke();
  // Right brow
  ctx.beginPath();
  ctx.moveTo(W/2 + 25, browY);
  ctx.quadraticCurveTo(W/2 + 44, browY - 8, W/2 + 70, browY + (speaking ? -3*Math.sin(t*0.1) : 0));
  ctx.stroke();
  
  // Eyes
  const eyeY = H*0.405;
  const blinkFactor = (Math.sin(t*0.03) > 0.95) ? 0.1 : 1;
  
  // Eye whites
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(W/2-50, eyeY, 28, 16*blinkFactor, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W/2+50, eyeY, 28, 16*blinkFactor, 0, 0, Math.PI*2);
  ctx.fill();
  
  // Irises
  const irisX = speaking ? Math.sin(t*0.05)*4 : 0;
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.ellipse(W/2-50+irisX, eyeY, 13, 13*blinkFactor, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath();
  ctx.ellipse(W/2+50+irisX, eyeY, 13, 13*blinkFactor, 0, 0, Math.PI*2);
  ctx.fill();
  
  // Pupils
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(W/2-50+irisX, eyeY, 7, 7*blinkFactor, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W/2+50+irisX, eyeY, 7, 7*blinkFactor, 0, 0, Math.PI*2);
  ctx.fill();
  
  // Eye shine
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.ellipse(W/2-45+irisX, eyeY-4, 4, 4*blinkFactor, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W/2+55+irisX, eyeY-4, 4, 4*blinkFactor, 0, 0, Math.PI*2);
  ctx.fill();
  
  // Nose
  ctx.strokeStyle = '#C8A882';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W/2, H*0.44);
  ctx.quadraticCurveTo(W/2+18, H*0.49, W/2+10, H*0.52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W/2, H*0.44);
  ctx.quadraticCurveTo(W/2-18, H*0.49, W/2-10, H*0.52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W/2-14, H*0.525);
  ctx.quadraticCurveTo(W/2, H*0.535, W/2+14, H*0.525);
  ctx.stroke();
  
  // Mouth — Viseme morphing
  const mouthY = H*0.565;
  const mouthOpenness = speaking 
    ? Math.abs(Math.sin(t * 0.18)) * 24 + 4
    : 2;
  const smileW = 52;
  
  // Lip outline
  ctx.fillStyle = '#C47A6E';
  ctx.beginPath();
  ctx.ellipse(W/2, mouthY, smileW, Math.max(3, mouthOpenness * 0.5), 0, 0, Math.PI*2);
  ctx.fill();
  
  // Upper lip
  ctx.fillStyle = '#D4887C';
  ctx.beginPath();
  ctx.moveTo(W/2 - smileW, mouthY);
  ctx.quadraticCurveTo(W/2 - 20, mouthY - 12, W/2, mouthY - 4);
  ctx.quadraticCurveTo(W/2 + 20, mouthY - 12, W/2 + smileW, mouthY);
  ctx.closePath();
  ctx.fill();
  
  // Mouth interior (opens when speaking)
  if(mouthOpenness > 4) {
    ctx.fillStyle = '#1A0A0A';
    ctx.beginPath();
    ctx.ellipse(W/2, mouthY + mouthOpenness*0.2, smileW*0.75, mouthOpenness, 0, 0, Math.PI*2);
    ctx.fill();
    // Teeth
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.ellipse(W/2, mouthY + 2, smileW*0.6, Math.min(8, mouthOpenness*0.45), 0, 0, Math.PI);
    ctx.fill();
  }
  
  // Lower lip
  ctx.fillStyle = '#C47A6E';
  ctx.beginPath();
  ctx.moveTo(W/2 - smileW, mouthY);
  ctx.quadraticCurveTo(W/2, mouthY + 16 + mouthOpenness*0.3, W/2 + smileW, mouthY);
  ctx.closePath();
  ctx.fill();
  
  // Cheek blush
  ctx.fillStyle = 'rgba(220, 140, 120, 0.2)';
  ctx.beginPath();
  ctx.ellipse(W/2-80, H*0.47, 30, 18, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W/2+80, H*0.47, 30, 18, 0, 0, Math.PI*2);
  ctx.fill();
  
  // Speaking indicator orbs
  if(speaking) {
    for(let j=0;j<3;j++){
      const orb = Math.abs(Math.sin(t*0.12 + j*2));
      ctx.fillStyle = color + Math.floor(orb*200).toString(16).padStart(2,'0');
      ctx.beginPath();
      ctx.arc(W/2 - 28 + j*28, H*0.72 + Math.sin(t*0.15+j)*8, 7+orb*5, 0, Math.PI*2);
      ctx.fill();
    }
  }
  
  // Persona color ring around face
  ctx.strokeStyle = color;
  ctx.lineWidth = speaking ? 3 + Math.sin(t*0.1)*2 : 1.5;
  ctx.globalAlpha = speaking ? 0.6 + Math.sin(t*0.08)*0.2 : 0.25;
  ctx.beginPath();
  ctx.ellipse(W/2, H*0.42, 122, 147, 0, 0, Math.PI*2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  t++;
  requestAnimationFrame(draw2D);
}

if(ctx2d) {
  draw2D();
}

// Receive messages from React Native
window.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.data);
    if(data.type === 'setSpeaking') speaking = data.value;
    if(data.type === 'setViseme') viseme = data.value;
    if(data.type === 'setPersona') color = data.color;
  } catch(_) {}
});
document.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.data);
    if(data.type === 'setSpeaking') speaking = data.value;
  } catch(_) {}
});
</script>
</body>
</html>`;
}

export default function AvatarScreen() {
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [customText, setCustomText] = useState('');
  const [viseme, setViseme] = useState('rest');

  const webViewRef = useRef<WebView>(null);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for speaking indicator
  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isSpeaking]);

  // Send speaking state to WebView
  const sendToWebView = (data: object) => {
    webViewRef.current?.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message', { data: '${JSON.stringify(data)}' })); true;`
    );
  };

  const startSpeaking = (text: string) => {
    setIsSpeaking(true);
    setCurrentMessage('');
    sendToWebView({ type: 'setSpeaking', value: true });
    sendToWebView({ type: 'setPersona', color: activePersona.color });

    // Animate text appearing char by char
    let i = 0;
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    charTimerRef.current = setInterval(() => {
      i++;
      setCurrentMessage(text.slice(0, i));
      if (i >= text.length) {
        if (charTimerRef.current) clearInterval(charTimerRef.current);
        // Stop speaking after message completes
        const stopDelay = Math.max(1500, text.length * 50);
        speakTimerRef.current = setTimeout(() => {
          setIsSpeaking(false);
          sendToWebView({ type: 'setSpeaking', value: false });
          Animated.timing(fadeAnim, { toValue: 0.7, duration: 500, useNativeDriver: true }).start();
        }, stopDelay);
      }
    }, 35);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      // Stop
      if (charTimerRef.current) clearInterval(charTimerRef.current);
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
      setIsSpeaking(false);
      sendToWebView({ type: 'setSpeaking', value: false });
      return;
    }
    const msg = activePersona.messages[messageIndex % activePersona.messages.length];
    setMessageIndex(i => i + 1);
    startSpeaking(msg);
  };

  const handleCustomSpeak = () => {
    if (!customText.trim()) return;
    setShowPersonaModal(false);
    setTimeout(() => startSpeaking(customText), 300);
    setCustomText('');
  };

  useEffect(() => {
    return () => {
      if (charTimerRef.current) clearInterval(charTimerRef.current);
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Avatar WebView */}
      <View style={styles.avatarContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: buildAvatarHTML(activePersona.color, false, 'rest') }}
          style={styles.webview}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
        />

        {/* Persona badge overlay */}
        <View style={[styles.personaOverlay, { borderColor: activePersona.color + '66' }]}>
          <Text style={styles.personaEmoji}>{activePersona.icon}</Text>
          <View>
            <Text style={[styles.personaName, { color: activePersona.color }]}>{activePersona.name}</Text>
            <Text style={styles.personaTone}>{activePersona.tone}</Text>
          </View>
          {isSpeaking && (
            <View style={[styles.speakingDot, { backgroundColor: activePersona.color }]} />
          )}
        </View>
      </View>

      {/* Speech Bubble */}
      {currentMessage ? (
        <Animated.View style={[styles.speechBubble, { opacity: fadeAnim, borderColor: activePersona.color + '55' }]}>
          <Text style={styles.speechText}>{currentMessage}</Text>
          {isSpeaking && <Text style={styles.cursor}>▋</Text>}
        </Animated.View>
      ) : null}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Persona Switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.personaRow}>
          {PERSONAS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.personaChip,
                activePersona.id === p.id && { borderColor: p.color, backgroundColor: p.color + '22' },
              ]}
              onPress={() => {
                setActivePersona(p);
                setCurrentMessage('');
                setMessageIndex(0);
                sendToWebView({ type: 'setPersona', color: p.color });
              }}
            >
              <Text style={styles.personaChipEmoji}>{p.icon}</Text>
              <Text style={[styles.personaChipText, activePersona.id === p.id && { color: p.color }]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.speakBtn, { backgroundColor: isSpeaking ? '#EF4444' : activePersona.color }]}
            onPress={handleSpeak}
            activeOpacity={0.85}
          >
            <Ionicons name={isSpeaking ? 'stop' : 'play'} size={20} color="#FFF" />
            <Text style={styles.speakBtnText}>{isSpeaking ? 'Durdur' : 'Konuştur'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.customBtn}
            onPress={() => setShowPersonaModal(true)}
          >
            <Ionicons name="create-outline" size={20} color="#94A3B8" />
            <Text style={styles.customBtnText}>Metin Yaz</Text>
          </TouchableOpacity>
        </View>

        {/* Info cards */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{activePersona.icon} {activePersona.name}</Text>
          <Text style={styles.infoDesc}>{activePersona.description}</Text>
          <Text style={styles.infoVoice}>🎙️ Ses tonu: {activePersona.voice}</Text>
        </View>
      </View>

      {/* Custom text modal */}
      <Modal visible={showPersonaModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Avatar'a Metin Ver</Text>
              <TouchableOpacity onPress={() => setShowPersonaModal(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>{activePersona.icon} {activePersona.name} bu metni seslendirecek</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Avatar'ın söyleyeceği metni yazın..."
              placeholderTextColor="#64748B"
              multiline
              value={customText}
              onChangeText={setCustomText}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: activePersona.color }]}
              onPress={handleCustomSpeak}
            >
              <Ionicons name="play" size={18} color="#FFF" />
              <Text style={styles.sendBtnText}>Seslendir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080B14' },
  avatarContainer: {
    height: SCREEN_HEIGHT * 0.44,
    position: 'relative',
  },
  webview: { flex: 1 },
  personaOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(8,11,20,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  personaEmoji: { fontSize: 20 },
  personaName: { fontWeight: '800', fontSize: 14 },
  personaTone: { color: '#64748B', fontSize: 11 },
  speakingDot: {
    width: 10, height: 10, borderRadius: 5, marginLeft: 4,
  },
  speechBubble: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 60,
    maxHeight: 100,
  },
  speechText: { color: '#F1F5F9', fontSize: 15, lineHeight: 24 },
  cursor: { color: '#3B82F6', fontSize: 18, marginLeft: 2 },
  controls: { flex: 1, paddingHorizontal: 16 },
  personaRow: { marginTop: 12, marginBottom: 12 },
  personaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
    marginRight: 10,
  },
  personaChipEmoji: { fontSize: 16 },
  personaChipText: { color: '#94A3B8', fontWeight: '700', fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  speakBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  speakBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  customBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 16, borderRadius: 16,
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
  },
  customBtnText: { color: '#94A3B8', fontWeight: '700', fontSize: 14 },
  infoCard: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  infoTitle: { color: '#F8FAFC', fontWeight: '800', fontSize: 15, marginBottom: 4 },
  infoDesc: { color: '#94A3B8', fontSize: 13, marginBottom: 4 },
  infoVoice: { color: '#64748B', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1E293B', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { color: '#F8FAFC', fontWeight: '800', fontSize: 20 },
  modalSubtitle: { color: '#64748B', fontSize: 13, marginBottom: 16 },
  textInput: {
    backgroundColor: '#334155', borderRadius: 16, padding: 16,
    color: '#F8FAFC', fontSize: 15, minHeight: 100, textAlignVertical: 'top',
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16,
  },
  sendBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});
