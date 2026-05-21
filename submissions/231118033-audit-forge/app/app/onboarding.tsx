/**
 * app/onboarding.tsx — OnboardingScreen
 * Karşılama ekranı. 3 adımlı mini onboarding, "Başla" ile ana ekrana geçiş.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    emoji: '💡',
    title: 'Fikirlerin Burada',
    desc: 'Aklına gelen her fikri anında kaydet. Kaybetme, sonra düşünürsün.',
  },
  {
    emoji: '🗺️',
    title: 'Haritada Keşfet',
    desc: 'Fikirlerin nerede doğduğunu gör. Yerlere bağlı bellek daha güçlü.',
  },
  {
    emoji: '🚀',
    title: 'Ajana Bırak',
    desc: 'Bug gördüğünde 🐛 ikonuna bas, raporla. Agent halleder.',
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      router.replace('/');
    }
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} accessibilityLabel="Atla">
        <Text style={styles.skipText}>Atla</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.emoji}>{current.emoji}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.desc}</Text>
      </View>

      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext} accessibilityLabel="İleri">
        <Text style={styles.nextText}>
          {step < STEPS.length - 1 ? 'İleri →' : 'Başla'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 },
  skipBtn: { alignSelf: 'flex-end', paddingHorizontal: 24, paddingVertical: 8 },
  skipText: { color: '#64748b', fontSize: 15 },
  body: { alignItems: 'center', paddingHorizontal: 32, flex: 1, justifyContent: 'center' },
  emoji: { fontSize: 72, marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: '#e2e8f0', textAlign: 'center', marginBottom: 14 },
  desc: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2d2d4e' },
  dotActive: { backgroundColor: '#6366f1', width: 20 },
  nextBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: width - 48,
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
