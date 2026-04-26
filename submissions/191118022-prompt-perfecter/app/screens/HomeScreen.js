import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, BackHandler
} from 'react-native';

export default function HomeScreen({ onSubmit }) {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const examples = [
    'Arkadaşlarla film izleme deneyimini sosyal hale getiren bir uygulama',
    'Mahalle sakinlerinin birbirine yardım edebileceği bir platform',
    'Öğrencilerin ders notlarını birlikte organize ettiği bir araç',
  ];

  const handleSubmit = () => {
    if (prompt.trim().length < 10) return;
    onSubmit(prompt.trim());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar / Back button */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => BackHandler.exitApp()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Geri</Text>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Track A · Dot Capture</Text>
            </View>
            <Text style={styles.title}>Fikrin nedir?</Text>
            <Text style={styles.subtitle}>
              Ham fikrini yaz, AI ile birlikte mükemmel hale getirelim
            </Text>
          </View>

          {/* Input Area */}
          <View style={[styles.inputCard, isFocused && styles.inputCardFocused]}>
            <Text style={styles.inputLabel}>💡 Ham Fikir</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Bir uygulama fikrim var: insanlar..."
              placeholderTextColor="#444"
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={500}
            />
            <Text style={styles.charCount}>{prompt.length}/500</Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.btn, prompt.trim().length < 10 && styles.btnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={prompt.trim().length < 10}
          >
            <Text style={styles.btnText}>🚀  Mükemmelleştir</Text>
          </TouchableOpacity>

          {/* Examples */}
          <View style={styles.examplesSection}>
            <Text style={styles.examplesTitle}>Örnek fikirler</Text>
            {examples.map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={styles.exampleChip}
                onPress={() => setPrompt(ex)}
                activeOpacity={0.7}
              >
                <Text style={styles.exampleText} numberOfLines={2}>{ex}</Text>
                <Text style={styles.exampleArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Steps indicator */}
          <View style={styles.steps}>
            {['Fikir Gir', 'Soruları Yanıtla', 'Sonucu Al'].map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[styles.stepDot, i === 0 && styles.stepDotActive]}>
                  <Text style={styles.stepDotText}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, i === 0 && styles.stepLabelActive]}>
                  {step}
                </Text>
                {i < 2 && <Text style={styles.stepLine}>——</Text>}
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0a1a' },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 35,
  },
  backBtn: { padding: 4 },
  backBtnText: { color: '#888', fontSize: 15 },

  header: { marginBottom: 20, paddingTop: 0 },
  badge: {
    backgroundColor: '#1a1040',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#3a2880',
    marginBottom: 16,
  },
  badgeText: { color: '#9d7fff', fontSize: 12, fontWeight: '600' },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, color: '#666', lineHeight: 22 },

  inputCard: {
    backgroundColor: '#12121f',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#1e1e3a',
    marginBottom: 16,
  },
  inputCardFocused: { borderColor: '#6c47ff' },
  inputLabel: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 10 },
  textArea: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
  },
  charCount: {
    textAlign: 'right',
    color: '#444',
    fontSize: 12,
    marginTop: 8,
  },

  btn: {
    backgroundColor: '#6c47ff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#6c47ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.35, shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  examplesSection: { marginBottom: 32 },
  examplesTitle: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  exampleChip: {
    backgroundColor: '#12121f',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e1e3a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleText: { color: '#aaa', fontSize: 13, flex: 1, lineHeight: 18 },
  exampleArrow: { color: '#555', fontSize: 16, marginLeft: 8 },

  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: '#2a2a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: '#6c47ff', borderColor: '#9d7fff' },
  stepDotText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepLabel: { color: '#444', fontSize: 11, marginHorizontal: 4 },
  stepLabelActive: { color: '#9d7fff' },
  stepLine: { color: '#222', fontSize: 14 },
});
