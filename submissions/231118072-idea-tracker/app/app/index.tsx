import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [productName, setProductName] = useState('');
  const [isFocused, setIsFocused] = useState<'idea' | 'name' | null>(null);

  const canContinue = idea.trim().length >= 20 && productName.trim().length >= 2;

  const handleStart = () => {
    if (!canContinue) return;
    router.push({
      pathname: '/questions',
      params: {
        rawIdea: idea.trim(),
        productName: productName.trim(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>💡</Text>
            </View>
            <Text style={styles.appTitle}>Idea Tracker</Text>
            <Text style={styles.appSubtitle}>
              Ham fikrinden bir dakikada{'\n'}ürün spesifikasyonuna
            </Text>
          </View>

          {/* Steps Indicator */}
          <View style={styles.stepsRow}>
            {['Fikir', 'Sorular', 'Spec'].map((step, i) => (
              <React.Fragment key={step}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepDot, i === 0 && styles.stepDotActive]}>
                    <Text style={[styles.stepNumber, i === 0 && styles.stepNumberActive]}>
                      {i + 1}
                    </Text>
                  </View>
                  <Text style={[styles.stepLabel, i === 0 && styles.stepLabelActive]}>
                    {step}
                  </Text>
                </View>
                {i < 2 && <View style={styles.stepLine} />}
              </React.Fragment>
            ))}
          </View>

          {/* Input: Product Name */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>
              🏷️ Proje / Ürün Adı
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.nameInput,
                isFocused === 'name' && styles.textInputFocused,
              ]}
              placeholder="Örn: QuickList, FocusBuddy, NapTracker..."
              placeholderTextColor="#555570"
              value={productName}
              onChangeText={setProductName}
              onFocus={() => setIsFocused('name')}
              onBlur={() => setIsFocused(null)}
              returnKeyType="next"
              maxLength={40}
            />
          </View>

          {/* Input: Raw Idea */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>
              🌱 Ham Fikrin
              <Text style={styles.inputHint}>  (min. 20 karakter)</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.ideaInput,
                isFocused === 'idea' && styles.textInputFocused,
              ]}
              placeholder={
                'Aklındaki fikri serbest biçimde yaz.\nNe problemi çözüyor, ne hissettiriyor,\nneden böyle bir şey olmalı?'
              }
              placeholderTextColor="#555570"
              multiline
              value={idea}
              onChangeText={setIdea}
              onFocus={() => setIsFocused('idea')}
              onBlur={() => setIsFocused(null)}
              textAlignVertical="top"
              maxLength={600}
            />
            <Text style={styles.charCount}>{idea.length}/600</Text>
          </View>

          {/* Info chips */}
          <View style={styles.chipsRow}>
            {['5 Engineering Sorusu', 'Offline Çalışır', '~5 Dakika'].map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaButton, !canContinue && styles.ctaButtonDisabled]}
            onPress={handleStart}
            activeOpacity={0.8}
            disabled={!canContinue}
          >
            <Text style={styles.ctaText}>Mühendislik Sorularına Geç →</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Veriler yalnızca cihazınızda saklanır
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#1A1A2E',
    borderWidth: 1.5,
    borderColor: '#6C63FF40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 34,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 15,
    color: '#8888AA',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 0,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    borderWidth: 1.5,
    borderColor: '#2A2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555570',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#555570',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#6C63FF',
  },
  stepLine: {
    width: 40,
    height: 1.5,
    backgroundColor: '#2A2A4A',
    marginBottom: 20,
    marginHorizontal: 4,
  },
  inputBlock: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CCCCEE',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  inputHint: {
    fontSize: 12,
    color: '#555570',
    fontWeight: '400',
  },
  textInput: {
    backgroundColor: '#16162A',
    borderWidth: 1.5,
    borderColor: '#2A2A4A',
    borderRadius: 14,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInputFocused: {
    borderColor: '#6C63FF',
    backgroundColor: '#1A1A35',
  },
  nameInput: {
    height: 52,
  },
  ideaInput: {
    height: 140,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 11,
    color: '#444460',
    textAlign: 'right',
    marginTop: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  chip: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2A2A4A',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    color: '#7777AA',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  ctaButtonDisabled: {
    backgroundColor: '#2A2A4A',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerNote: {
    fontSize: 12,
    color: '#444460',
    textAlign: 'center',
  },
});
