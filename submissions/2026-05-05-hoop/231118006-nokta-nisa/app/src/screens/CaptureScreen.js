import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CaptureScreen({ navigation }) {
  const [idea, setIdea] = useState('');
  const charCountColor = idea.length > 10 ? '#6c5ce7' : 'rgba(255,255,255,0.3)';
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    if (idea.trim().length < 5) return;
    navigation.navigate('Questions', { rawIdea: idea.trim() });
  };

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a3e', '#0a0a1a']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.content,
              { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
            </View>
            <Text style={styles.stepLabel}>Adım 1/3 — Noktayı Yakala</Text>

            {/* Main content */}
            <Text style={styles.title}>💡 Fikir Kırıntın</Text>
            <Text style={styles.description}>
              Aklına gelen ham fikri yaz. Bir cümle bile yeterli.{'\n'}
              AI onu yapılandırılmış bir spesifikasyona dönüştürecek.
            </Text>

            {/* Glass card input */}
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Örnek: Fotoğrafları otomatik kategorize eden bir uygulama..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                multiline
                maxLength={500}
                value={idea}
                onChangeText={setIdea}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: charCountColor }]}>
                {idea.length}/500
              </Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={handleNext}
              disabled={idea.trim().length < 5}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  idea.trim().length >= 5
                    ? ['#6c5ce7', '#a29bfe']
                    : ['#333', '#444']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextButton}
              >
                <Text style={styles.nextButtonText}>
                  {idea.trim().length >= 5
                    ? 'Devam Et →'
                    : 'En az 5 karakter gerekli'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepActive: {
    backgroundColor: '#6c5ce7',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 6,
  },
  stepLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 22,
    marginBottom: 24,
  },
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    minHeight: 180,
    marginBottom: 24,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 140,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 8,
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
