import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const [idea, setIdea] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleStart = () => {
    if (!idea.trim()) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      router.push({ pathname: '/interview', params: { idea } });
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#080812', '#0D0B1E', '#080812']} style={StyleSheet.absoluteFill} />

      {/* Arka plan glow efektleri */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Nokta grid deseni */}
      <View style={styles.grid} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Logo + badge */}
          <View style={styles.logoArea}>
            <View style={styles.versionBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.versionText}>v1.0 · AI Powered</Text>
            </View>

            <Text style={styles.logo}>NOKTA</Text>
            <Text style={styles.tagline}>
              Ham fikirleri{'\n'}
              <Text style={styles.taglineAccent}>mühendislik artifact'ine</Text>{'\n'}
              dönüştür.
            </Text>
          </View>

          {/* Input kart */}
          <View style={[styles.inputCard, focused && styles.inputCardFocused]}>
            <View style={styles.inputHeader}>
              <View style={styles.inputIconWrap}>
                <Ionicons name="bulb-outline" size={18} color="#7000FF" />
              </View>
              <Text style={styles.inputLabel}>Fikrini bırak</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Örn: Evdeki atık yağları toplayan bir uygulama..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              multiline
              value={idea}
              onChangeText={setIdea}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <Text style={styles.charCount}>{idea.length} karakter</Text>
          </View>

          {/* Buton */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.button, !idea.trim() && styles.buttonDisabled]}
              onPress={handleStart}
              disabled={!idea.trim()}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={idea.trim() ? ['#8B00FF', '#6000CC'] : ['#2A2A2A', '#1A1A1A']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Zenginleştirmeye Başla</Text>
                <Ionicons name="arrow-forward" size={20} color={idea.trim() ? '#FFF' : '#555'} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Uzman Desteği Butonu */}
          <TouchableOpacity 
            style={styles.expertButton} 
            onPress={() => router.push('/expert')}
            activeOpacity={0.7}
          >
            <Ionicons name="people-circle-outline" size={20} color="#A855F7" />
            <Text style={styles.expertButtonText}>Stratejik Uzman Desteği Al</Text>
          </TouchableOpacity>

          {/* Alt bilgi */}
          <View style={styles.bottomInfo}>
            {['Mühendislik soruları', 'AI analiz', 'Product Spec'].map((s, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{s}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080812' },

  glowTop: {
    position: 'absolute', top: -120, left: '50%', marginLeft: -150,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#6000CC', opacity: 0.18,
  },
  glowBottom: {
    position: 'absolute', bottom: -80, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#003FCC', opacity: 0.12,
  },
  grid: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03,
  },

  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 80, paddingBottom: 40 },

  logoArea: { alignItems: 'center', marginBottom: 48 },

  versionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(112, 0, 255, 0.15)',
    borderWidth: 1, borderColor: 'rgba(112, 0, 255, 0.3)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 24,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A855F7' },
  versionText: { color: '#A855F7', fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  logo: {
    fontSize: 56, fontWeight: '900', color: '#FFFFFF',
    letterSpacing: 12, textAlign: 'center', marginBottom: 16,
  },
  tagline: {
    fontSize: 20, color: 'rgba(255,255,255,0.45)',
    textAlign: 'center', lineHeight: 30,
  },
  taglineAccent: { color: '#A855F7', fontWeight: '700' },

  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  inputCardFocused: {
    borderColor: 'rgba(112, 0, 255, 0.5)',
    backgroundColor: 'rgba(112, 0, 255, 0.05)',
  },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  inputIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(112, 0, 255, 0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  inputLabel: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  input: {
    color: '#FFF', fontSize: 15, minHeight: 110,
    textAlignVertical: 'top', lineHeight: 24,
  },
  charCount: { color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'right', marginTop: 8 },

  button: { borderRadius: 18, overflow: 'hidden', marginBottom: 32 },
  buttonDisabled: { opacity: 0.5 },
  buttonGradient: {
    height: 62, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },

  bottomInfo: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  step: { alignItems: 'center', gap: 8 },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(112, 0, 255, 0.2)',
    borderWidth: 1, borderColor: 'rgba(112, 0, 255, 0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumText: { color: '#A855F7', fontSize: 12, fontWeight: '800' },
  stepText: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '500' },
  expertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 32,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  expertButtonText: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '600',
  },
});
