import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export default function HomeScreen({ onSubmit }) {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const examples = [
    'Arkadaslarla film izleme deneyimini sosyal hale getiren bir uygulama',
    'Mahalle sakinlerinin birbirine yardim edebilecegi bir platform',
    'Ogrencilerin ders notlarini birlikte organize ettigi bir arac',
  ];

  useEffect(() => {
    return () => {
      if (listening) {
        ExpoSpeechRecognitionModule.stop();
      }
    };
  }, [listening]);

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
    setVoiceError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript?.trim() ?? '';
    if (!transcript) {
      return;
    }

    setVoiceTranscript(transcript);
    setPrompt(transcript);
  });

  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    setVoiceError(event.message || 'Ses tanima basarisiz oldu.');
  });

  const handleSubmit = () => {
    if (prompt.trim().length < 10) return;
    onSubmit(prompt.trim());
  };

  const toggleListening = async () => {
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    setVoiceTranscript('');
    setVoiceError(null);

    const permission =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setVoiceError('Mikrofon veya konusma tanima izni verilmedi.');
      return;
    }

    try {
      ExpoSpeechRecognitionModule.start({
        addsPunctuation: true,
        continuous: false,
        interimResults: true,
        lang: 'tr-TR',
      });
    } catch (error) {
      setListening(false);
      setVoiceError(
        error instanceof Error
          ? error.message
          : 'Ses tanima baslatilamadi.',
      );
    }
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
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => BackHandler.exitApp()}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>Geri</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Track A · Dot Capture</Text>
            </View>
            <Text style={styles.title}>Fikrin nedir?</Text>
            <Text style={styles.subtitle}>
              Ham fikrini yazarak veya sesle anlat, AI ile birlikte netlestirelim.
            </Text>
          </View>

          <View style={[styles.inputCard, isFocused && styles.inputCardFocused]}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Ham Fikir</Text>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  listening ? styles.voiceButtonActive : null,
                ]}
                onPress={toggleListening}
                activeOpacity={0.85}
              >
                <Text style={styles.voiceButtonText}>
                  {listening ? 'Dinliyor' : 'Sesle doldur'}
                </Text>
              </TouchableOpacity>
            </View>

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

          {listening || voiceTranscript ? (
            <View style={styles.voicePanel}>
              <View style={styles.voicePulse}>
                {listening ? <ActivityIndicator color="#6c47ff" /> : null}
              </View>
              <View style={styles.voiceCopy}>
                <Text style={styles.voiceTitle}>
                  {listening ? 'Dinliyorum...' : 'Ses algilandi'}
                </Text>
                <Text style={styles.voiceText}>
                  {voiceTranscript || 'Fikrini konusarak anlatabilirsin.'}
                </Text>
              </View>
            </View>
          ) : null}

          {voiceError ? <Text style={styles.errorText}>{voiceError}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, prompt.trim().length < 10 && styles.btnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={prompt.trim().length < 10}
          >
            <Text style={styles.btnText}>Mukemmellestir</Text>
          </TouchableOpacity>

          <View style={styles.examplesSection}>
            <Text style={styles.examplesTitle}>Ornek fikirler</Text>
            {examples.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exampleChip}
                onPress={() => setPrompt(example)}
                activeOpacity={0.7}
              >
                <Text style={styles.exampleText} numberOfLines={2}>
                  {example}
                </Text>
                <Text style={styles.exampleArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.steps}>
            {['Fikir Gir', 'Sorulari Yanitla', 'Sonucu Al'].map((step, index) => (
              <View key={step} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    index === 0 ? styles.stepDotActive : null,
                  ]}
                >
                  <Text style={styles.stepDotText}>{index + 1}</Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    index === 0 ? styles.stepLabelActive : null,
                  ]}
                >
                  {step}
                </Text>
                {index < 2 ? <Text style={styles.stepLine}>--</Text> : null}
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
  inputHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputLabel: { fontSize: 13, color: '#888', fontWeight: '600' },
  voiceButton: {
    backgroundColor: '#1a1a2e',
    borderColor: '#2a2a4a',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#24145b',
    borderColor: '#6c47ff',
  },
  voiceButtonText: { color: '#d7d4ff', fontSize: 12, fontWeight: '700' },
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

  voicePanel: {
    alignItems: 'center',
    backgroundColor: '#12121f',
    borderColor: '#1e1e3a',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 14,
  },
  voicePulse: {
    alignItems: 'center',
    backgroundColor: '#0a0a1a',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  voiceCopy: { flex: 1 },
  voiceTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 2 },
  voiceText: { color: '#9ca3af', fontSize: 13, lineHeight: 18 },
  errorText: {
    color: '#ff7b7b',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
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
